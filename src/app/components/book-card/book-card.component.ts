import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../models/book.model';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { RatingDisplayComponent } from '../../shared/rating-display/rating-display.component';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, RatingDisplayComponent],
  template: `
    <div
      class="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
      [class.cursor-pointer]="clickable"
      (click)="handleClick()"
    >
      <img
        *ngIf="book.coverUrl"
        [src]="book.coverUrl"
        [alt]="book.title"
        class="w-full h-48 object-cover"
      />
      <div class="p-3">
        <h2 class="font-bold text-lg">{{ book.title }}</h2>
        <p class="text-sm text-gray-600">{{ book.author }}</p>
        <app-status-badge
          *ngIf="showStatusBadge"
          [status]="book.status"
        ></app-status-badge>
        <app-rating-display
          *ngIf="showRatingStars && book.rating"
          [rating]="book.rating"
        ></app-rating-display>
      </div>
    </div>
  `,
  styles: [],
})
export class BookCardComponent {
  @Input() book!: Book;
  @Input() showStatusBadge = true;
  @Input() showRatingStars = true;
  @Input() clickable = false;
  @Output() click = new EventEmitter<Book>();

  handleClick() {
    if (this.clickable) {
      this.click.emit(this.book);
    }
  }
}
