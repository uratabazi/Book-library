import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex gap-1">
      <ng-container *ngFor="let star of stars; let i = index">
        <span [ngClass]="star <= (rating ?? 0) ? 'text-yellow-500' : 'text-gray-300'">
          {{ star <= (rating ?? 0) ? '★' : '☆' }}
        </span>
      </ng-container>
    </span>
  `,
  styles: [],
})
export class RatingDisplayComponent {
  @Input() rating?: number;
  @Input() maxStars = 5;

  get stars(): number[] {
    return Array.from({ length: this.maxStars }, (_, i) => i + 1);
  }
}
