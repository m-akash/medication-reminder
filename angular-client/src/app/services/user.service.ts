import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserSettings,
  UpdateUserSettingsDto
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<{ status: number; users: User[] }> {
    return this.http.get<{ status: number; users: User[] }>(`${this.apiUrl}/api/users`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/user/me`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/user/${id}`);
  }

  createUser(user: CreateUserDto): Observable<User> {
    // Map to ABP's built-in RegisterDto (AppName, UserName, EmailAddress, Password)
    return this.http.post<User>(`${this.apiUrl}/api/account/register`, {
      appName: 'MedicineReminder',
      userName: user.email,
      emailAddress: user.email,
      name: user.name,
      password: user.password
    });
  }

  updateCurrentUser(user: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/api/user/me`, user);
  }

  deleteCurrentUserAccount(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/user/me/account`);
  }

  getCurrentUserSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(`${this.apiUrl}/api/user/me/settings`);
  }

  saveCurrentUserSettings(settings: UpdateUserSettingsDto): Observable<UserSettings> {
    return this.http.put<UserSettings>(`${this.apiUrl}/api/user/me/settings`, settings);
  }
}
