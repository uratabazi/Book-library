import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookService } from '../../services/book.service';
import { StatsService } from '../../services/stats.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  readonly stats$: Observable<{
    totalBooks: number;
    wantToRead: number;
    currentlyReading: number;
    finished: number;
    averageRating: number;
    completionRate: number;
  }>;

  readonly features = [
    {
      title: 'Smart Tracking',
      description:
        'Track your reading journey with clear statuses and useful metadata.',
    },
    {
      title: 'Fast Discovery',
      description:
        'Search Google Books and add titles directly to your personal library.',
    },
    {
      title: 'Actionable Insights',
      description:
        'Dashboard metrics show progress, completion rate, and reading momentum.',
    },
  ];

  readonly siteMap = [
    {
      title: 'Dashboard',
      description: 'Track totals, statuses, completion rate, and reading momentum.',
      route: '/',
      cta: 'Open Dashboard',
      emoji: '📊',
    },
    {
      title: 'Library',
      description: 'Browse your collection, filter by status/genre, and sort quickly.',
      route: '/library',
      cta: 'Open Library',
      emoji: '📚',
    },
    {
      title: 'Search',
      description: 'Discover books from Google Books and add them to your library.',
      route: '/search',
      cta: 'Open Search',
      emoji: '🔎',
    },
    {
      title: 'Add Book',
      description: 'Create a new entry with validation and status tracking.',
      route: '/add',
      cta: 'Add New Book',
      emoji: '➕',
    },
    {
      title: 'Book Details',
      description: 'Open any book from Library to view full details and actions.',
      route: '/library',
      cta: 'Browse Details',
      emoji: '🧾',
    },
    {
      title: 'About',
      description: 'Read product highlights, roadmap, and architecture overview.',
      route: '/about',
      cta: 'You are here',
      emoji: '✨',
    },
  ];

  constructor(
    private bookService: BookService,
    private statsService: StatsService
  ) {
    this.stats$ = this.bookService
      .getAllBooks()
      .pipe(map((books) => this.statsService.getStats(books)));
  }
}
