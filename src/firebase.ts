import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = [
  ["VITE_FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["VITE_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["VITE_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["VITE_FIREBASE_STORAGE_BUCKET", firebaseConfig.storageBucket],
  ["VITE_FIREBASE_MESSAGING_SENDER_ID", firebaseConfig.messagingSenderId],
  ["VITE_FIREBASE_APP_ID", firebaseConfig.appId],
] as const;

for (const [key, value] of requiredKeys) {
  if (!value) {
    throw new Error(
      `Environment variable ${key} is missing. Please configure your Firebase credentials.`
    );
  }
}

export const firebaseApp = initializeApp(firebaseConfig);

export const initAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      return null;
    }

    return getAnalytics(firebaseApp);
  } catch (error) {
    console.warn(
      "Firebase analytics is not supported in this environment",
      error
    );
    return null;
  }
};
