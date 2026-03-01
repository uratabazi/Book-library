import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { RatingDisplayComponent } from '../../shared/rating-display/rating-display.component';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    CommonModule,
    StatusBadgeComponent,
    RatingDisplayComponent,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss'],
})
export class BookDetailsComponent implements OnInit {
  book$!: Observable<Book | null>;
  loading = true;
  error: string | null = null;
  private id?: string | number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.id) {
      const routeStateBook = history.state?.['book'] as Book | undefined;
      if (routeStateBook && String(routeStateBook.id) === String(this.id)) {
        this.book$ = of(routeStateBook);
        this.loading = false;
        return;
      }

      const snapshotBook = this.bookService.getBookSnapshot(this.id);
      if (snapshotBook) {
        this.book$ = of(snapshotBook);
        this.loading = false;
        return;
      }

      this.book$ = this.bookService.getBookById(this.id).pipe(
        take(1),
        tap(() => (this.loading = false)),
        catchError((err) => {
          this.error = err?.message || 'Could not load book';
          this.loading = false;
          return of(null);
        })
      );
    } else {
      this.error = 'No book id provided';
      this.book$ = of(null);
      this.loading = false;
    }
  }

  onEdit(): void {
    if (this.id) {
      this.router.navigate(['/add', this.id]);
    }
  }

  onDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm' && this.id) {
        this.bookService.deleteBook(this.id).subscribe({
          next: () => this.router.navigate(['/library']),
          error: (err) => (this.error = err?.message || 'Delete failed'),
        });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/library']);
  }
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h1 mat-dialog-title>Delete book?</h1>
    <div mat-dialog-content>Are you sure you want to delete this book?</div>
    <div mat-dialog-actions class="flex justify-end gap-2">
      <button mat-button mat-dialog-close="cancel">Cancel</button>
      <button mat-button color="warn" [mat-dialog-close]="'confirm'">Delete</button>
    </div>
  `,
})
export class ConfirmDialogComponent {}
