import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return router.createUrlTree(['/profile']);
  }

  return authService.restoreSession().pipe(
    map(() => router.createUrlTree(['/profile'])),
    catchError(() => of(true))
  );
};