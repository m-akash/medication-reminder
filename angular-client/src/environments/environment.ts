export const environment = {
  production: false,
  apiUrl: 'https://localhost:44358',
  firebase: {
    apiKey: 'AIzaSyA4yj3k_1dwynOIFvEujyA0NrJUE3BCSnA',
    authDomain: 'medication-reminder-d79da.firebaseapp.com',
    projectId: 'medication-reminder-d79da',
    storageBucket: 'medication-reminder-d79da.firebasestorage.app',
    messagingSenderId: '793147367436',
    appId: '1:793147367436:web:463adc4486499b6ad14e29',
    measurementId: 'G-6WZECEWZXV'
  },
  // Web Push VAPID key pair (Firebase Console → Project Settings →
  // Cloud Messaging → Web configuration → Web Push certificates).
  // Required by getToken() to subscribe the browser to push.
  vapidKey: 'BEFGh6Ko7hQV_Tu8CipcGwdJrKTxREkhP-PmHhtBdFRCV3yu5NzkD2pMTP2Y6ylqxtYOl0qaJsVJSsflWoAzjpQ'
};
