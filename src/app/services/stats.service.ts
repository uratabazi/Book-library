import { Injectable } from '@angular/core';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  getStats(books: Book[]) {
    const totalBooks = books.length;
    const wantToRead = books.filter((book) => book.status === 'want-to-read').length;
    const currentlyReading = books.filter((book) => book.status === 'currently-reading').length;
    const finished = books.filter((book) => book.status === 'finished').length;
    const wantToReread = books.filter((book) => book.status === 'want-to-reread').length;

    const ratedBooks = books.filter((book) => typeof book.rating === 'number');
    const averageRating = ratedBooks.length
      ? ratedBooks.reduce((total, book) => total + (book.rating ?? 0), 0) / ratedBooks.length
      : 0;

    const completionRate = totalBooks ? (finished / totalBooks) * 100 : 0;

    return {
      totalBooks,
      wantToRead,
      currentlyReading,
      finished,
      wantToReread,
      averageRating,
      completionRate,
    };
  }

  getRecentlyAdded(books: Book[], limit: number = 4): Book[] {
    return [...books]
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, limit);
  }

  getTopRated(books: Book[], limit: number = 4): Book[] {
    return [...books]
      .filter((book) => typeof book.rating === 'number')
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, limit);
  }
}
