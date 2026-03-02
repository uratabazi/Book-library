import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { Book, BookStatus } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly apiUrl = this.resolveApiUrl();

  private booksSubject = new BehaviorSubject<Book[]>([]);
  public allBooks$ = this.booksSubject.asObservable();

  private loaded = false;
  private loading$?: Observable<Book[]>;

  constructor(private http: HttpClient) {
    this.loadBooks().subscribe();
  }

  private resolveApiUrl(): string {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:3001/books';
      }
    }

    return '/api/books';
  }

  getAllBooks(): Observable<Book[]> {
    return this.loadBooks().pipe(switchMap(() => this.allBooks$));
  }

  getBookById(id: string | number): Observable<Book> {
    return this.getAllBooks().pipe(
      take(1),
      switchMap((books) => {
        const book = books.find((entry) => this.sameId(entry.id, id));
        if (!book) {
          return throwError(() => new Error('Book not found'));
        }
        return of(book);
      })
    );
  }

  getBookSnapshot(id: string | number): Book | undefined {
    return this.booksSubject.value.find((book) => this.sameId(book.id, id));
  }

  addBook(book: Book): Observable<Book> {
    const validationError = this.validateBookForAdd(book);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    return this.getAllBooks().pipe(
      take(1),
      switchMap((currentBooks) => {
        const duplicate = currentBooks.find((existing) => this.isSameBook(existing, book));

        if (duplicate) {
          const nextStatus: BookStatus =
            duplicate.status === 'finished' ? 'want-to-reread' : duplicate.status;

          const updatedExisting: Book = {
            ...duplicate,
            ...book,
            id: duplicate.id,
            dateAdded: duplicate.dateAdded,
            status: nextStatus,
          };

          return this.http
            .put<Book>(`${this.apiUrl}/${duplicate.id}`, this.toPayload(updatedExisting))
            .pipe(
              map((saved) => this.normalizeBook(saved)),
              tap((saved) => {
                this.booksSubject.next(
                  currentBooks.map((existing) =>
                    this.sameId(existing.id, saved.id) ? saved : existing
                  )
                );
              })
            );
        }

        const payload: Omit<Book, 'id'> = {
          ...book,
          dateAdded: book.dateAdded ?? new Date(),
        };

        return this.http.post<Book>(this.apiUrl, this.toPayload(payload)).pipe(
          map((saved) => this.normalizeBook(saved)),
          tap((saved) => {
            this.booksSubject.next([...currentBooks, saved]);
          })
        );
      })
    );
  }

  updateBook(id: string | number, book: Book): Observable<Book> {
    return this.getAllBooks().pipe(
      take(1),
      switchMap((currentBooks) => {
        const existing = currentBooks.find((entry) => this.sameId(entry.id, id));
        if (!existing) {
          return throwError(() => new Error('Book not found'));
        }

        const payload: Book = {
          ...existing,
          ...book,
          id: existing.id,
        };

        return this.http
          .put<Book>(`${this.apiUrl}/${existing.id}`, this.toPayload(payload))
          .pipe(
            map((saved) => this.normalizeBook(saved)),
            tap((saved) => {
              this.booksSubject.next(
                currentBooks.map((entry) =>
                  this.sameId(entry.id, existing.id) ? saved : entry
                )
              );
            })
          );
      })
    );
  }

  deleteBook(id: string | number): Observable<void> {
    return this.getAllBooks().pipe(
      take(1),
      switchMap((currentBooks) => {
        const existing = currentBooks.find((entry) => this.sameId(entry.id, id));
        if (!existing) {
          return throwError(() => new Error('Book not found'));
        }

        return this.http.delete<void>(`${this.apiUrl}/${existing.id}`).pipe(
          tap(() => {
            this.booksSubject.next(
              currentBooks.filter((entry) => !this.sameId(entry.id, existing.id))
            );
          })
        );
      })
    );
  }

  private loadBooks(force = false): Observable<Book[]> {
    if (!force && this.loaded) {
      return of(this.booksSubject.value);
    }

    if (!force && this.loading$) {
      return this.loading$;
    }

    this.loading$ = this.http.get<Book[]>(this.apiUrl).pipe(
      map((books) => books.map((book) => this.normalizeBook(book))),
      tap((books) => {
        this.booksSubject.next(books);
        this.loaded = true;
      }),
      catchError(() => {
        this.booksSubject.next([]);
        this.loaded = true;
        return of([]);
      }),
      finalize(() => {
        this.loading$ = undefined;
      }),
      shareReplay(1)
    );

    return this.loading$;
  }

  private normalizeBook(book: Book): Book {
    return {
      ...book,
      dateAdded: new Date(book.dateAdded),
      dateFinished: book.dateFinished ? new Date(book.dateFinished) : undefined,
    };
  }

  private toPayload<T extends { dateAdded?: Date | string; dateFinished?: Date | string }>(
    book: T
  ): T {
    return {
      ...book,
      dateAdded:
        book.dateAdded instanceof Date ? book.dateAdded.toISOString() : book.dateAdded,
      dateFinished:
        book.dateFinished instanceof Date
          ? book.dateFinished.toISOString()
          : book.dateFinished,
    } as T;
  }

  private isSameBook(existing: Book, incoming: Book): boolean {
    const existingIsbn = existing.isbn?.trim();
    const incomingIsbn = incoming.isbn?.trim();
    if (existingIsbn && incomingIsbn) {
      return existingIsbn === incomingIsbn;
    }

    return (
      this.normalize(existing.title) === this.normalize(incoming.title) &&
      this.normalize(existing.author) === this.normalize(incoming.author)
    );
  }

  private normalize(value: string | undefined): string {
    return value?.trim().toLowerCase() ?? '';
  }

  private sameId(left: string | number, right: string | number): boolean {
    return String(left) === String(right);
  }

  private validateBookForAdd(book: Book): string | null {
    const title = book.title?.trim();
    const author = book.author?.trim();
    const validStatuses: BookStatus[] = [
      'want-to-read',
      'currently-reading',
      'finished',
      'want-to-reread',
    ];

    if (!title || title.toLowerCase() === 'untitled') {
      return 'Book title is required.';
    }

    if (!author || author.toLowerCase() === 'unknown author') {
      return 'Book author is required.';
    }

    if (!/\p{L}/u.test(author) || /^\d+$/u.test(author)) {
      return 'Book author must be valid text.';
    }

    if (!validStatuses.includes(book.status)) {
      return 'Book status is invalid.';
    }

    return null;
  }
}
