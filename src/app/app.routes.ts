import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: '',
  },
  {
    path: 'library',
    loadComponent: () =>
      import('./components/book-list/book-list.component').then(
        (m) => m.BookListComponent
      ),
  },
  {
    path: 'books',
    redirectTo: 'library',
  },
  {
    path: 'library/:id',
    loadComponent: () =>
      import('./components/book-details/book-details.component').then(
        (m) => m.BookDetailsComponent
      ),
  },
  {
    path: 'books/:id',
    redirectTo: 'library/:id',
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./components/search/search.component').then(
        (m) => m.SearchComponent
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/book-form/book-form.component').then(
        (m) => m.BookFormComponent
      ),
  },
  {
    path: 'books/add',
    redirectTo: 'add',
  },
  {
    path: 'add/:id',
    loadComponent: () =>
      import('./components/book-form/book-form.component').then(
        (m) => m.BookFormComponent
      ),
  },
  {
    path: 'books/edit/:id',
    redirectTo: 'add/:id',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./components/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
