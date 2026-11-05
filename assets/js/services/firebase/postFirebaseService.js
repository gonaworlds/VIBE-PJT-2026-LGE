/**
 * Firebase Firestore 기반 Post Service 구현체
 * 가이드라인 지침 5장에 따라 MockService와 100% 동일한 인터페이스를 가집니다.
 * Firebase 연동 시 postService.js에서 전환하면 UI 컴포넌트 코드 변경 없이 교체됩니다.
 */

import { db } from './firebaseConfig.js';

const COLLECTION_NAME = 'duo_notices';

export const postFirebaseService = {
  getAll: async () => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized yet. Use postMockService.');
    }
    // const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    // return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return [];
  },

  getById: async (id) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized yet. Use postMockService.');
    }
    return null;
  },

  create: async (dto) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized yet. Use postMockService.');
    }
    const nowIso = new Date().toISOString();
    return { id: 'firestore-id', ...dto, createdAt: nowIso, updatedAt: nowIso };
  },

  update: async (id, dto) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized yet. Use postMockService.');
    }
  },

  delete: async (id) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized yet. Use postMockService.');
    }
  },

  incrementViews: async (id) => {
    if (!db) return 0;
    return 0;
  },

  getSiblings: async (id) => {
    return { prev: null, next: null };
  },
};

