
'use client';

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app, messaging } from "./config";
import { saveDeviceToken } from "./firestore";

/**
 * Constructs the service worker URL with the necessary Firebase configuration
 * query parameters. This is required for the service worker to initialize Firebase.
 * @returns {string} The full URL for the service worker script.
 */
const constructServiceWorkerUrl = () => {
    // Dynamically construct the URL with config params
    const config = app.options;
    const params = new URLSearchParams({
        apiKey: config.apiKey!,
        authDomain: config.authDomain!,
        projectId: config.projectId!,
        storageBucket: config.storageBucket!,
        messagingSenderId: config.messagingSenderId!,
        appId: config.appId!,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
    });
    return `/firebase-messaging-sw.js?${params.toString()}`;
}

/**
 * Requests permission for notifications and retrieves the FCM token.
 * It registers the service worker and saves the token to the database.
 * @param {string} [userId] - The unique ID of the user (e.g., sanitized email for volunteers).
 * @returns {Promise<string | null>} The FCM token or null if permission is denied or an error occurs.
 */
export const requestForToken = async (userId?: string) => {
  // Ensure messaging is supported in the browser.
  if (!messaging) {
    console.log("Firebase Messaging is not available.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const swUrl = constructServiceWorkerUrl();
      // Get the FCM token.
      const currentToken = await getToken(messaging, { 
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.register(swUrl)
      });

      if (currentToken) {
        console.log("current token for client: ", currentToken);
        // Determine the user ID to associate with the token.
        const effectiveUserId = userId || (window.location.pathname.includes('/admin') ? 'admin_user' : null);
        if (effectiveUserId) {
            // Save the token to the database for sending targeted notifications.
            await saveDeviceToken(effectiveUserId, currentToken);
        }
        return currentToken;
      } else {
        console.log("No registration token available. Request permission to generate one.");
        return null;
      }
    } else {
        console.log("Notification permission denied.");
        return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};

/**
 * Sets up a listener for incoming messages when the app is in the foreground.
 * @returns {Promise<any>} A promise that resolves with the message payload when a message is received.
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    if(messaging) {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    }
  });
