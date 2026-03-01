import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoogleBooksSearchResult {
  kind: string;
  totalItems: number;
  items?: Array<{
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      publisher?: string;
      publishedDate?: string;
      description?: string;
      industryIdentifiers?: Array<{ type: string; identifier: string }>;
      pageCount?: number;
      categories?: string[];
      imageLinks?: { thumbnail?: string; smallThumbnail?: string };
      language?: string;
      previewLink?: string;
      infoLink?: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly apiUrl = 'https://www.googleapis.com/books/v1/volumes';

  constructor(private http: HttpClient) {}

  searchBooks(
    query: string,
    startIndex: number = 0,
    maxResults: number = 10,
    orderBy: 'relevance' | 'newest' = 'relevance'
  ): Observable<GoogleBooksSearchResult> {
    const params = new HttpParams()
      .set('q', query)
      .set('startIndex', startIndex.toString())
      .set('maxResults', maxResults.toString())
      .set('orderBy', orderBy);

    return this.http.get<GoogleBooksSearchResult>(this.apiUrl, { params });
  }
}
