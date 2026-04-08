import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Listing, ListingsService } from '../services/listings.service';

@Component({
  standalone: true,
  selector: 'app-listing-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-details.component.html',
  styleUrls: ['./listing-details.component.css']
})
export class ListingDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly listingsService = inject(ListingsService);

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

    if (this.route.snapshot.queryParamMap.has('published')) {
      this.successMessage = 'Listing published successfully.';
    } else if (this.route.snapshot.queryParamMap.has('updated')) {
      this.successMessage = 'Listing updated successfully.';
    }

    this.loadListing(listingId);
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

  private loadListing(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.listingsService.getListingById(id).subscribe({
      next: (listing) => {
        this.listing = listing;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Listing not found or unavailable.';
        this.isLoading = false;
      }
    });
  }
}
