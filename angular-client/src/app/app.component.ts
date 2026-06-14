import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { FirebaseMessagingService } from './services/firebase-messaging.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-client';
  private auth = inject(AuthService);
  private fcm = inject(FirebaseMessagingService);

  constructor() {
    // Subscribe to the auth stream so messaging init runs whenever a user is
    // present (after login, page reload, or registration). init() is idempotent.
    this.auth.currentUser$.subscribe((user) => {
      if (user) {
        this.fcm.init();
      }
    });
  }
}
