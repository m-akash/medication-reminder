// Firebase Cloud Messaging background service worker.
// Handles notifications when the app is in the background or the tab is closed.
// Served from the site root so it can control the whole origin.

importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyA4yj3k_1dwynOIFvEujyA0NrJUE3BCSnA',
  authDomain: 'medication-reminder-d79da.firebaseapp.com',
  projectId: 'medication-reminder-d79da',
  storageBucket: 'medication-reminder-d79da.firebasestorage.app',
  messagingSenderId: '793147367436',
  appId: '1:793147367436:web:463adc4486499b6ad14e29',
  measurementId: 'G-6WZECEWZXV'
});

const messaging = firebase.messaging();

// Optional: customize background notification display.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const { title, body } = payload.notification ?? {};
  if (title) {
    self.registration.showNotification(title, { body });
  }
});
