/**
 * Firebase Firestore 기반 Post Service 구현체
 * 가이드라인 지침 5장에 따라 MockService와 100% 동일한 인터페이스를 가집니다.
 * 첨부파일은 문서 내 필드(Base64 dataUrl/객체)로 저장되어 별도의 Storage 설정 없이 동작합니다.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { db } from './firebaseConfig.js';
import { generateInitialPosts } from '../mock/initialSeedData.js';
import { CATEGORY_CONFIG } from '../../types/post.js';
import { pickSiblings } from '../../utils/postSiblings.js';

const COLLECTION_NAME = 'duo_notices';
export const MAX_PINNED_POSTS = 5;

// 메모리 캐싱 및 시딩 진행 플래그
let isSeedingInProgress = false;

/**
 * 게시글 정렬 헬퍼 (고정핀 상단 + 작성일 최신순)
 */
function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    // 1. 고정 핀 우선
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // 2. 작성일 최신순 (내림차순)
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
}

export const postFirebaseService = {
  /**
   * 저장소 초기화 및 기본 공지사항 15건 시딩 (DB가 비어있을 때 최초 1회 자동 실행)
   */
  initStorage: async () => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    if (isSeedingInProgress) return [];
    isSeedingInProgress = true;

    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) {
        console.log('[Firestore] 컬렉션이 비어 있어 기본 공지사항 15건을 Firestore에 시딩합니다...');
        const initialPosts = generateInitialPosts();
        const batch = writeBatch(db);

        initialPosts.forEach((post) => {
          const docRef = doc(db, COLLECTION_NAME, post.id);
          batch.set(docRef, post);
        });

        await batch.commit();
        console.log('[Firestore] 초기 공지사항 시딩 완료!');
        return sortPosts(initialPosts);
      }

      const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return sortPosts(posts);
    } finally {
      isSeedingInProgress = false;
    }
  },

  /**
   * 전체 게시글 목록 조회
   */
  getAll: async () => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return await postFirebaseService.initStorage();
    }

    const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return sortPosts(posts);
  },

  /**
   * 단일 게시글 조회
   */
  getById: async (id) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() };
  },

  /**
   * 상단 고정 공지글 개수 조회
   */
  getPinnedCount: async (excludeId = null) => {
    const list = await postFirebaseService.getAll();
    return list.filter((item) => item.isPinned && item.id !== excludeId).length;
  },

  /**
   * 새 게시글 생성
   */
  create: async (dto) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    const list = await postFirebaseService.getAll();
    const nowIso = new Date().toISOString();

    const isPinned = dto.isPinned !== undefined ? Boolean(dto.isPinned) : (dto.category === 'important');
    if (isPinned) {
      const currentPinnedCount = list.filter((item) => item.isPinned).length;
      if (currentPinnedCount >= MAX_PINNED_POSTS) {
        throw new Error('공지는 최대 5개 고정가능합니다.');
      }
    }

    const maxPostNumber = list.reduce(
      (max, item) => Math.max(max, item.postNumber || 0),
      0
    );

    const categoryConf = CATEGORY_CONFIG[dto.category] || { label: dto.categoryLabel || '안내' };

    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newPost = {
      ...dto,
      id,
      postNumber: maxPostNumber + 1,
      categoryLabel: dto.categoryLabel || categoryConf.label,
      views: 0,
      isPinned,
      attachments: dto.attachments || [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, newPost);

    return newPost;
  },

  /**
   * 게시글 수정
   */
  update: async (id, dto) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    const prev = await postFirebaseService.getById(id);
    if (!prev) {
      throw new Error(`Post with id "${id}" not found`);
    }

    const nowIso = new Date().toISOString();

    let isPinned = prev.isPinned;
    if (dto.isPinned !== undefined) {
      isPinned = Boolean(dto.isPinned);
      if (isPinned && !prev.isPinned) {
        const otherPinnedCount = await postFirebaseService.getPinnedCount(id);
        if (otherPinnedCount >= MAX_PINNED_POSTS) {
          throw new Error('공지는 최대 5개 고정가능합니다.');
        }
      }
    }

    let categoryLabel = prev.categoryLabel;
    if (dto.category && CATEGORY_CONFIG[dto.category]) {
      categoryLabel = CATEGORY_CONFIG[dto.category].label;
    }

    const updated = {
      ...prev,
      ...dto,
      isPinned,
      categoryLabel,
      updatedAt: nowIso,
    };

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...dto,
      isPinned,
      categoryLabel,
      updatedAt: nowIso,
    });

    return updated;
  },

  /**
   * 게시글 삭제
   */
  delete: async (id) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  /**
   * 조회수 1 증가
   */
  incrementViews: async (id) => {
    if (!db) return 0;
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        views: increment(1)
      });
      const updated = await postFirebaseService.getById(id);
      return updated?.views || 0;
    } catch (e) {
      console.warn('[Firestore] Failed to increment views:', e);
      return 0;
    }
  },

  /**
   * 이전글 및 다음글 탐색
   */
  getSiblings: async (currentId) => {
    const list = await postFirebaseService.getAll();
    return pickSiblings(list, currentId);
  },

  /**
   * 저장소 초기화 (기본 데이터로 리셋)
   */
  resetToInitial: async () => {
    if (!db) return;
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);

    // 기존 데이터 전체 삭제
    snapshot.docs.forEach((docItem) => {
      batch.delete(docItem.ref);
    });

    // 초기 데이터 재생성
    const initialPosts = generateInitialPosts();
    initialPosts.forEach((post) => {
      const docRef = doc(db, COLLECTION_NAME, post.id);
      batch.set(docRef, post);
    });

    await batch.commit();
  },
};
