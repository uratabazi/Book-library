import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Book, BookStatus } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private booksSubject = new BehaviorSubject<Book[]>([]);
  public allBooks$ = this.booksSubject.asObservable();

  constructor() {
    const initial: Book[] = [
      {
        id: Math.random(),
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        status: 'finished',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
        description:
          'Bilbo Baggins is swept into an epic quest to reclaim a dwarven kingdom from Smaug.',
        genre: 'Fantasy',
        pageCount: 310,
        publicationYear: 1937,
        isbn: '9780547928227',
        rating: 5,
        notes: 'A timeless adventure with memorable world-building.',
        dateAdded: new Date('2025-11-10'),
        dateFinished: new Date('2025-11-22'),
      },
      {
        id: Math.random(),
        title: 'Clean Code',
        author: 'Robert C. Martin',
        status: 'currently-reading',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
        description:
          'A practical handbook of agile software craftsmanship focused on maintainable code.',
        genre: 'Software Engineering',
        pageCount: 464,
        publicationYear: 2008,
        isbn: '9780132350884',
        rating: 4,
        notes: 'Revisiting naming, functions, and architecture principles.',
        dateAdded: new Date('2026-01-08'),
      },
      {
        id: Math.random(),
        title: '1984',
        author: 'George Orwell',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
        description:
          'A dystopian classic exploring surveillance, authoritarianism, and freedom.',
        genre: 'Dystopian',
        pageCount: 328,
        publicationYear: 1949,
        isbn: '9780451524935',
        notes: 'Queued for upcoming social-political fiction week.',
        dateAdded: new Date('2026-02-03'),
      },
      {
        id: Math.random(),
        title: 'Angular Up & Running',
        author: 'Shyam Seshadri',
        status: 'finished',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9781491999833-L.jpg',
        description:
          'A practical guide to building modern web applications with Angular.',
        genre: 'Web Development',
        pageCount: 322,
        publicationYear: 2018,
        isbn: '9781491999833',
        rating: 4,
        notes: 'Great refresher on architecture and component patterns.',
        dateAdded: new Date('2025-12-15'),
        dateFinished: new Date('2026-01-04'),
      },
      {
        id: Math.random(),
        title: 'Design Patterns',
        author: 'Erich Gamma, et al.',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg',
        description:
          'Classic catalog of reusable object-oriented software design patterns.',
        genre: 'Software Engineering',
        pageCount: 395,
        publicationYear: 1994,
        isbn: '9780201633610',
        notes: 'Reading plan: 2 patterns per week.',
        dateAdded: new Date('2026-02-18'),
      },
      {
        id: Math.random(),
        title: 'The Fellowship of the Ring',
        author: 'J.R.R. Tolkien',
        status: 'finished',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780547928210-L.jpg',
        description:
          'The first journey in The Lord of the Rings as the Fellowship sets out from Rivendell.',
        genre: 'Fantasy',
        pageCount: 432,
        publicationYear: 1954,
        isbn: '9780547928210',
        rating: 5,
        notes: 'Excellent pacing and character setup for the trilogy.',
        dateAdded: new Date('2025-10-01'),
        dateFinished: new Date('2025-10-16'),
      },
      {
        id: Math.random(),
        title: 'The Two Towers',
        author: 'J.R.R. Tolkien',
        status: 'currently-reading',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780547928203-L.jpg',
        description:
          'The Fellowship is broken and the war for Middle-earth intensifies.',
        genre: 'Fantasy',
        pageCount: 352,
        publicationYear: 1954,
        isbn: '9780547928203',
        rating: 4,
        notes: 'Currently at Helm’s Deep chapters.',
        dateAdded: new Date('2026-02-21'),
      },
      {
        id: Math.random(),
        title: 'Animal Farm',
        author: 'George Orwell',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg',
        description:
          'A satirical novella about power, propaganda, and political corruption.',
        genre: 'Political Satire',
        pageCount: 112,
        publicationYear: 1945,
        isbn: '9780451526342',
        notes: 'Planned companion read with 1984.',
        dateAdded: new Date('2026-02-20'),
      },
      {
        id: Math.random(),
        title: 'Refactoring',
        author: 'Martin Fowler',
        status: 'currently-reading',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780134757599-L.jpg',
        description:
          'Improving existing codebases through disciplined, behavior-preserving transformations.',
        genre: 'Software Engineering',
        pageCount: 448,
        publicationYear: 2018,
        isbn: '9780134757599',
        rating: 5,
        notes: 'Applying techniques to ongoing Angular code cleanup.',
        dateAdded: new Date('2026-01-29'),
      },
      {
        id: Math.random(),
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt, David Thomas',
        status: 'finished',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg',
        description:
          'Practical principles for becoming a more effective and adaptable software developer.',
        genre: 'Software Engineering',
        pageCount: 352,
        publicationYear: 2019,
        isbn: '9780135957059',
        rating: 5,
        notes: 'Excellent mindset and workflow guidance.',
        dateAdded: new Date('2025-09-12'),
        dateFinished: new Date('2025-09-25'),
      },
      {
        id: Math.random(),
        title: 'Dune',
        author: 'Frank Herbert',
        status: 'finished',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
        description:
          'Epic science fiction on politics, prophecy, and survival on Arrakis.',
        genre: 'Science Fiction',
        pageCount: 688,
        publicationYear: 1965,
        isbn: '9780441172719',
        rating: 5,
        notes: 'Deep world-building and timeless themes.',
        dateAdded: new Date('2025-08-04'),
        dateFinished: new Date('2025-08-20'),
      },
      {
        id: Math.random(),
        title: 'Neuromancer',
        author: 'William Gibson',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780441569595-L.jpg',
        description:
          'Cyberpunk classic that shaped modern visions of cyberspace.',
        genre: 'Science Fiction',
        pageCount: 271,
        publicationYear: 1984,
        isbn: '9780441569595',
        notes: 'Queued for cyberpunk mini-readathon.',
        dateAdded: new Date('2026-02-24'),
      },
      {
        id: Math.random(),
        title: 'Foundation',
        author: 'Isaac Asimov',
        status: 'currently-reading',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg',
        description:
          'A galactic saga driven by psychohistory and political strategy.',
        genre: 'Science Fiction',
        pageCount: 296,
        publicationYear: 1951,
        isbn: '9780553293357',
        rating: 4,
        notes: 'Loving the long-range civilization arcs.',
        dateAdded: new Date('2026-02-11'),
      },
      {
        id: Math.random(),
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
        description:
          'A brief history of humankind from cognitive revolution to modernity.',
        genre: 'History',
        pageCount: 443,
        publicationYear: 2011,
        isbn: '9780062316097',
        notes: 'Planning weekend deep-read sessions.',
        dateAdded: new Date('2026-02-26'),
      },
      {
        id: Math.random(),
        title: 'Atomic Habits',
        author: 'James Clear',
        status: 'finished',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
        description:
          'Actionable system for building good habits and breaking bad ones.',
        genre: 'Self-Improvement',
        pageCount: 320,
        publicationYear: 2018,
        isbn: '9780735211292',
        rating: 5,
        notes: 'Applied weekly habit review framework.',
        dateAdded: new Date('2025-07-10'),
        dateFinished: new Date('2025-07-18'),
      },
      {
        id: Math.random(),
        title: 'Deep Work',
        author: 'Cal Newport',
        status: 'currently-reading',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
        description:
          'Focused, distraction-free work as a competitive advantage.',
        genre: 'Productivity',
        pageCount: 304,
        publicationYear: 2016,
        isbn: '9781455586691',
        rating: 4,
        notes: 'Testing time-blocking strategy from chapter 4.',
        dateAdded: new Date('2026-02-05'),
      },
      {
        id: Math.random(),
        title: 'The Return of the King',
        author: 'J.R.R. Tolkien',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780547928197-L.jpg',
        description:
          'Final chapter of The Lord of the Rings and the climax of the War of the Ring.',
        genre: 'Fantasy',
        pageCount: 416,
        publicationYear: 1955,
        isbn: '9780547928197',
        notes: 'Will read right after finishing Two Towers.',
        dateAdded: new Date('2026-02-27'),
      },
      {
        id: Math.random(),
        title: 'The Silmarillion',
        author: 'J.R.R. Tolkien',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780618391110-L.jpg',
        description:
          'Mythic history of Middle-earth from creation to the end of the First Age.',
        genre: 'Fantasy',
        pageCount: 365,
        publicationYear: 1977,
        isbn: '9780618391110',
        notes: 'Long-term lore deep-dive read.',
        dateAdded: new Date('2026-02-28'),
      },
      {
        id: Math.random(),
        title: 'Clean Architecture',
        author: 'Robert C. Martin',
        status: 'currently-reading',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780134494166-L.jpg',
        description:
          'Principles and practices for building maintainable software architectures.',
        genre: 'Software Engineering',
        pageCount: 432,
        publicationYear: 2017,
        isbn: '9780134494166',
        rating: 5,
        notes: 'Applying dependency rule ideas in current Angular app.',
        dateAdded: new Date('2026-01-15'),
      },
      {
        id: Math.random(),
        title: 'Domain-Driven Design',
        author: 'Eric Evans',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780321125217-L.jpg',
        description:
          'Strategic and tactical patterns for modeling complex software domains.',
        genre: 'Software Engineering',
        pageCount: 560,
        publicationYear: 2003,
        isbn: '9780321125217',
        notes: 'Focus on bounded contexts and ubiquitous language.',
        dateAdded: new Date('2026-02-22'),
      },
      {
        id: Math.random(),
        title: 'The Martian',
        author: 'Andy Weir',
        status: 'finished',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780804139021-L.jpg',
        description:
          'An astronaut stranded on Mars fights to survive through science and ingenuity.',
        genre: 'Science Fiction',
        pageCount: 369,
        publicationYear: 2011,
        isbn: '9780804139021',
        rating: 5,
        notes: 'Fast-paced and clever, with a lot of humor.',
        dateAdded: new Date('2025-06-02'),
        dateFinished: new Date('2025-06-10'),
      },
      {
        id: Math.random(),
        title: 'Mistborn: The Final Empire',
        author: 'Brandon Sanderson',
        status: 'currently-reading',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780765311788-L.jpg',
        description:
          'A crew of thieves attempts the impossible in a world ruled by a dark immortal emperor.',
        genre: 'Fantasy',
        pageCount: 541,
        publicationYear: 2006,
        isbn: '9780765311788',
        rating: 5,
        notes: 'Great magic system and high-stakes plotting.',
        dateAdded: new Date('2026-02-12'),
      },
      {
        id: Math.random(),
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg',
        description:
          'A deep dive into two systems of thought and how they shape our decisions.',
        genre: 'Psychology',
        pageCount: 512,
        publicationYear: 2011,
        isbn: '9780374533557',
        notes: 'Planned as a companion read with productivity books.',
        dateAdded: new Date('2026-02-25'),
      },
      {
        id: Math.random(),
        title: 'The Name of the Wind',
        author: 'Patrick Rothfuss',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780756404741-L.jpg',
        description:
          'The legendary Kvothe recounts his life story from gifted child to mythic figure.',
        genre: 'Fantasy',
        pageCount: 662,
        publicationYear: 2007,
        isbn: '9780756404741',
        notes: 'Queued for long-form fantasy weekends.',
        dateAdded: new Date('2026-02-23'),
      },
      {
        id: Math.random(),
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        status: 'currently-reading',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg',
        description:
          'A lone astronaut wakes up with no memory and must save Earth from extinction.',
        genre: 'Science Fiction',
        pageCount: 496,
        publicationYear: 2021,
        isbn: '9780593135204',
        rating: 5,
        notes: 'Very readable with strong problem-solving narrative.',
        dateAdded: new Date('2026-01-27'),
      },
      {
        id: Math.random(),
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        status: 'finished',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
        description:
          'Behavioral lessons on wealth, investing, and decision-making under uncertainty.',
        genre: 'Finance',
        pageCount: 256,
        publicationYear: 2020,
        isbn: '9780857197689',
        rating: 4,
        notes: 'Short and practical; excellent mindset framing.',
        dateAdded: new Date('2025-11-19'),
        dateFinished: new Date('2025-11-24'),
      },
      {
        id: Math.random(),
        title: 'The Way of Kings',
        author: 'Brandon Sanderson',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780765326355-L.jpg',
        description:
          'Epic opening to The Stormlight Archive with war, magic, and shattered worlds.',
        genre: 'Fantasy',
        pageCount: 1007,
        publicationYear: 2010,
        isbn: '9780765326355',
        notes: 'Reserved for extended holiday reading.',
        dateAdded: new Date('2026-02-28'),
      },
      {
        id: Math.random(),
        title: 'Effective TypeScript',
        author: 'Dan Vanderkam',
        status: 'currently-reading',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9781492053749-L.jpg',
        description:
          'Practical guidance for writing robust, maintainable TypeScript in real systems.',
        genre: 'Software Engineering',
        pageCount: 264,
        publicationYear: 2019,
        isbn: '9781492053749',
        rating: 4,
        notes: 'Applying item-by-item tips in this Angular codebase.',
        dateAdded: new Date('2026-01-20'),
      },
      {
        id: Math.random(),
        title: 'The Midnight Library',
        author: 'Matt Haig',
        status: 'finished',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg',
        description:
          'A woman explores alternate lives she could have lived through a mysterious library.',
        genre: 'Contemporary Fiction',
        pageCount: 304,
        publicationYear: 2020,
        isbn: '9780525559474',
        rating: 4,
        notes: 'Reflective, emotional, and easy to finish quickly.',
        dateAdded: new Date('2025-10-08'),
        dateFinished: new Date('2025-10-12'),
      },
      {
        id: Math.random(),
        title: 'The Lean Startup',
        author: 'Eric Ries',
        status: 'want-to-read',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg',
        description:
          'Build-measure-learn framework for rapid product iteration and validated learning.',
        genre: 'Business',
        pageCount: 336,
        publicationYear: 2011,
        isbn: '9780307887894',
        notes: 'Planned read for product strategy month.',
        dateAdded: new Date('2026-02-19'),
      },
    ];

    this.booksSubject.next(initial);
  }

  getAllBooks(): Observable<Book[]> {
    return this.allBooks$;
  }

  getBookById(id: string | number): Observable<Book> {
    const book = this.booksSubject.value.find((b) => this.sameId(b.id, id));
    if (!book) {
      return throwError(() => new Error('Book not found'));
    }
    return of(book);
  }

  getBookSnapshot(id: string | number): Book | undefined {
    return this.booksSubject.value.find((book) => this.sameId(book.id, id));
  }

  addBook(book: Book): Observable<Book> {
    const validationError = this.validateBookForAdd(book);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    const current = this.booksSubject.value;
    const duplicate = current.find((existing) => this.isSameBook(existing, book));

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

      this.booksSubject.next(
        current.map((existing) =>
          existing.id === duplicate.id ? updatedExisting : existing
        )
      );
      return of(updatedExisting);
    }

    const newBook: Book = {
      ...book,
      id: book.id ?? Math.random(),
      dateAdded: book.dateAdded ?? new Date(),
    };
    this.booksSubject.next([...current, newBook]);
    return of(newBook);
  }

  updateBook(id: string | number, book: Book): Observable<Book> {
    const current = this.booksSubject.value;
    const index = current.findIndex((b) => this.sameId(b.id, id));
    if (index === -1) {
      return throwError(() => new Error('Book not found'));
    }
    const updated: Book = { ...current[index], ...book, id };
    current[index] = updated;
    this.booksSubject.next([...current]);
    return of(updated);
  }

  deleteBook(id: string | number): Observable<void> {
    const current = this.booksSubject.value;
    const index = current.findIndex((b) => this.sameId(b.id, id));
    if (index === -1) {
      return throwError(() => new Error('Book not found'));
    }
    const filtered = current.filter((b) => !this.sameId(b.id, id));
    this.booksSubject.next(filtered);
    return of(void 0);
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
