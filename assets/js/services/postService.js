/**
 * Post Service 진입점 (엔트리포인트)
 * UI 컴포넌트는 오직 이 postService만 import하여 데이터를 다룹니다.
 *
 * [Firebase Firestore 모드 활성화 완료]
 * [권한] 작성(create)·수정(update)·삭제(delete)·초기화(resetToInitial)는 관리자 로그인 상태에서만 허용
 *        (조회수 증가 incrementViews 등 조회 기능은 누구나 사용)
 */

// import { postMockService } from './mock/postMockService.js';
import { postFirebaseService } from './firebase/postFirebaseService.js';
import { authService } from './authService.js';

function requireAdmin(fn) {
  return (...args) => {
    if (!authService.isAdmin()) {
      const err = new Error('관리자만 공지사항을 작성·수정·삭제할 수 있습니다.');
      err.code = 'auth/forbidden';
      return Promise.reject(err);
    }
    return fn(...args);
  };
}

// 현재 활성화된 서비스 인스턴스 (Firebase Firestore) + 관리자 권한 검사
export const postService = {
  ...postFirebaseService,
  create: requireAdmin(postFirebaseService.create),
  update: requireAdmin(postFirebaseService.update),
  delete: requireAdmin(postFirebaseService.delete),
  resetToInitial: requireAdmin(postFirebaseService.resetToInitial),
};
