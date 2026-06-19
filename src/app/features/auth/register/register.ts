import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.nonNullable.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // Convert phoneNumber string from input to a number for the backend DTO
    const rawFormValue = this.registerForm.getRawValue();
    const requestData = {
      ...rawFormValue,
      phoneNumber: Number(rawFormValue.phoneNumber)
    };

    this.authService.register(requestData).subscribe({
      next: (response: string) => {
        this.isLoading.set(false);
        this.successMessage.set(response || 'Registration successful! Redirecting to login...');
        
        // Wait 2 seconds so the user reads the success message, then navigate to login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
      }
    });
  }
}