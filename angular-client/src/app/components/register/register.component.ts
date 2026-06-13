import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="card bg-white/70 backdrop-blur-md border border-white/40 shadow-2xl rounded-3xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 mb-2 tracking-tight">
            Create Account
          </h1>
          <p class="text-gray-600 font-semibold text-sm">Join Medicine Reminder today!</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-bold text-gray-700">Name</span>
            </label>
            <input
              type="text"
              formControlName="name"
              class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              placeholder="John Doe"
              [class.input-error]="registerForm.get('name')?.touched && registerForm.get('name')?.invalid"
            />
            @if (registerForm.get('name')?.touched && registerForm.get('name')?.invalid) {
              <span class="text-error text-xs font-bold mt-1">Name is required</span>
            }
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-bold text-gray-700">Email</span>
            </label>
            <input
              type="email"
              formControlName="email"
              class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              placeholder="your@email.com"
              [class.input-error]="registerForm.get('email')?.touched && registerForm.get('email')?.invalid"
            />
            @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
              <span class="text-error text-xs font-bold mt-1">Please enter a valid email</span>
            }
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-bold text-gray-700">Password</span>
            </label>
            <input
              type="password"
              formControlName="password"
              class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              placeholder="••••••••"
              [class.input-error]="registerForm.get('password')?.touched && registerForm.get('password')?.invalid"
            />
            @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
              <span class="text-error text-xs font-bold mt-1">Password must be at least 6 characters</span>
            }
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-bold text-gray-700">Confirm Password</span>
            </label>
            <input
              type="password"
              formControlName="confirmPassword"
              class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              placeholder="••••••••"
              [class.input-error]="registerForm.get('confirmPassword')?.touched && (registerForm.get('confirmPassword')?.invalid || registerForm.hasError('passwordMismatch'))"
            />
            @if (registerForm.get('confirmPassword')?.touched && (registerForm.get('confirmPassword')?.invalid || registerForm.hasError('passwordMismatch'))) {
              <span class="text-error text-xs font-bold mt-1">
                @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                  Confirm password is required
                } @else {
                  Passwords do not match
                }
              </span>
            }
          </div>

          @if (errorMessage) {
            <div class="alert alert-error rounded-xl shadow-md flex gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-bold text-sm">{{ errorMessage }}</span>
            </div>
          }

          <button
            type="submit"
            class="btn btn-block bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 text-white border-0 hover:opacity-95 font-bold text-base rounded-2xl shadow-lg transition-opacity"
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
          <p class="text-gray-500 font-semibold text-sm">
            Already have an account?
            <a [routerLink]="['/login']" [queryParams]="{ returnUrl: returnUrl }" class="link link-primary font-bold text-indigo-500 hover:text-indigo-600 transition-colors ml-1">Login</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage = '';
  isLoading = false;
  returnUrl = '/home';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
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
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err: Error) => {
        // auth.service already extracts the server's message (message/details/fallback).
        this.errorMessage = err.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
