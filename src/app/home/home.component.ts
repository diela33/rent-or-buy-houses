import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Listing, ListingsService } from '../services/listings.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly listingsService = inject(ListingsService);
  private readonly router = inject(Router);
  private navigateTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private loadStateTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly listingsCacheKey = 'rent-or-buy-listings-cache';

  latestListings: Listing[] = this.readLatestFromCache();
  isLoading = this.latestListings.length === 0;
  loadError = '';

  ngOnInit(): void {
    this.refreshLatestListings();
  }

  ngOnDestroy(): void {
    this.clearNavigateTimeout();
    this.clearLoadStateTimeout();
  }

  private refreshLatestListings(): void {
    if (this.latestListings.length === 0) {
      this.isLoading = true;
    }

    this.loadError = '';
    this.scheduleLoadStateTimeout();

    this.listingsService.getListings().subscribe({
      next: (listings) => {
        try {
          const normalized = Array.isArray(listings) ? listings : [];
          this.latestListings = normalized.slice(0, 5);
          this.writeListingsCache(normalized);
        } finally {
          this.clearLoadStateTimeout();
          this.isLoading = false;
        }
      },
      error: () => {
        this.clearLoadStateTimeout();
        if (this.latestListings.length === 0) {
          this.loadError = 'Could not load latest listings right now.';
        }
        this.isLoading = false;
      }
    });
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = this.listingsService.placeholderImageUrl;
  }

  openListingDetails(listing: Listing): void {
    if (!listing?.id) {
      return;
    }

    this.clearNavigateTimeout();
    this.navigateTimeoutId = setTimeout(() => {
      localStorage.setItem('rent-or-buy-selected-listing', JSON.stringify(listing));
      this.router.navigate(['/listings', listing.id], { state: { listing } });
    }, 1000);
  }

  private clearNavigateTimeout(): void {
    if (this.navigateTimeoutId === null) {
      return;
    }

    clearTimeout(this.navigateTimeoutId);
    this.navigateTimeoutId = null;
  }

  private readLatestFromCache(): Listing[] {
    const raw = localStorage.getItem(this.listingsCacheKey);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return (parsed as Listing[]).slice(0, 5);
    } catch {
      return [];
    }
  }

  private writeListingsCache(listings: Listing[]): void {
    try {
      localStorage.setItem(this.listingsCacheKey, JSON.stringify(listings));
    } catch {
      // Ignore cache write failures.
    }
  }

  private scheduleLoadStateTimeout(): void {
    this.clearLoadStateTimeout();

    this.loadStateTimeoutId = setTimeout(() => {
      if (!this.isLoading) {
        return;
      }

      this.isLoading = false;
      if (this.latestListings.length === 0) {
        this.loadError = 'Loading latest publications took too long. Please try again.';
      }
    }, 6000);
  }

  private clearLoadStateTimeout(): void {
    if (this.loadStateTimeoutId === null) {
      return;
    }

    clearTimeout(this.loadStateTimeoutId);
    this.loadStateTimeoutId = null;
  }
}
