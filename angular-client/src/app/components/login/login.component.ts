import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="card bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400 mb-2">
            Medicine Reminder
          </h1>
          <p class="text-gray-600 font-semibold">Welcome back! Please login to your account.</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold text-gray-700">Email</span>
            </label>
            <input
              type="email"
              formControlName="email"
              class="input input-bordered w-full"
              placeholder="your@email.com"
              [class.input-error]="loginForm.get('email')?.touched && loginForm.get('email')?.invalid"
            />
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
              <span class="text-error text-sm mt-1">Please enter a valid email</span>
            }
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold text-gray-700">Password</span>
            </label>
            <input
              type="password"
              formControlName="password"
              class="input input-bordered w-full"
              placeholder="••••••••"
              [class.input-error]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid"
            />
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
              <span class="text-error text-sm mt-1">Password is required</span>
            }
          </div>

          @if (errorMessage) {
            <div class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          }

          <button
            type="submit"
            class="btn btn-block bg-gradient-to-r from-amber-400 to-indigo-400 text-white border-0 hover:opacity-90 font-bold text-lg"
            [disabled]="loginForm.invalid || isLoading"
          >
            @if (isLoading) {
              <span class="loading loading-spinner"></span>
            } @else {
              Login
            }
          </button>
        </form>

        <div class="text-center mt-6">
          <p class="text-gray-600">
            Don't have an account?
            <a routerLink="/register" class="link link-primary font-bold">Register</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = 'Invalid email or password. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
