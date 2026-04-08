import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Listing, ListingsService } from '../services/listings.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly listingsService = inject(ListingsService);
  profileForm: FormGroup;
  myListings: Listing[] = [];
  selectedImage: { url: string; title: string } | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      tel: ['']
    });
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
          tel: user.tel ?? ''
        });

        if (user._id) {
          this.loadMyListings();
        }

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load your profile right now.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { username, email, tel } = this.profileForm.value;

    this.authService.updateUserProfile(username, email, tel || undefined).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully.';
        this.isSaving = false;
      },
      error: () => {
        this.errorMessage = 'Could not update your profile.';
        this.isSaving = false;
      }
    });
  }

  deleteListing(listingId: string): void {
    if (!this.authService.currentUser?._id) {
      this.router.navigate(['/login']);
      return;
    }

    if (!window.confirm('Delete this listing?')) {
      return;
    }

    this.listingsService.deleteListing(listingId).subscribe({
      next: () => this.loadMyListings()
    });
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

  private loadMyListings(): void {
    this.listingsService.getMyListings().subscribe((listings) => {
      this.myListings = listings;
    });
  }
}