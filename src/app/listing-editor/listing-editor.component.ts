import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, TimeoutError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ListingInput, ListingsService, ListingType } from '../services/listings.service';

@Component({
  standalone: true,
  selector: 'app-listing-editor',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './listing-editor.component.html',
  styleUrls: ['./listing-editor.component.css']
})
export class ListingEditorComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly listingsService = inject(ListingsService);
  listingForm: FormGroup;
  isEditMode = false;
  listingId: string | null = null;
  errorMessage = '';
  isSubmitting = false;

  readonly listingTypes: ListingType[] = ['Rent', 'Buy'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.listingForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      type: ['Rent', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      imageUrl: ['/images/listing-placeholder.svg'],
      bedrooms: [1, [Validators.required, Validators.min(1)]],
      bathrooms: [1, [Validators.required, Validators.min(1)]],
      areaSqm: [30, [Validators.required, Validators.min(10)]],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  ngOnInit(): void {
    this.listingId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.listingId;

    if (!this.listingId) {
      return;
    }

    this.listingsService.getListingById(this.listingId).subscribe({
      next: (listing) => {
        this.listingForm.patchValue({
          title: listing.title,
          city: listing.city,
          type: listing.type,
          price: listing.price,
          imageUrl: listing.imageUrl,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          areaSqm: listing.areaSqm,
          description: listing.description
        });
      },
      error: () => {
        this.router.navigate(['/profile']);
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.listingForm.invalid) {
      this.errorMessage = 'Please correct the highlighted fields before submitting.';
      this.listingForm.markAllAsTouched();
      return;
    }

    const currentUser = this.authService.currentUser;

    if (!currentUser?._id) {
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting = true;

    const payload = this.normalizeListingPayload(this.listingForm.getRawValue() as ListingInput);

    if (this.isEditMode && this.listingId) {
      this.listingsService.updateListing(this.listingId, payload)
        .pipe(finalize(() => {
          this.isSubmitting = false;
        }))
        .subscribe({
          next: (listing) => this.router.navigate(['/listings', listing.id], { queryParams: { updated: '1' } }),
          error: (error) => this.handleSubmitError(error, 'You can edit only your own listings.')
        });
      return;
    }

    this.listingsService.createListing(payload)
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: (listing) => this.router.navigate(['/listings', listing.id], { queryParams: { published: '1' } }),
        error: (error) => this.handleSubmitError(error, 'Could not create listing. Please try again.')
      });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.listingForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }

  private normalizeListingPayload(input: ListingInput): ListingInput {
    const imageUrl = input.imageUrl?.trim() || '/images/listing-placeholder.svg';

    return {
      ...input,
      imageUrl
    };
  }

  private handleSubmitError(error: unknown, fallbackMessage: string): void {
    if (error instanceof TimeoutError) {
      this.errorMessage = 'The server did not respond in time. Please make sure backend is running on port 3000.';
      return;
    }

    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      this.authService.clearSession();
      this.router.navigate(['/login']);
      return;
    }

    if (error instanceof HttpErrorResponse && error.status === 0) {
      this.errorMessage = 'Cannot reach the server. Please make sure backend is running on port 3000.';
      return;
    }

    if (error instanceof HttpErrorResponse) {
      this.errorMessage = error.error?.message || fallbackMessage;
      return;
    }

    this.errorMessage = fallbackMessage;
  }
}