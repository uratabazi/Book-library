export type BookStatus =
  | 'want-to-read'
  | 'currently-reading'
  | 'finished'
  | 'want-to-reread';

export interface Book {
  id: string | number;
  title: string;
  author: string;
  status: BookStatus;
  coverUrl?: string;
  description?: string;
  genre?: string;
  pageCount?: number;
  publicationYear?: number;
  isbn?: string;
  rating?: number; // 1-5
  notes?: string;
  dateAdded: Date;
  dateFinished?: Date;
}
