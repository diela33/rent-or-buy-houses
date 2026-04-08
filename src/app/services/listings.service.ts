import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type ListingType = 'Rent' | 'Buy';

export interface Listing {
  id: string;
  title: string;
  city: string;
  type: ListingType;
  price: number;
  imageUrl: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  description: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
}

export interface ListingInput {
  title: string;
  city: string;
  type: ListingType;
  price: number;
  imageUrl: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private readonly apiUrl = `${environment.apiBaseUrl}/listings`;
  private readonly authOptions = { withCredentials: true };
  private readonly placeholderImage = '/images/listing-placeholder.svg';

  constructor(private http: HttpClient) {}

  get placeholderImageUrl(): string {
    return this.placeholderImage;
  }

  getListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(this.apiUrl, this.authOptions);
  }

  getListingById(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`, this.authOptions);
  }

  getMyListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}/mine`, this.authOptions);
  }

  createListing(input: ListingInput): Observable<Listing> {
    return this.http.post<Listing>(this.apiUrl, input, this.authOptions).pipe(
      timeout(10000)
    );
  }

  updateListing(id: string, input: ListingInput): Observable<Listing> {
    return this.http.put<Listing>(`${this.apiUrl}/${id}`, input, this.authOptions).pipe(
      timeout(10000)
    );
  }

  deleteListing(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, this.authOptions);
  }
}