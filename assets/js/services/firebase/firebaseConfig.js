/**
 * Firebase Firestore 초기화 설정 파일
 * 추후 Firebase 마이그레이션 시 환경변수 및 firebase SDK 설정을 채워 넣습니다.
 */

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const db = null; // 추후 getFirestore(initializeApp(firebaseConfig)) 연결

