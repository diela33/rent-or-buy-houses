import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './services/auth.service';
import { ListingsService } from './services/listings.service';

export const listingOwnerGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const listingsService = inject(ListingsService);
  const router = inject(Router);
  const listingId = route.paramMap.get('id');
  const ownerId = authService.currentUser?._id;

  if (!listingId || !ownerId) {
    return router.createUrlTree(['/profile']);
  }

  return listingsService.getListingById(listingId).pipe(
    map((listing) => listing.ownerId === ownerId ? true : router.createUrlTree(['/profile'])),
    catchError(() => of(router.createUrlTree(['/profile'])))
  );
};