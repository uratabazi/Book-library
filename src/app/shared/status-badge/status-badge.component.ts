import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookStatus } from '../../models/book.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      *ngIf="status"
      class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap"
      [ngClass]="badgeClasses"
    >
      {{ humanText }}
    </span>
  `,
  styles: [],
})
export class StatusBadgeComponent {
  @Input() status?: BookStatus;

  get badgeClasses(): string {
    switch (this.status) {
      case 'want-to-read':
        return 'bg-yellow-100 text-yellow-800';
      case 'currently-reading':
        return 'bg-blue-100 text-blue-800';
      case 'finished':
        return 'bg-green-100 text-green-800';
      case 'want-to-reread':
        return 'bg-purple-100 text-purple-800';
      default:
        return '';
    }
  }

  get humanText(): string {
    switch (this.status) {
      case 'want-to-read':
        return 'Want to Read';
      case 'currently-reading':
        return 'Currently Reading';
      case 'finished':
        return 'Finished';
      case 'want-to-reread':
        return 'Want to Re-read';
      default:
        return '';
    }
  }
}
