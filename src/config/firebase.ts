/**
 * Firebase configuration and service initialisation.
 *
 *
 * The project used here is: kingfisher-group-measurement
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  Analytics,
  isSupported,
} from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDIf-6nEsY8jtMRdaMEpzRmxdPoKqD4aLg',
  authDomain: 'kingfisher-group-measurement.firebaseapp.com',
  projectId: 'kingfisher-group-measurement',
  storageBucket: 'kingfisher-group-measurement.firebasestorage.app',
  messagingSenderId: '409911639072',
  appId: '1:409911639072:ios:da3e110b52c1fd46139045',
  measurementId: 'G-LFD0Y10K54',
};

// Prevent duplicate initialisation when the module is hot-reloaded in Expo
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

/**
 * Analytics is only available on native (iOS/Android) and modern browsers.
 * We initialise it lazily and expose a safe wrapper so screens don't need
 * to guard against undefined.
 */
let analyticsInstance: Analytics | null = null;

const initAnalytics = async (): Promise<Analytics | null> => {
  if (analyticsInstance) return analyticsInstance;
  const supported = await isSupported();
  if (supported) {
    analyticsInstance = getAnalytics(app);
  }
  return analyticsInstance;
};

/**
 * Wrapper around Firebase Analytics logEvent.
 * All GA4 e-commerce events in this app go through this function so that
 * analytics calls are silently no-ops in environments where analytics is
 * unavailable (e.g. simulators without Google Play Services).
 */
export const logEvent = async (
  eventName: string,
  params?: Record<string, unknown>
): Promise<void> => {
  try {
    const analytics = await initAnalytics();
    if (analytics) {
      firebaseLogEvent(analytics, eventName, params);
    }
  } catch (e) {
    // Analytics failures must never crash the app
    if (__DEV__) {
      console.log(`[Analytics] ${eventName}`, params);
    }
  }
};

export default app;
