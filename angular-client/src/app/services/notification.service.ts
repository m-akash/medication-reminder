import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getNotifications(userEmail: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/api/notifications/${userEmail}`);
  }

  markNotificationAsRead(notificationId: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/api/notifications/${notificationId}/read`, {});
  }

  markAllNotificationsAsRead(userEmail: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/api/notifications/${userEmail}/read-all`, {});
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/notifications/${notificationId}`);
  }
}
