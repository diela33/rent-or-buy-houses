import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Listing, ListingsService } from '../services/listings.service';

@Component({
  standalone: true,
  selector: 'app-listing-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-details.component.html',
  styleUrls: ['./listing-details.component.css']
})
export class ListingDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly listingsService = inject(ListingsService);
  private currentListingId: string | null = null;
  private loadStateTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private loadSubscription: Subscription | null = null;
  private fallbackTried = false;
  private readonly selectedListingCacheKey = 'rent-or-buy-selected-listing';

  listing: Listing | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const listingId = this.route.snapshot.paramMap.get('id');

    if (!listingId) {
      this.router.navigate(['/listings']);
      return;
    }

    this.currentListingId = listingId;

    const stateListing = history.state?.listing as Listing | undefined;
    if (stateListing && stateListing.id === listingId) {
      this.listing = stateListing;
      this.isLoading = false;
      this.errorMessage = '';
      this.writeSelectedListingCache(stateListing);
      return;
    }

    const cachedListing = this.readSelectedListingCache();
    if (cachedListing && cachedListing.id === listingId) {
      this.listing = cachedListing;
      this.isLoading = false;
      this.errorMessage = '';
      return;
    }

    if (this.route.snapshot.queryParamMap.has('published')) {
      this.successMessage = 'Listing published successfully.';
    } else if (this.route.snapshot.queryParamMap.has('updated')) {
      this.successMessage = 'Listing updated successfully.';
    }

    this.loadListing(listingId);
  }

  ngOnDestroy(): void {
    this.clearLoadStateTimeout();
    this.clearLoadSubscription();
  }

  get isOwner(): boolean {
    if (!this.listing) {
      return false;
    }

    return this.authService.currentUser?._id === this.listing.ownerId;
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = this.listingsService.placeholderImageUrl;
  }

  onDelete(): void {
    if (!this.listing) {
      return;
    }

    if (!window.confirm('Delete this listing?')) {
      return;
    }

    this.listingsService.deleteListing(this.listing.id).subscribe({
      next: () => {
        this.router.navigate(['/listings']);
      },
      error: () => {
        this.errorMessage = 'Could not delete listing. Please try again.';
      }
    });
  }

  retryLoad(): void {
    if (!this.currentListingId) {
      return;
    }

    this.fallbackTried = false;
    this.loadListing(this.currentListingId);
  }

  private loadListing(id: string): void {
    this.clearLoadSubscription();
    this.isLoading = true;
    this.errorMessage = '';
    this.fallbackTried = false;
    this.scheduleLoadStateTimeout();

    this.loadSubscription = this.listingsService.getListingById(id).subscribe({
      next: (listing) => {
        try {
          if (!listing || typeof listing !== 'object' || !listing.id) {
            this.listing = null;
            this.errorMessage = 'Listing not found or unavailable.';
            return;
          }

          this.listing = listing;
          this.writeSelectedListingCache(listing);
        } finally {
          this.clearLoadStateTimeout();
          this.isLoading = false;
        }
      },
      error: () => {
        this.loadListingFromCollection(id);
      }
    });
  }

  private scheduleLoadStateTimeout(): void {
    this.clearLoadStateTimeout();

    this.loadStateTimeoutId = setTimeout(() => {
      if (!this.isLoading) {
        return;
      }

      if (!this.currentListingId) {
        this.isLoading = false;
        this.listing = null;
        this.errorMessage = 'Loading took too long. Please try again.';
        return;
      }

      this.loadListingFromCollection(this.currentListingId);
    }, 8000);
  }

  private loadListingFromCollection(id: string): void {
    if (this.fallbackTried) {
      this.clearLoadStateTimeout();
      this.listing = null;
      this.errorMessage = 'Listing not found or unavailable.';
      this.isLoading = false;
      return;
    }

    this.fallbackTried = true;
    this.clearLoadSubscription();

    this.loadSubscription = this.listingsService.getListings().subscribe({
      next: (listings) => {
        this.clearLoadStateTimeout();
        const found = listings.find((listing) => listing.id === id) || null;

        if (!found) {
          this.listing = null;
          this.errorMessage = 'Listing not found or unavailable.';
          this.isLoading = false;
          return;
        }

        this.listing = found;
        this.errorMessage = '';
        this.writeSelectedListingCache(found);
        this.isLoading = false;
      },
      error: () => {
        this.clearLoadStateTimeout();
        this.listing = null;
        this.errorMessage = 'Listing not found or unavailable.';
        this.isLoading = false;
      }
    });
  }

  private clearLoadStateTimeout(): void {
    if (this.loadStateTimeoutId === null) {
      return;
    }

    clearTimeout(this.loadStateTimeoutId);
    this.loadStateTimeoutId = null;
  }

  private clearLoadSubscription(): void {
    if (!this.loadSubscription) {
      return;
    }

    this.loadSubscription.unsubscribe();
    this.loadSubscription = null;
  }

  private writeSelectedListingCache(listing: Listing): void {
    try {
      localStorage.setItem(this.selectedListingCacheKey, JSON.stringify(listing));
    } catch {
      // Ignore cache write failures (quota/privacy mode).
    }
  }

  private readSelectedListingCache(): Listing | null {
    const raw = localStorage.getItem(this.selectedListingCacheKey);

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Listing;
      return parsed && parsed.id ? parsed : null;
    } catch {
      return null;
    }
  }
}
