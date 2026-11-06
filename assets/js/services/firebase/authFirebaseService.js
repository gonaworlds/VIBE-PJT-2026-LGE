/**
 * Firebase Firestore 기반 회원 서비스
 *
 * 컬렉션 구조
 * - duo_users/{userId(소문자)}      : { userId, name, email, role, passwordHash, passwordSalt, passwordIterations, createdAt, lastLoginAt }
 * - duo_user_emails/{이메일 키}      : { userId }  ← 이메일 중복 방지용 인덱스
 *
 * 회원가입은 트랜잭션으로 아이디/이메일 문서를 함께 확인·생성하므로
 * 동시에 같은 아이디/이메일로 가입해도 중복이 생기지 않습니다.
 * role 은 가입 시 항상 'user' 이며, 관리자(admin)는 tools/seed-admin.mjs 로 수동 등록합니다.
 */

import {
  doc,
  getDoc,
  updateDoc,
  runTransaction,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { db } from './firebaseConfig.js';
import { generateSalt, hashPassword, safeEqual, PASSWORD_ITERATIONS } from '../../utils/password.js';

export const USERS_COLLECTION = 'duo_users';
export const USER_EMAILS_COLLECTION = 'duo_user_emails';

export const normalizeUserId = (userId) => String(userId || '').trim().toLowerCase();
export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
export const emailKey = (email) => encodeURIComponent(normalizeEmail(email));

/** 공개 가능한 사용자 정보만 추출 (비밀번호 해시 제외) */
function toPublicUser(data) {
  return {
    userId: data.userId,
    name: data.name,
    email: data.email,
    role: data.role === 'admin' ? 'admin' : 'user',
  };
}

function assertDb() {
  if (!db) throw new Error('Firebase Firestore is not initialized.');
}

export const authFirebaseService = {
  /** 아이디 사용 가능 여부 */
  isUserIdAvailable: async (userId) => {
    assertDb();
    const snap = await getDoc(doc(db, USERS_COLLECTION, normalizeUserId(userId)));
    return !snap.exists();
  },

  /** 이메일 사용 가능 여부 */
  isEmailAvailable: async (email) => {
    assertDb();
    const snap = await getDoc(doc(db, USER_EMAILS_COLLECTION, emailKey(email)));
    return !snap.exists();
  },

  /** 회원가입 (아이디/이메일 중복 시 code 가 있는 Error) */
  signUp: async ({ name, userId, password, email }) => {
    assertDb();
    const id = normalizeUserId(userId);
    const mail = normalizeEmail(email);
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const nowIso = new Date().toISOString();

    const userRef = doc(db, USERS_COLLECTION, id);
    const emailRef = doc(db, USER_EMAILS_COLLECTION, emailKey(mail));

    const user = {
      userId: id,
      name: String(name).trim(),
      email: mail,
      role: 'user',
      passwordHash,
      passwordSalt: salt,
      passwordIterations: PASSWORD_ITERATIONS,
      createdAt: nowIso,
      lastLoginAt: null,
    };

    await runTransaction(db, async (tx) => {
      const [userSnap, emailSnap] = await Promise.all([tx.get(userRef), tx.get(emailRef)]);
      if (userSnap.exists()) {
        const err = new Error('이미 사용 중인 아이디입니다.');
        err.code = 'auth/duplicate-user-id';
        throw err;
      }
      if (emailSnap.exists()) {
        const err = new Error('이미 가입된 이메일입니다.');
        err.code = 'auth/duplicate-email';
        throw err;
      }
      tx.set(userRef, user);
      tx.set(emailRef, { userId: id, createdAt: nowIso });
    });

    return toPublicUser(user);
  },

  /** 로그인: 성공 시 공개 사용자 정보 반환, 실패 시 Error */
  signIn: async (userId, password) => {
    assertDb();
    const id = normalizeUserId(userId);
    const snap = await getDoc(doc(db, USERS_COLLECTION, id));
    const invalid = () => {
      const err = new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
      err.code = 'auth/invalid-credentials';
      return err;
    };
    if (!snap.exists()) throw invalid();

    const data = snap.data();
    const hash = await hashPassword(password, data.passwordSalt, data.passwordIterations || PASSWORD_ITERATIONS);
    if (!safeEqual(hash, data.passwordHash)) throw invalid();

    updateDoc(snap.ref, { lastLoginAt: new Date().toISOString() }).catch((e) => {
      console.warn('[Auth] lastLoginAt 갱신 실패:', e);
    });
    return toPublicUser(data);
  },

  /** 사용자 정보 조회 (세션 검증용) — 없으면 null */
  getUser: async (userId) => {
    assertDb();
    const snap = await getDoc(doc(db, USERS_COLLECTION, normalizeUserId(userId)));
    return snap.exists() ? toPublicUser(snap.data()) : null;
  },
};
