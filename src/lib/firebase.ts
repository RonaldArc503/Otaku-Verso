import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';

// Firebase web configuration is public. Authorization is enforced by Firestore rules.
export const app = initializeApp({
  apiKey: 'AIzaSyCERp5b50x32YCf9ZgSMP9-OY44snoU2Ow',
  authDomain: 'anime-rc.firebaseapp.com',
  projectId: 'anime-rc',
  storageBucket: 'anime-rc.firebasestorage.app',
  messagingSenderId: '991304707596',
  appId: '1:991304707596:web:5f54e548fb356c2d97c829',
  measurementId: 'G-1S01GEB5CF',
});

export const db = getFirestore(app);
