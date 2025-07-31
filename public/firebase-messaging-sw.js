// This file needs to be in the public directory
// In a Next.js app, the public directory is at the root of your project

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here; other Firebase libraries
// are not available in the service worker.
self.importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// IMPORTANT: Replace this with your project's Firebase configuration
// This configuration is public and does not contain any sensitive information.
const firebaseConfig = {
  apiKey: self.location.search.split('apiKey=')[1].split('&')[0],
  authDomain: self.location.search.split('authDomain=')[1].split('&')[0],
  projectId: self.location.search.split('projectId=')[1].split('&')[0],
  storageBucket: self.location.search.split('storageBucket=')[1].split('&')[0],
  messagingSenderId: self.location.search.split('messagingSenderId=')[1].split('&')[0],
  appId: self.location.search.split('appId=')[1].split('&')[0],
  databaseURL: self.location.search.split('databaseURL=')[1].split('&')[0],
};


// Initialize the Firebase app in the service worker with the configuration
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  
  // Customize the notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png' // Make sure you have an icon in your public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
