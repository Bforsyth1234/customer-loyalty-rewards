import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {{ isLogin() ? 'Sign in to your account' : 'Create a new account' }}
          </h2>
        </div>
        <form *ngIf="!showConfirmationModal()" class="mt-8 space-y-6" [formGroup]="authForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" formControlName="email" required 
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm" 
                     placeholder="Email address">
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" name="password" type="password" formControlName="password" required 
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm" 
                     placeholder="Password">
            </div>
          </div>

          <div>
            <button type="submit" [disabled]="authForm.invalid"
                    class="btn-gradient group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200">
              {{ isLogin() ? 'Sign in' : 'Register' }}
            </button>
          </div>
        </form>
        <p *ngIf="errorMessage()" class="mt-2 text-center text-sm text-red-600">
          {{ errorMessage() }}
        </p>
        <div *ngIf="!showConfirmationModal()" class="text-center mt-4">
          <button (click)="toggleAuthMode()" class="text-sm text-red-600 hover:text-red-500">
            {{ isLogin() ? 'Need an account? Register' : 'Already have an account? Sign in' }}
          </button>
        </div>

        <!-- Confirmation Modal -->
        <div *ngIf="showConfirmationModal()" class="text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Please Confirm Your Email Address</h3>
          <p class="text-sm text-gray-600 mb-6">
            We've sent a confirmation email to your address. Please check your inbox and confirm your email to complete the registration process.
          </p>
          <button (click)="returnToLogin()" 
                  class="btn-gradient w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            Return to Login
          </button>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLogin = signal(true);
  errorMessage = signal('');
  showConfirmationModal = signal(false);

  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  toggleAuthMode(): void {
    this.isLogin.update(value => !value);
    this.errorMessage.set('');
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      const { email, password } = this.authForm.value;
      if (this.isLogin()) {
        this.login(email ?? '', password ?? '');
      } else {
        this.register(email ?? '', password ?? '');
      }
    }
  }

  private login(email: string, password: string): void {
    this.authService.login(email, password).subscribe({
      next: (user) => {
        if (user) {
          this.router.navigate(['/customer-lookup']);
        } else {
          this.errorMessage.set('Login failed. Please try again.');
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage.set('An error occurred during login. Please try again.');
      }
    });
  }

  private register(email: string, password: string): void {
    this.authService.register(email, password).subscribe({
      next: (user) => {
        if (user) {
          this.showConfirmationModal.set(true);
        } else {
          this.errorMessage.set('Registration failed. Please try again.');
        }
      },
      error: (err) => {
        console.error('Registration failed', err);
        this.errorMessage.set('An error occurred during registration. Please try again.');
      }
    });
  }

  returnToLogin(): void {
    this.showConfirmationModal.set(false);
    this.isLogin.set(true);
    this.authForm.reset();
  }
}