import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="card bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400 mb-2">
            Create Account
          </h1>
          <p class="text-gray-600 font-semibold">Join Medicine Reminder today!</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold text-gray-700">Name</span>
            </label>
            <input
              type="text"
              formControlName="name"
              class="input input-bordered w-full"
              placeholder="John Doe"
              [class.input-error]="registerForm.get('name')?.touched && registerForm.get('name')?.invalid"
            />
            @if (registerForm.get('name')?.touched && registerForm.get('name')?.invalid) {
              <span class="text-error text-sm mt-1">Name is required</span>
            }
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold text-gray-700">Email</span>
            </label>
            <input
              type="email"
              formControlName="email"
              class="input input-bordered w-full"
              placeholder="your@email.com"
              [class.input-error]="registerForm.get('email')?.touched && registerForm.get('email')?.invalid"
            />
            @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
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
              [class.input-error]="registerForm.get('password')?.touched && registerForm.get('password')?.invalid"
            />
            @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
              <span class="text-error text-sm mt-1">Password must be at least 6 characters</span>
            }
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold text-gray-700">Confirm Password</span>
            </label>
            <input
              type="password"
              formControlName="confirmPassword"
              class="input input-bordered w-full"
              placeholder="••••••••"
              [class.input-error]="registerForm.get('confirmPassword')?.touched && registerForm.get('confirmPassword')?.invalid"
            />
            @if (registerForm.get('confirmPassword')?.touched && registerForm.get('confirmPassword')?.invalid) {
              <span class="text-error text-sm mt-1">Passwords do not match</span>
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
            [disabled]="registerForm.invalid || isLoading"
          >
            @if (isLoading) {
              <span class="loading loading-spinner"></span>
            } @else {
              Create Account
            }
          </button>
        </form>

        <div class="text-center mt-6">
          <p class="text-gray-600">
            Already have an account?
            <a routerLink="/login" class="link link-primary font-bold">Login</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.registerForm.value;

    this.authService.register(name, email, password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
