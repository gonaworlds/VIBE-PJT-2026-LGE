/**
 * Firebase Firestore 초기화 설정 파일
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

export const firebaseConfig = {
  apiKey: "AIzaSyAJPvY7HjQsBQUaFRCMdP4UGcQKBTXaIMc",
  authDomain: "vibecoding-2026-pjt-lge.firebaseapp.com",
  projectId: "vibecoding-2026-pjt-lge",
  storageBucket: "vibecoding-2026-pjt-lge.firebasestorage.app",
  messagingSenderId: "870189920499",
  appId: "1:870189920499:web:a5e9f08036d37c8c65c786",
  measurementId: "G-1LVRSTG7CM"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
