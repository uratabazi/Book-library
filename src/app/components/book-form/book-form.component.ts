import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatSnackBarModule,
  ],
  templateUrl: './book-form.component.html',
  styles: [],
})
export class BookFormComponent implements OnInit {
  private readonly containsLetterRegex = /\p{L}/u;

  form!: FormGroup;
  id?: string | number;
  mode: 'add' | 'edit' = 'add';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || undefined;
    this.mode = this.id ? 'edit' : 'add';

    this.buildForm();

    if (this.id) {
      this.bookService.getBookById(this.id).subscribe({
        next: (book) => {
          this.form.patchValue(book);
        },
        error: () => {
          this.router.navigate(['/library']);
        },
      });
    }
  }

  buildForm(): void {
    const currentYear = new Date().getFullYear();
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      author: [
        '',
        [
          Validators.required,
          this.mustContainLetter('Author must contain letters.'),
          this.mustNotBeNumericOnly('Author cannot be numbers only.'),
        ],
      ],
      status: ['', Validators.required],
      genre: [
        '',
        [
          this.optionalMustContainLetter('Genre must include letters.'),
          this.optionalMustNotBeNumericOnly('Genre cannot be numbers only.'),
        ],
      ],
      pageCount: [null, Validators.min(1)],
      publicationYear: [null, [Validators.min(1000), Validators.max(currentYear)]],
      isbn: ['', Validators.pattern(/^\d{10}(\d{3})?$/)],
      coverUrl: ['', Validators.pattern(/https?:\/\/.+/)],
      rating: [null, [Validators.min(1), Validators.max(5)]],
      notes: [''],
    });
  }

  get title(): AbstractControl | null {
    return this.form.get('title');
  }
  get author(): AbstractControl | null {
    return this.form.get('author');
  }
  get status(): AbstractControl | null {
    return this.form.get('status');
  }
  get genre(): AbstractControl | null {
    return this.form.get('genre');
  }
  get pageCount(): AbstractControl | null {
    return this.form.get('pageCount');
  }
  get isbn(): AbstractControl | null {
    return this.form.get('isbn');
  }
  get rating(): AbstractControl | null {
    return this.form.get('rating');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const book: Book = this.form.value;
    const obs = this.id
      ? this.bookService.updateBook(this.id, book)
      : this.bookService.addBook(book);

    obs.subscribe({
      next: () => {
        this.snackBar.open(
          `Book ${this.mode === 'add' ? 'added' : 'updated'} successfully`,
          'Close',
          { duration: 2000 }
        );
        this.router.navigate(['/library']);
      },
      error: (err) => {
        this.snackBar.open(err?.message || 'Operation failed', 'Close');
      },
    });
  }

  private mustContainLetter(message: string): ValidatorFn {
    return (control: AbstractControl) => {
      const value = String(control.value ?? '').trim();
      if (!value) {
        return null;
      }
      return this.containsLetterRegex.test(value) ? null : { mustContainLetter: message };
    };
  }

  private mustNotBeNumericOnly(message: string): ValidatorFn {
    return (control: AbstractControl) => {
      const value = String(control.value ?? '').trim();
      if (!value) {
        return null;
      }
      return /^\d+$/.test(value) ? { numericOnly: message } : null;
    };
  }

  private optionalMustContainLetter(message: string): ValidatorFn {
    return (control: AbstractControl) => {
      const value = String(control.value ?? '').trim();
      if (!value) {
        return null;
      }
      return this.containsLetterRegex.test(value) ? null : { optionalMustContainLetter: message };
    };
  }

  private optionalMustNotBeNumericOnly(message: string): ValidatorFn {
    return (control: AbstractControl) => {
      const value = String(control.value ?? '').trim();
      if (!value) {
        return null;
      }
      return /^\d+$/.test(value) ? { optionalNumericOnly: message } : null;
    };
  }
}
