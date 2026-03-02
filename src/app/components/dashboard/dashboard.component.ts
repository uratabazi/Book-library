import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookService } from '../../services/book.service';
import { StatsService } from '../../services/stats.service';
import { BookCardComponent } from '../book-card/book-card.component';
import { Book } from '../../models/book.model';

interface DashboardViewModel {
  stats: {
    totalBooks: number;
    wantToRead: number;
    currentlyReading: number;
    finished: number;
    wantToReread: number;
    averageRating: number;
    completionRate: number;
  };
  goal: {
    yearlyTarget: number;
    currentFinished: number;
    progressPercent: number;
  };
  recentlyAdded: Book[];
  topRated: Book[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BookCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly bookService = inject(BookService);

  readonly vm$: Observable<DashboardViewModel>;

  constructor(
    private statsService: StatsService,
    private router: Router
  ) {
    this.vm$ = this.bookService.getAllBooks().pipe(
      map((books) => ({
        stats: this.statsService.getStats(books),
        goal: {
          yearlyTarget: 12,
          currentFinished: books.filter((book) => book.status === 'finished').length,
          progressPercent: Math.min(
            100,
            (books.filter((book) => book.status === 'finished').length / 12) * 100
          ),
        },
        recentlyAdded: this.statsService.getRecentlyAdded(books, 4),
        topRated: this.statsService.getTopRated(books, 4),
      }))
    );
  }

  onBookClick(book: Book): void {
    this.router.navigate(['/library', book.id], { state: { book } });
  }
}
