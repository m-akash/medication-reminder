import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: User;
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
      client_id: 'MedicineReminder_Swagger',
      scope: 'MedicineReminder offline_access'
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/connect/token`, this.getFormData(body), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.accessToken);
        // Fetch user info after login
        this.getUserByEmail(email).subscribe();
      }),
      map(() => this.currentUserSubject.value!),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  register(name: string, email: string, password: string): Observable<User> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/api/account/register`, {
      name,
      email,
      password
    }).pipe(
      switchMap((response) => {
        // After successful registration, automatically login
        return this.login(email, password);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        // Extract the error message from the response
        const errorMessage = error.error?.error || error.error?.details || error.message || 'Registration failed';
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

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/user/${email}`).pipe(
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
