import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { BookCardComponent } from '../book-card/book-card.component';
import { FilterBarComponent } from '../../shared/filter-bar/filter-bar.component';

interface FilterPreset {
  name: string;
  status?: string;
  genre?: string;
  author?: string;
  sortBy: 'title' | 'dateAdded' | 'rating';
}

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterBarComponent,
    BookCardComponent,
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
})
export class BookListComponent implements OnInit {
  private readonly bookService = inject(BookService);

  filterByStatus?: string;
  filterByGenre?: string;
  filterByAuthor?: string;
  sortBy: 'title' | 'dateAdded' | 'rating' = 'title';
  availableGenres: string[] = [];
  availableAuthors: string[] = [];
  selectedPresetName: string | null = null;

  readonly presets: FilterPreset[] = [
    {
      name: 'Fantasy Focus',
      genre: 'Fantasy',
      sortBy: 'rating',
    },
    {
      name: 'Tolkien Shelf',
      author: 'J.R.R. Tolkien',
      sortBy: 'title',
    },
    {
      name: 'Engineering Queue',
      status: 'currently-reading',
      genre: 'Software Engineering',
      sortBy: 'dateAdded',
    },
    {
      name: '5-Star Library',
      sortBy: 'rating',
    },
  ];

  @Output() bookClick = new EventEmitter<Book>();

  books$: Observable<Book[]> = of([]);
  error: string | null = null;

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.refreshBooks();
  }

  onFiltersChange(filters: { status?: string; genre?: string; sortBy: string }) {
    this.filterByStatus = filters.status;
    this.filterByGenre = filters.genre;
    this.sortBy = filters.sortBy as 'title' | 'dateAdded' | 'rating';
    this.selectedPresetName = null;
    this.refreshBooks();
  }

  applyPreset(preset: FilterPreset): void {
    this.selectedPresetName = preset.name;
    this.filterByStatus = preset.status;
    this.filterByGenre = preset.genre;
    this.filterByAuthor = preset.author;
    this.sortBy = preset.sortBy;
    this.refreshBooks();
  }

  onGenreQuickFilter(genre: string): void {
    this.filterByGenre = this.filterByGenre === genre ? undefined : genre;
    this.selectedPresetName = null;
    this.refreshBooks();
  }

  onAuthorQuickFilter(author: string): void {
    this.filterByAuthor = this.filterByAuthor === author ? undefined : author;
    this.selectedPresetName = null;
    this.refreshBooks();
  }

  clearQuickFilters(): void {
    this.filterByGenre = undefined;
    this.filterByAuthor = undefined;
    this.filterByStatus = undefined;
    this.sortBy = 'title';
    this.selectedPresetName = null;
    this.refreshBooks();
  }

  refreshBooks(): void {
    this.error = null;
    this.books$ = this.bookService.getAllBooks().pipe(
      tap((books: Book[]) => {
        this.availableGenres = [...new Set(
          books
            .map((book: Book) => book.genre?.trim())
            .filter((genre: string | undefined): genre is string => Boolean(genre))
        )].sort((a, b) => a.localeCompare(b));

        this.availableAuthors = [...new Set(
          books
            .map((book: Book) => book.author?.trim())
            .filter((author: string | undefined): author is string => Boolean(author))
        )].sort((a, b) => a.localeCompare(b));
      }),
      map((books: Book[]) => this.applyFiltersAndSort(books)),
      catchError((err: unknown) => {
        this.error = err instanceof Error ? err.message : 'Unable to load books';
        return of([]);
      })
    );
  }

  onBookClick(book: Book) {
    this.bookClick.emit(book);
    this.router.navigate(['/library', book.id], { state: { book } });
  }

  private applyFiltersAndSort(books: Book[]): Book[] {
    let result = [...books];
    if (this.filterByStatus) {
      result = result.filter((b) => b.status === this.filterByStatus);
    }
    if (this.filterByGenre) {
      result = result.filter((b) => b.genre === this.filterByGenre);
    }
    if (this.filterByAuthor) {
      result = result.filter((b) => b.author === this.filterByAuthor);
    }
    if (this.selectedPresetName === '5-Star Library') {
      result = result.filter((b) => (b.rating ?? 0) >= 5);
    }
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'dateAdded':
          return (
            new Date(b.dateAdded).getTime() -
            new Date(a.dateAdded).getTime()
          );
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'title':
        default:
          return a.title.localeCompare(b.title);
      }
    });
    return result;
  }
}
