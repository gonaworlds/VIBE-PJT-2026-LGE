/**
 * Auth Service 진입점
 * UI 는 이 모듈만 import 하여 로그인 상태/회원 기능을 사용합니다.
 *
 * - 세션: localStorage('duo_auth_session') 에 공개 사용자 정보만 보관 (페이지 간 로그인 유지)
 * - 페이지 로드 시 Firestore 의 회원 정보로 세션을 재검증 (권한 변경/탈퇴 반영)
 * - 상태 변경 시 window 에 'duo:auth-change' 이벤트 발생 (다른 탭 로그아웃도 반영)
 */

import { authFirebaseService } from './firebase/authFirebaseService.js';

const SESSION_KEY = 'duo_auth_session';
const CHANGE_EVENT = 'duo:auth-change';

// 회원가입 입력 규칙
export const AUTH_RULES = {
  name: { min: 2, max: 20 },
  userId: { pattern: /^[a-z][a-z0-9_]{3,19}$/, hint: '영문 소문자로 시작하는 4~20자 (영문 소문자, 숫자, _)' },
  password: { min: 8, max: 20, hint: '8~20자, 영문과 숫자를 모두 포함' },
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, max: 100 },
};

function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s && s.userId ? s : null;
  } catch (_) {
    return null;
  }
}

function writeSession(user) {
  try {
    if (user) {
      window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ userId: user.userId, name: user.name, email: user.email, role: user.role, loginAt: new Date().toISOString() })
      );
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch (_) {
    /* 저장소 사용 불가(사생활 보호 모드 등) 시 현재 페이지에서만 유지 */
  }
}

let currentUser = readSession();
let verifyPromise = null;

function emitChange() {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { user: currentUser } }));
}

// 다른 탭에서 로그인/로그아웃 시 동기화
window.addEventListener('storage', (e) => {
  if (e.key !== SESSION_KEY) return;
  currentUser = readSession();
  emitChange();
});

/** 입력값 검증: { field: message } 형태의 오류 객체 반환 (없으면 빈 객체) */
export function validateSignUp({ name, userId, password, passwordConfirm, email }) {
  const errors = {};
  const n = String(name || '').trim();
  if (n.length < AUTH_RULES.name.min || n.length > AUTH_RULES.name.max) {
    errors.name = `이름은 ${AUTH_RULES.name.min}~${AUTH_RULES.name.max}자로 입력해 주세요.`;
  }
  const id = String(userId || '').trim().toLowerCase(); // 아이디는 대소문자 구분 없이 소문자로 저장
  if (!AUTH_RULES.userId.pattern.test(id)) {
    errors.userId = `아이디는 ${AUTH_RULES.userId.hint}로 입력해 주세요.`;
  }
  const pw = String(password || '');
  if (pw.length < AUTH_RULES.password.min || pw.length > AUTH_RULES.password.max || !/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) {
    errors.password = `비밀번호는 ${AUTH_RULES.password.hint}해야 합니다.`;
  } else if (/\s/.test(pw)) {
    errors.password = '비밀번호에 공백을 사용할 수 없습니다.';
  }
  if (passwordConfirm !== undefined && pw !== passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
  }
  const mail = String(email || '').trim();
  if (!AUTH_RULES.email.pattern.test(mail) || mail.length > AUTH_RULES.email.max) {
    errors.email = '올바른 이메일 형식으로 입력해 주세요.';
  }
  return errors;
}

export const authService = {
  CHANGE_EVENT,

  getCurrentUser: () => currentUser,
  isLoggedIn: () => Boolean(currentUser),
  isAdmin: () => Boolean(currentUser && currentUser.role === 'admin'),

  /** 상태 변경 구독. 구독 해제 함수 반환 */
  onChange: (callback) => {
    const handler = (e) => callback(e.detail.user);
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  },

  /** Firestore 회원 정보로 세션 재검증 (페이지당 1회) */
  verifySession: () => {
    if (!currentUser) return Promise.resolve(null);
    if (!verifyPromise) {
      verifyPromise = authFirebaseService
        .getUser(currentUser.userId)
        .then((user) => {
          if (!user) {
            currentUser = null;
            writeSession(null);
          } else if (user.name !== currentUser.name || user.role !== currentUser.role || user.email !== currentUser.email) {
            currentUser = { ...currentUser, ...user };
            writeSession(currentUser);
          } else {
            return currentUser;
          }
          emitChange();
          return currentUser;
        })
        .catch((err) => {
          // 네트워크 오류 시 기존 세션 유지
          console.warn('[Auth] 세션 검증 실패:', err);
          return currentUser;
        });
    }
    return verifyPromise;
  },

  signIn: async (userId, password) => {
    const user = await authFirebaseService.signIn(userId, password);
    currentUser = user;
    writeSession(user);
    verifyPromise = Promise.resolve(user);
    emitChange();
    return user;
  },

  signOut: () => {
    currentUser = null;
    writeSession(null);
    verifyPromise = null;
    emitChange();
  },

  signUp: async (dto) => {
    const errors = validateSignUp(dto);
    if (Object.keys(errors).length) {
      const err = new Error(Object.values(errors)[0]);
      err.code = 'auth/invalid-input';
      err.fields = errors;
      throw err;
    }
    return authFirebaseService.signUp(dto);
  },

  isUserIdAvailable: (userId) => authFirebaseService.isUserIdAvailable(userId),
  isEmailAvailable: (email) => authFirebaseService.isEmailAvailable(email),
};
