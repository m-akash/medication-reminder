import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

interface AuthResponse {
  // OpenIddict /connect/token returns standard OAuth snake_case fields.
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

interface LoginRequest {
  username: string;
  password: string;
  grant_type: string;
  client_id: string;
  scope: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        this.clearAuth();
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    const body: LoginRequest = {
      username: email,
      password: password,
      grant_type: 'password',
      client_id: 'MedicineReminder_App',
      scope: 'MedicineReminder offline_access'
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/connect/token`, this.getFormData(body), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.access_token);
      }),
      // Only resolve once the user profile has been loaded, so the caller
      // navigates with a fully populated currentUser (no race with ngOnInit).
      switchMap(() => this.fetchCurrentUser()),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  register(name: string, email: string, password: string): Observable<User> {
    // ABP's built-in RegisterDto: AppName, UserName, EmailAddress, Password
    return this.http.post(`${this.apiUrl}/api/account/register`, {
      appName: 'MedicineReminder',
      userName: email,
      emailAddress: email,
      password,
      extraProperties: {
        name
      }
    }).pipe(
      switchMap(() => {
        // After successful registration, automatically login
        return this.login(email, password);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        // ABP returns RemoteServiceErrorResponse: { error: { message, details } }
        const err = error.error?.error;
        const errorMessage = err?.message || err?.details || error.message || 'Registration failed';
        console.error('Error details:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    this.clearAuth();
  }

  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/user/me`).pipe(
      tap(user => {
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getFormData(obj: any): URLSearchParams {
    const params = new URLSearchParams();
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        params.set(key, obj[key]);
      }
    }
    return params;
  }
}
