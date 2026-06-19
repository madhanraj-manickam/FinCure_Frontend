import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  phoneNumber: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  // Update this base URL if your local environment port changes
  private readonly apiUrl = 'http://localhost:5028/api/Auth';

  // State management using Signals
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  // --- LOGIN ---
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.currentUser.set(response.user);
        this.token.set(response.token);
        localStorage.setItem('fincure_auth_token', response.token);
      }),
      catchError(this.handleError)
    );
  }

  // --- REGISTER ---
  register(data: RegisterRequest): Observable<string> {
    // IMPORTANT: Backend returns a plain string, so we must set responseType to 'text'
    return this.http.post(`${this.apiUrl}/register`, data, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  // --- SHARED ERROR HANDLER ---
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    // Handle C# backend string responses (e.g., "Wrong Password") or ErrorResponse models
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}