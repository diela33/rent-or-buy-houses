import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Listing, ListingType, ListingsService } from '../services/listings.service';

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
  private readonly route = inject(ActivatedRoute);
  private readonly listingsCacheKey = 'rent-or-buy-listings-cache';
  private loadStateTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private detailsNavigateTimeoutId: ReturnType<typeof setTimeout> | null = null;

  allListings: Listing[] = [];
  listings: Listing[] = [];
  selectedImage: { url: string; title: string } | null = null;
  isLoading = false;
  loadError = '';
  activeTypeFilter: ListingType | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.activeTypeFilter = this.getTypeFilterFromRoute();
    this.loadListings();
  }

  ngOnDestroy(): void {
    this.clearLoadStateTimeout();
    this.clearDetailsNavigateTimeout();
  }

  private loadListings(): void {
    const hasCached = this.tryLoadCachedListings();
    this.isLoading = !hasCached;
    this.loadError = '';

    if (!hasCached) {
      this.scheduleLoadStateTimeout();
    }

    this.listingsService.getListings().subscribe({
      next: (listings) => {
        try {
          this.allListings = Array.isArray(listings) ? listings : [];
          this.writeListingsCache(this.allListings);
          this.applyFilters();
        } catch {
          this.allListings = [];
          this.listings = [];
          this.loadError = 'Could not process listings right now. Please try again.';
        } finally {
          this.clearLoadStateTimeout();
          this.isLoading = false;
        }
      },
      error: () => {
        this.clearLoadStateTimeout();
        this.allListings = [];
        this.listings = [];
        this.isLoading = false;
        this.loadError = 'Could not load listings right now. Please try again in a moment.';
      }
    });
  }

  retryLoad(): void {
    this.activeTypeFilter = this.getTypeFilterFromRoute();
    this.loadListings();
  }

  clearTypeFilter(): void {
    this.activeTypeFilter = null;
    this.listings = this.allListings;
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

  goToDetails(listing: Listing, event?: Event): void {
    event?.preventDefault();

    if (!listing?.id) {
      return;
    }

    this.clearDetailsNavigateTimeout();
    this.detailsNavigateTimeoutId = setTimeout(() => {
      localStorage.setItem('rent-or-buy-selected-listing', JSON.stringify(listing));
      this.router.navigate(['/listings', listing.id], { state: { listing } });
    }, 1000);
  }

  private applyFilters(): void {
    if (!this.activeTypeFilter) {
      this.listings = this.allListings;
      return;
    }

    const filtered = this.allListings.filter((listing) => listing.type === this.activeTypeFilter);
    this.listings = filtered.length > 0 ? filtered : this.allListings;
  }

  private getTypeFilterFromRoute(): ListingType | null {
    const type = this.route.snapshot.queryParamMap.get('type');

    return type === 'Rent' || type === 'Buy' ? type : null;
  }

  private scheduleLoadStateTimeout(): void {
    this.clearLoadStateTimeout();

    this.loadStateTimeoutId = setTimeout(() => {
      if (!this.isLoading) {
        return;
      }

      this.isLoading = false;
      this.loadError = 'Loading took too long. Please try again.';
    }, 8000);
  }

  private clearLoadStateTimeout(): void {
    if (this.loadStateTimeoutId === null) {
      return;
    }

    clearTimeout(this.loadStateTimeoutId);
    this.loadStateTimeoutId = null;
  }

  private clearDetailsNavigateTimeout(): void {
    if (this.detailsNavigateTimeoutId === null) {
      return;
    }

    clearTimeout(this.detailsNavigateTimeoutId);
    this.detailsNavigateTimeoutId = null;
  }

  private tryLoadCachedListings(): boolean {
    const raw = localStorage.getItem(this.listingsCacheKey);

    if (!raw) {
      return false;
    }

    try {
      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return false;
      }

      this.allListings = parsed as Listing[];
      this.applyFilters();
      return this.allListings.length > 0;
    } catch {
      return false;
    }
  }

  private writeListingsCache(listings: Listing[]): void {
    try {
      localStorage.setItem(this.listingsCacheKey, JSON.stringify(listings));
    } catch {
      // Ignore cache write failures (quota/privacy mode).
    }
  }
}
