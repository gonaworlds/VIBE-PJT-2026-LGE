/**
 * Firebase Firestore 기반 Inquiry (Q&A) Service 구현체
 * 컬렉션명: duo_inquiries
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
import { generateInitialInquiries } from '../mock/initialInquiryData.js';
import { INQUIRY_CATEGORIES } from '../../types/inquiry.js';

const COLLECTION_NAME = 'duo_inquiries';

// 메모리 캐싱 및 시딩 진행 플래그
let isSeedingInProgress = false;

/**
 * 문의글 정렬 헬퍼 (작성일 최신순)
 */
function sortInquiries(items) {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
}

export const inquiryFirebaseService = {
  /**
   * 저장소 초기화 및 기본 문의글 6건 시딩 (DB 비어있을 시 최초 1회 실행)
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
        console.log('[Firestore] duo_inquiries 컬렉션이 비어 있어 기본 Q&A 6건을 Firestore에 시딩합니다...');
        const initialItems = generateInitialInquiries();
        const batch = writeBatch(db);

        initialItems.forEach((item) => {
          const docRef = doc(db, COLLECTION_NAME, item.id);
          batch.set(docRef, item);
        });

        await batch.commit();
        console.log('[Firestore] 초기 문의글 시딩 완료!');
        return sortInquiries(initialItems);
      }

      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return sortInquiries(items);
    } finally {
      isSeedingInProgress = false;
    }
  },

  /**
   * 전체 문의글 목록 조회
   */
  getAll: async () => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return await inquiryFirebaseService.initStorage();
    }

    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return sortInquiries(items);
  },

  /**
   * 단일 문의글 조회
   */
  getById: async (id) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return null;
    }

    return { id: snap.id, ...snap.data() };
  },

  /**
   * 신규 문의글 작성
   */
  create: async (dto) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    const colRef = collection(db, COLLECTION_NAME);
    const all = await inquiryFirebaseService.getAll();
    const maxNum = all.reduce((acc, cur) => Math.max(acc, cur.inquiryNumber || 0), 0);

    const newId = 'inq-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const catConf = INQUIRY_CATEGORIES[dto.category] || INQUIRY_CATEGORIES.etc;

    const newInquiry = {
      id: newId,
      inquiryNumber: maxNum + 1,
      category: dto.category,
      categoryLabel: catConf.label,
      title: dto.title.trim(),
      content: dto.content,
      author: {
        id: dto.author.id,
        name: dto.author.name,
      },
      isSecret: Boolean(dto.isSecret),
      status: 'waiting', // 초기 상태는 항상 '답변대기'
      views: 0,
      answer: null,
      attachments: Array.isArray(dto.attachments) ? dto.attachments : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, COLLECTION_NAME, newId);
    await setDoc(docRef, newInquiry);

    return newInquiry;
  },

  /**
   * 문의글 수정
   */
  update: async (id, dto) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error('해당 문의글을 찾을 수 없습니다.');
    }

    const catConf = dto.category ? (INQUIRY_CATEGORIES[dto.category] || INQUIRY_CATEGORIES.etc) : null;

    const updates = {
      updatedAt: new Date().toISOString(),
    };

    if (dto.title !== undefined) updates.title = dto.title.trim();
    if (dto.content !== undefined) updates.content = dto.content;
    if (dto.category !== undefined) {
      updates.category = dto.category;
      updates.categoryLabel = catConf ? catConf.label : '기타';
    }
    if (dto.isSecret !== undefined) updates.isSecret = Boolean(dto.isSecret);
    if (dto.attachments !== undefined) updates.attachments = dto.attachments;

    await updateDoc(docRef, updates);

    const updatedSnap = await getDoc(docRef);
    return { id: updatedSnap.id, ...updatedSnap.data() };
  },

  /**
   * 문의글 삭제
   */
  delete: async (id) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  },

  /**
   * 관리자 답변 등록 및 수정
   */
  saveAnswer: async (id, answerDto) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error('해당 문의글을 찾을 수 없습니다.');
    }

    const answer = {
      content: answerDto.content,
      adminId: answerDto.adminId || 'admin',
      adminName: answerDto.adminName || '듀오 고객센터',
      answeredAt: new Date().toISOString(),
    };

    await updateDoc(docRef, {
      status: 'answered',
      answer,
      updatedAt: new Date().toISOString(),
    });

    const updatedSnap = await getDoc(docRef);
    return { id: updatedSnap.id, ...updatedSnap.data() };
  },

  /**
   * 관리자 답변 삭제
   */
  deleteAnswer: async (id) => {
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status: 'waiting',
      answer: null,
      updatedAt: new Date().toISOString(),
    });

    const updatedSnap = await getDoc(docRef);
    return { id: updatedSnap.id, ...updatedSnap.data() };
  },

  /**
   * 조회수 증가
   */
  incrementViews: async (id) => {
    if (!db) return;

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        views: increment(1),
      });
    } catch (e) {
      console.warn('[Firestore] 조회수 증가 실패:', e);
    }
  },
};

