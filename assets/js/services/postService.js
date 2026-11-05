/**
 * Post Service 진입점 (엔트리포인트)
 * UI 컴포넌트는 오직 이 postService만 import하여 데이터를 다룹니다.
 *
 * [현재: LocalStorage Mock 모드]
 * 추후 Firebase 전환 시 postFirebaseService로 교체하면 UI 수정 없이 100% 호환됩니다.
 */

import { postMockService } from './mock/postMockService.js';
// import { postFirebaseService } from './firebase/postFirebaseService.js';

// 현재 활성화된 서비스 인스턴스
export const postService = postMockService;

