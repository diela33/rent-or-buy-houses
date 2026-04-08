import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Listing, ListingsService } from '../services/listings.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private readonly listingsService = inject(ListingsService);

  latestListings: Listing[] = [];
  isLoading = true;
  loadError = '';

  ngOnInit(): void {
    this.listingsService.getListings().subscribe({
      next: (listings) => {
        this.latestListings = listings.slice(0, 6);
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Could not load latest listings right now.';
        this.isLoading = false;
      }
    });
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = this.listingsService.placeholderImageUrl;
  }
}