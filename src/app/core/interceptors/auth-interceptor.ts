import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('fincure_auth_token');

  // Clone the request to add the authentication header if the token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Pass the request forward and catch any 401 Unauthorized errors from the backend
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token is invalid or expired. Clear storage and force re-login.
        localStorage.removeItem('fincure_auth_token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};