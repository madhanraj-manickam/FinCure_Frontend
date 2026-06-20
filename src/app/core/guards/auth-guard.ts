import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('fincure_auth_token');

  // If a token exists, allow access to the route
  if (token) {
    return true;
  }

  // Otherwise, redirect to login page
  router.navigate(['/login']);
  return false;
};