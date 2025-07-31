
'use client';

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app, messaging } from "./config";
import { saveDeviceToken } from "./firestore";

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


export const requestForToken = async (userId?: string) => {
  if (!messaging) {
    console.log("Firebase Messaging is not available.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const swUrl = constructServiceWorkerUrl();
      const currentToken = await getToken(messaging, { 
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.register(swUrl)
      });
      if (currentToken) {
        console.log("current token for client: ", currentToken);
        // For admins, we might use a generic "admin" ID. For volunteers, use their actual ID.
        const effectiveUserId = userId || (window.location.pathname.includes('/admin') ? 'admin_user' : null);
        if (effectiveUserId) {
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

export const onMessageListener = () =>
  new Promise((resolve) => {
    if(messaging) {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    }
  });

