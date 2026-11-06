/**
 * Post Service 진입점 (엔트리포인트)
 * UI 컴포넌트는 오직 이 postService만 import하여 데이터를 다룹니다.
 *
 * [Firebase Firestore 모드 활성화 완료]
 */

// import { postMockService } from './mock/postMockService.js';
import { postFirebaseService } from './firebase/postFirebaseService.js';

// 현재 활성화된 서비스 인스턴스 (Firebase Firestore)
export const postService = postFirebaseService;
