import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookStatus } from '../../models/book.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-grid">
      <div class="filter-item">
        <label class="block text-xs font-medium">Status</label>
        <select
          class="p-2 border rounded form-select w-full"
          [(ngModel)]="selectedStatus"
          (change)="emitChange()"
        >
          <option value="">All</option>
          <option *ngFor="let s of availableStatuses" [value]="s">
            {{
              s === 'want-to-read'
                ? 'Want to Read'
                : s === 'currently-reading'
                ? 'Currently Reading'
                : s === 'want-to-reread'
                ? 'Want to Re-read'
                : 'Finished'
            }}
          </option>
        </select>
      </div>

      <div class="filter-item">
        <label class="block text-xs font-medium">Genre</label>
        <select
          class="p-2 border rounded form-select w-full"
          [(ngModel)]="selectedGenre"
          (change)="emitChange()"
        >
          <option value="">All</option>
          <option *ngFor="let g of availableGenres" [value]="g">{{ g }}</option>
        </select>
      </div>

      <div class="filter-item">
        <label class="block text-xs font-medium">Sort by</label>
        <select
          class="p-2 border rounded form-select w-full"
          [(ngModel)]="selectedSort"
          (change)="emitChange()"
        >
          <option value="title">Title</option>
          <option value="dateAdded">Date Added</option>
          <option value="rating">Rating</option>
        </select>
      </div>
    </div>
  `,
  styles: [
    `
      .filter-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        align-items: end;
      }

      .filter-item label {
        margin-bottom: 0.3rem;
        color: #334155;
      }

      @media (max-width: 700px) {
        .filter-grid {
          grid-template-columns: 1fr;
          gap: 0.55rem;
        }
      }

      @media (max-width: 375px) {
        .filter-grid {
          gap: 0.45rem;
        }

        .filter-item label {
          font-size: 0.72rem;
        }

        .filter-item .form-select {
          min-height: 38px;
          font-size: 0.85rem;
        }
      }
    `,
  ],
})
export class FilterBarComponent {
  @Input() availableStatuses: BookStatus[] = [
    'want-to-read',
    'currently-reading',
    'finished',
  ];

  @Input() availableGenres: string[] = [];

  @Output() filtersChange = new EventEmitter<{
    status?: string;
    genre?: string;
    sortBy: string;
  }>();

  selectedStatus = '';
  selectedGenre = '';
  selectedSort: 'title' | 'dateAdded' | 'rating' = 'title';

  emitChange() {
    this.filtersChange.emit({
      status: this.selectedStatus || undefined,
      genre: this.selectedGenre || undefined,
      sortBy: this.selectedSort,
    });
  }
}
