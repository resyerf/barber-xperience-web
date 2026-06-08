import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles: string[] = route.data['roles'] ?? [];

  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
  if (allowedRoles.length === 0) return true;
  if (allowedRoles.includes(auth.userRole() ?? '')) return true;

  return router.createUrlTree(['/dashboard']);
};
