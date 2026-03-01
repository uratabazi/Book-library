import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, take, timeout } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  GoogleBooksSearchResult,
  SearchService,
} from '../../services/search.service';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

type SearchItem = NonNullable<GoogleBooksSearchResult['items']>[number];

interface MoodFilter {
  label: string;
  emoji: string;
  query: string;
  scope: 'all' | 'intitle' | 'inauthor' | 'subject';
  sort: 'relevance' | 'newest';
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private readonly defaultPlaceholder = 'e.g. Dune, Tolkien, clean architecture';
  private localResultPool: SearchItem[] = [];
  private showingLocalPool = false;

  readonly moods: MoodFilter[] = [
    {
      label: 'Adventurous',
      emoji: '🗺️',
      query: 'fantasy',
      scope: 'subject',
      sort: 'relevance',
    },
    {
      label: 'Deep Thinking',
      emoji: '🧠',
      query: 'sapiens',
      scope: 'intitle',
      sort: 'relevance',
    },
    {
      label: 'Quick Read',
      emoji: '⚡',
      query: 'animal farm',
      scope: 'intitle',
      sort: 'newest',
    },
    {
      label: 'Career Growth',
      emoji: '📈',
      query: 'atomic habits',
      scope: 'intitle',
      sort: 'newest',
    },
    {
      label: 'Cozy & Calm',
      emoji: '☕',
      query: 'the hobbit',
      scope: 'intitle',
      sort: 'relevance',
    },
  ];

  activeMoodLabel: string | null = null;

  readonly suggestions = [
    'Dune',
    'Tolkien',
    'Clean Architecture',
    'Science Fiction',
    'Atomic Habits',
    'Domain-Driven Design',
  ];

  query = '';
  scope: 'all' | 'intitle' | 'inauthor' | 'subject' = 'all';
  sort: 'relevance' | 'newest' = 'relevance';
  results: SearchItem[] = [];
  loading = false;
  error: string | null = null;
  warning: string | null = null;
  hasSearched = false;

  startIndex = 0;
  readonly maxResults = 10;
  totalItems = 0;
  readonly addedIds = new Set<string>();

  constructor(
    private searchService: SearchService,
    private bookService: BookService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  onSearch(): void {
    const normalizedQuery = this.query.trim();
    if (!normalizedQuery) {
      this.error = 'Enter a title, author, or keyword to search.';
      this.results = [];
      this.hasSearched = true;
      return;
    }

    if (normalizedQuery.length < 2) {
      this.error = 'Type at least 2 characters to search.';
      this.results = [];
      this.hasSearched = true;
      return;
    }

    this.loading = true;
    this.error = null;
    this.warning = null;
    this.hasSearched = true;
    this.showingLocalPool = false;
    this.localResultPool = [];

    this.bookService
      .getAllBooks()
      .pipe(take(1))
      .subscribe((books) => {
        const localFiltered = this.searchLocalBooks(books, normalizedQuery, this.scope);
        const localSorted = this.sortLocalBooks(localFiltered, normalizedQuery, this.scope);
        this.localResultPool = localSorted.map((book) => this.toSearchItem(book));
        this.totalItems = this.localResultPool.length;
        this.showingLocalPool = true;
        this.applyLocalPage();
        this.warning = this.localResultPool.length
          ? 'Showing instant matches from your library. Refreshing with Google Books…'
          : 'Searching Google Books…';

        this.refreshWithApiResults(normalizedQuery);
      });
  }

  applySuggestion(term: string): void {
    this.activeMoodLabel = null;
    this.query = term;
    const scope: 'all' | 'intitle' | 'inauthor' | 'subject' =
      term === 'Tolkien' ? 'inauthor' : term === 'Science Fiction' ? 'subject' : 'all';
    this.runLibraryQuickSearch(term, scope);
  }

  surpriseMe(): void {
    this.activeMoodLabel = null;
    this.bookService
      .getAllBooks()
      .pipe(take(1))
      .subscribe((books) => {
        if (!books.length) {
          this.error = 'Your library is empty. Add a few books first.';
          this.results = [];
          this.totalItems = 0;
          this.hasSearched = true;
          return;
        }

        const randomBook = books[Math.floor(Math.random() * books.length)];
        this.query = randomBook.title;
        this.runLibraryQuickSearch(this.query, 'intitle');
      });
  }

  applyMood(mood: MoodFilter): void {
    this.activeMoodLabel = mood.label;
    this.query = mood.query;
    this.scope = mood.scope;
    this.sort = mood.sort;
    this.runLibraryQuickSearch(mood.query, mood.scope);
  }

  onNewSearch(): void {
    this.startIndex = 0;
    this.onSearch();
  }

  nextPage(): void {
    if (!this.canGoNext) {
      return;
    }
    this.startIndex += this.maxResults;
    if (this.showingLocalPool) {
      this.applyLocalPage();
      return;
    }
    this.onSearch();
  }

  prevPage(): void {
    if (!this.canGoPrev) {
      return;
    }
    this.startIndex = Math.max(0, this.startIndex - this.maxResults);
    if (this.showingLocalPool) {
      this.applyLocalPage();
      return;
    }
    this.onSearch();
  }

  addToLibrary(item: SearchItem): void {
    this.addToLibraryInternal(item, false);
  }

  openBookDetails(item: SearchItem): void {
    this.bookService
      .getAllBooks()
      .pipe(take(1))
      .subscribe((books) => {
        const existing = this.findMatchingBook(books, item);
        if (existing) {
          this.goToDetails(existing.id, existing);
          return;
        }

        this.addToLibraryInternal(item, true);
      });
  }

  private addToLibraryInternal(item: SearchItem, navigateAfterAdd: boolean): void {
    const volume = item.volumeInfo;

    if (!volume.title?.trim()) {
      this.snackBar.open('This result has no valid title and cannot be added.', 'Close', {
        duration: 2400,
      });
      return;
    }

    const firstAuthor = volume.authors?.[0]?.trim();
    if (!firstAuthor) {
      this.snackBar.open('This result has no valid author and cannot be added.', 'Close', {
        duration: 2400,
      });
      return;
    }

    const publicationYear = Number.parseInt(volume.publishedDate?.slice(0, 4) ?? '', 10);

    const book: Book = {
      id: item.id,
      title: volume.title,
      author: volume.authors?.join(', ') ?? firstAuthor,
      status: 'want-to-read',
      coverUrl: volume.imageLinks?.thumbnail ?? volume.imageLinks?.smallThumbnail,
      description: volume.description,
      genre: volume.categories?.[0],
      pageCount: volume.pageCount,
      publicationYear: Number.isFinite(publicationYear) ? publicationYear : undefined,
      isbn: volume.industryIdentifiers?.[0]?.identifier,
      dateAdded: new Date(),
    };

    this.bookService.addBook(book).subscribe({
      next: (savedBook) => {
        this.addedIds.add(item.id);
        const message =
          savedBook.status === 'want-to-reread'
            ? 'Book already existed and is now marked as Want to Re-read.'
            : 'Book added to your library.';
        this.snackBar.open(message, 'Close', { duration: 2400 });
        if (navigateAfterAdd) {
          this.goToDetails(savedBook.id, savedBook);
        }
      },
      error: (err) => {
        this.snackBar.open(err?.message || 'Could not add book.', 'Close', { duration: 2400 });
      },
    });
  }

  private goToDetails(id: string | number, book?: Book): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/library', id], { state: book ? { book } : undefined });
  }

  private findMatchingBook(books: Book[], item: SearchItem): Book | undefined {
    const volume = item.volumeInfo;
    const resultTitle = volume.title?.trim().toLowerCase() ?? '';
    const resultAuthor = volume.authors?.[0]?.trim().toLowerCase() ?? '';
    const resultIsbn = volume.industryIdentifiers?.[0]?.identifier?.trim();

    return books.find((book) => {
      if (
        resultIsbn &&
        book.isbn?.trim() &&
        book.isbn.trim() === resultIsbn
      ) {
        return true;
      }

      const bookTitle = book.title.trim().toLowerCase();
      const bookAuthor = book.author.trim().toLowerCase();
      return bookTitle === resultTitle && bookAuthor.includes(resultAuthor);
    });
  }

  get canGoPrev(): boolean {
    return this.startIndex > 0 && !this.loading;
  }

  get canGoNext(): boolean {
    return this.startIndex + this.maxResults < this.totalItems && !this.loading;
  }

  get currentRangeEnd(): number {
    return Math.min(this.startIndex + this.results.length, this.totalItems);
  }

  get queryPlaceholder(): string {
    if (!this.activeMoodLabel) {
      return this.defaultPlaceholder;
    }

    return `Mood: ${this.activeMoodLabel} — try "${this.query}"`;
  }

  private buildApiQuery(raw: string): string {
    return this.scope === 'all' ? raw : `${this.scope}:${raw}`;
  }

  private runLibraryQuickSearch(
    rawQuery: string,
    scope: 'all' | 'intitle' | 'inauthor' | 'subject'
  ): void {
    const normalizedQuery = rawQuery.trim();
    if (!normalizedQuery) {
      this.error = 'Enter a title, author, or keyword to search.';
      this.results = [];
      this.totalItems = 0;
      this.hasSearched = true;
      return;
    }

    this.loading = false;
    this.error = null;
    this.hasSearched = true;
    this.startIndex = 0;

    this.bookService
      .getAllBooks()
      .pipe(take(1))
      .subscribe((books) => {
        const filtered = this.searchLocalBooks(books, normalizedQuery, scope);
        const sorted = this.sortLocalBooks(filtered, normalizedQuery, scope);

        this.localResultPool = sorted.map((book) => this.toSearchItem(book));
        this.totalItems = this.localResultPool.length;
        this.showingLocalPool = true;
        this.warning =
          'Instant mode: showing matches from your library for faster discovery.';
        this.applyLocalPage();

        if (!this.localResultPool.length) {
          this.error = 'No matching books found in your library for this quick search.';
        }
      });
  }

  private applyLocalPage(): void {
    const start = this.startIndex;
    const end = start + this.maxResults;
    this.results = this.localResultPool.slice(start, end);
  }

  private refreshWithApiResults(normalizedQuery: string): void {
    this.searchService
      .searchBooks(
        this.buildApiQuery(normalizedQuery),
        this.startIndex,
        this.maxResults,
        this.sort
      )
      .pipe(
        timeout(10000),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (response) => {
          const apiItems = response.items ?? [];
          if (apiItems.length > 0) {
            this.results = apiItems;
            this.totalItems = response.totalItems ?? apiItems.length;
            this.showingLocalPool = false;
            this.warning = null;
            return;
          }

          if (!this.localResultPool.length) {
            this.error = 'No results found. Try a broader keyword.';
            this.warning = null;
          }
        },
        error: () => {
          this.fallbackToLocalResults(normalizedQuery);
        },
      });
  }

  private searchLocalBooks(
    books: Book[],
    query: string,
    scope: 'all' | 'intitle' | 'inauthor' | 'subject'
  ): Book[] {
    const normalized = query.trim().toLowerCase();
    return books.filter((book) => {
      const title = book.title.toLowerCase();
      const author = book.author.toLowerCase();
      const genre = book.genre?.toLowerCase() ?? '';

      if (scope === 'intitle') {
        return title.includes(normalized);
      }

      if (scope === 'inauthor') {
        return author.includes(normalized);
      }

      if (scope === 'subject') {
        return genre.includes(normalized);
      }

      return title.includes(normalized) || author.includes(normalized) || genre.includes(normalized);
    });
  }

  private sortLocalBooks(
    books: Book[],
    query: string,
    scope: 'all' | 'intitle' | 'inauthor' | 'subject'
  ): Book[] {
    if (this.sort === 'newest') {
      return [...books].sort((a, b) => {
        const aYear = a.publicationYear ?? 0;
        const bYear = b.publicationYear ?? 0;
        if (aYear !== bYear) {
          return bYear - aYear;
        }

        const aAdded = new Date(a.dateAdded).getTime();
        const bAdded = new Date(b.dateAdded).getTime();
        return bAdded - aAdded;
      });
    }

    const normalized = query.trim().toLowerCase();
    return [...books].sort((a, b) =>
      this.getRelevanceScore(b, normalized, scope) - this.getRelevanceScore(a, normalized, scope)
    );
  }

  private getRelevanceScore(
    book: Book,
    query: string,
    scope: 'all' | 'intitle' | 'inauthor' | 'subject'
  ): number {
    const title = book.title.toLowerCase();
    const author = book.author.toLowerCase();
    const genre = book.genre?.toLowerCase() ?? '';

    const scoreField = (value: string): number => {
      if (!value) {
        return 0;
      }
      if (value === query) {
        return 120;
      }
      if (value.startsWith(query)) {
        return 90;
      }
      if (value.includes(query)) {
        return 70;
      }
      return 0;
    };

    if (scope === 'intitle') {
      return scoreField(title);
    }

    if (scope === 'inauthor') {
      return scoreField(author);
    }

    if (scope === 'subject') {
      return scoreField(genre);
    }

    return scoreField(title) * 2 + scoreField(author) * 1.5 + scoreField(genre);
  }

  private fallbackToLocalResults(query: string): void {
    this.bookService
      .getAllBooks()
      .pipe(take(1))
      .subscribe((books) => {
        const filtered = this.searchLocalBooks(books, query, this.scope);
        const sorted = this.sortLocalBooks(filtered, query, this.scope);

        this.results = sorted.map((book) => this.toSearchItem(book));
        this.totalItems = this.results.length;
        this.localResultPool = this.results;
        this.showingLocalPool = true;
        this.warning = 'Google Books is currently unavailable. Showing matches from your library.';
        if (!this.results.length) {
          this.error = 'Search failed and no local matches were found.';
        }
      });
  }

  private toSearchItem(book: Book): SearchItem {
    return {
      id: String(book.id),
      volumeInfo: {
        title: book.title,
        authors: [book.author],
        publishedDate: book.publicationYear?.toString(),
        description: book.description,
        industryIdentifiers: book.isbn
          ? [{ type: 'ISBN', identifier: book.isbn }]
          : undefined,
        pageCount: book.pageCount,
        categories: book.genre ? [book.genre] : undefined,
        imageLinks: book.coverUrl ? { thumbnail: book.coverUrl } : undefined,
      },
    };
  }
}
