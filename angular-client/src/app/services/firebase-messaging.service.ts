import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  MessagePayload
} from 'firebase/messaging';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

/**
 * Handles Firebase Cloud Messaging on the web:
 *  - requests notification permission
 *  - obtains + registers the FCM token with the backend
 *  - surfaces foreground messages and token refresh
 *
 * Background/tab-closed delivery is handled by public/firebase-messaging-sw.js.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseMessagingService {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  private messaging: Messaging | null = null;
  private readonly registeredTokenKey = 'fcm_token_registered';

  /** Emits payloads received while the app is in the foreground. */
  readonly foregroundMessage$ = new BehaviorSubject<MessagePayload | null>(null);

  /**
   * Request permission and register the device token for the logged-in user.
   * Safe to call repeatedly; it skips work when already granted/registered.
   */
  async init(): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('[FCM] This browser does not support notifications.');
      return;
    }

    // Register the messaging service worker before initializing messaging,
    // so getToken() can attach it as the push subscription service worker.
    try {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    } catch (err) {
      console.error('[FCM] Service worker registration failed:', err);
      return;
    }

    this.messaging = getMessaging(initializeApp(environment.firebase));

    // Foreground messages — show an in-app toast / banner via this stream.
    onMessage(this.messaging, (payload) => {
      console.log('[FCM] Foreground message:', payload);
      this.foregroundMessage$.next(payload);
    });

    // The modular SDK (v9+) removed onTokenRefresh. Re-fetch the token on
    // window focus; getToken() returns the current valid token and a new one
    // if the old one was rotated by FCM.
    window.addEventListener('focus', () => this.requestAndRegisterToken(false));

    await this.requestAndRegisterToken(false);
  }

  private async requestAndRegisterToken(force: boolean): Promise<void> {
    const permission = Notification.permission;

    // Browsers require a permission grant to subscribe to push. If not granted,
    // request once; if denied there's nothing more to do until the user changes
    // it in site settings.
    if (permission === 'default') {
      const result = await Notification.requestPermission();
      if (result !== 'granted') {
        console.log('[FCM] Notification permission not granted.');
        return;
      }
    } else if (permission === 'denied') {
      console.log('[FCM] Notifications blocked in browser settings.');
      return;
    }

    if (!this.messaging) return;

    let token: string;
    try {
      token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });
    } catch (err) {
      console.error('[FCM] Failed to get token:', err);
      return;
    }

    if (!token) {
      console.warn('[FCM] No registration token available.');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      console.warn('[FCM] No logged-in user; skipping token registration.');
      return;
    }

    // Skip the API call if the same token is already registered for this user.
    if (!force && user.fcmToken === token && localStorage.getItem(this.registeredTokenKey) === token) {
      return;
    }

    try {
      await this.userService
        .saveFcmToken({ email: user.email, tokenForNotification: token })
        .toPromise();

      user.fcmToken = token;
      localStorage.setItem(this.registeredTokenKey, token);
      console.log('[FCM] Token registered with backend.');
    } catch (err) {
      console.error('[FCM] Failed to register token with backend:', err);
    }
  }
}
