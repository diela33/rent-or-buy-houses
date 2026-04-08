import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Listing, ListingsService } from '../services/listings.service';

@Component({
  standalone: true,
  selector: 'app-listings',
  imports: [CommonModule, RouterLink],
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.css']
})
export class ListingsComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  private readonly listingsService = inject(ListingsService);
  private readonly destroy$ = new Subject<void>();

  listings: Listing[] = [];
  selectedImage: { url: string; title: string } | null = null;
  isLoading = false;
  loadError = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        if (event.urlAfterRedirects.startsWith('/listings')) {
          this.loadListings();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.loadListings();
  }

  private loadListings(): void {
    this.isLoading = true;
    this.loadError = '';

    this.listingsService.getListings().subscribe({
      next: (listings) => {
        this.listings = listings;
        this.isLoading = false;
      },
      error: () => {
        this.listings = [];
        this.isLoading = false;
        this.loadError = 'Could not load listings right now. Please try again in a moment.';
      }
    });
  }

  isOwner(listing: Listing): boolean {
    return this.authService.currentUser?._id === listing.ownerId;
  }

  openImage(listing: Listing): void {
    this.selectedImage = {
      url: listing.imageUrl,
      title: listing.title
    };
  }

  closeImage(): void {
    this.selectedImage = null;
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = this.listingsService.placeholderImageUrl;
  }

  onDelete(listingId: string): void {
    if (!this.authService.currentUser?._id) {
      this.router.navigate(['/login']);
      return;
    }

    if (!window.confirm('Delete this listing?')) {
      return;
    }

    this.listingsService.deleteListing(listingId).subscribe({
      next: () => this.loadListings()
    });
  }
}