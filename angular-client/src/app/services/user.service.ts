import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  SaveFcmTokenDto,
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

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/user/${email}`);
  }

  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/api/account/register`, user);
  }

  updateUser(email: string, user: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/api/user/${email}`, user);
  }

  deleteUserAccount(email: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/user/${email}/account`);
  }

  saveFcmToken(data: SaveFcmTokenDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/user/save-fcm-token`, data);
  }

  getUserSettings(email: string): Observable<UserSettings> {
    return this.http.get<UserSettings>(`${this.apiUrl}/api/user/${email}/settings`);
  }

  saveUserSettings(email: string, settings: UpdateUserSettingsDto): Observable<UserSettings> {
    return this.http.put<UserSettings>(`${this.apiUrl}/api/user/${email}/settings`, settings);
  }
}
