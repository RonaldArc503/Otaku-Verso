import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';

// Firebase Hosting supplies public client configuration at runtime. No key is
// stored in Git or embedded by the production build. Authorization uses rules.
async function initializeFirebase() {
  const localConfig: string | undefined = import.meta.env.DEV
    ? import.meta.env.PUBLIC_FIREBASE_CONFIG
    : undefined;
  let config: FirebaseOptions;
  if (localConfig) {
    config = JSON.parse(localConfig) as FirebaseOptions;
  } else {
    const response = await fetch('/__/firebase/init.json', {
      signal: AbortSignal.timeout(7000),
      cache: 'no-cache',
    });
    if (!response.ok) throw new Error('Firebase configuration unavailable');
    config = await response.json() as FirebaseOptions;
  }
  if (config.projectId !== 'anime-rc' ||
      config.appId !== '1:991304707596:web:5f54e548fb356c2d97c829' ||
      typeof config.apiKey !== 'string' || !config.apiKey) {
    throw new Error('Unexpected Firebase project configuration');
  }
  const app = initializeApp(config);
  return { app, db: getFirestore(app) };
}

let services: ReturnType<typeof initializeFirebase> | undefined;
export function getFirebaseServices() {
  services ??= initializeFirebase().catch(error => {
    services = undefined;
    throw error;
  });
  return services;
}
