/**
 * Inquiry (1:1 문의 / Q&A) Service 진입점
 * UI 컴포넌트는 오직 이 inquiryService를 통해서만 데이터에 접근하고 권한 검사를 수행합니다.
 */

import { inquiryFirebaseService } from './firebase/inquiryFirebaseService.js';
import { authService } from './authService.js';

export const inquiryService = {
  ...inquiryFirebaseService,

  /**
   * 글쓰기 권한 검사 (로그인 회원만 가능)
   */
  create: async (dto) => {
    const user = authService.getCurrentUser();
    if (!user) {
      const err = new Error('로그인한 회원만 문의글을 작성할 수 있습니다.');
      err.code = 'auth/unauthorized';
      throw err;
    }

    const payload = {
      ...dto,
      author: {
        id: user.userId,
        name: user.name,
      },
    };

    return inquiryFirebaseService.create(payload);
  },

  /**
   * 글수정 권한 검사 (본인만 가능)
   */
  update: async (id, dto) => {
    const user = authService.getCurrentUser();
    if (!user) {
      const err = new Error('로그인이 필요합니다.');
      err.code = 'auth/unauthorized';
      throw err;
    }

    const existing = await inquiryFirebaseService.getById(id);
    if (!existing) {
      throw new Error('해당 문의글을 찾을 수 없습니다.');
    }

    if (existing.author.id !== user.userId) {
      const err = new Error('본인이 작성한 문의글만 수정할 수 있습니다.');
      err.code = 'auth/forbidden';
      throw err;
    }

    return inquiryFirebaseService.update(id, dto);
  },

  /**
   * 글삭제 권한 검사 (본인 또는 관리자만 가능)
   */
  delete: async (id) => {
    const user = authService.getCurrentUser();
    if (!user) {
      const err = new Error('로그인이 필요합니다.');
      err.code = 'auth/unauthorized';
      throw err;
    }

    const existing = await inquiryFirebaseService.getById(id);
    if (!existing) {
      throw new Error('해당 문의글을 찾을 수 없습니다.');
    }

    const isAuthor = existing.author.id === user.userId;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      const err = new Error('본인의 글 또는 관리자만 삭제할 수 있습니다.');
      err.code = 'auth/forbidden';
      throw err;
    }

    return inquiryFirebaseService.delete(id);
  },

  /**
   * 관리자 답변 등록 및 수정 (관리자 전용)
   */
  saveAnswer: async (id, answerDto) => {
    if (!authService.isAdmin()) {
      const err = new Error('답변은 관리자만 등록·수정할 수 있습니다.');
      err.code = 'auth/forbidden';
      throw err;
    }

    const admin = authService.getCurrentUser();
    return inquiryFirebaseService.saveAnswer(id, {
      ...answerDto,
      adminId: admin.userId,
      adminName: admin.name || '듀오 고객센터',
    });
  },

  /**
   * 관리자 답변 삭제 (관리자 전용)
   */
  deleteAnswer: async (id) => {
    if (!authService.isAdmin()) {
      const err = new Error('답변 삭제는 관리자만 가능합니다.');
      err.code = 'auth/forbidden';
      throw err;
    }

    return inquiryFirebaseService.deleteAnswer(id);
  },

  /**
   * 권한 헬퍼 함수들
   */
  canWrite: () => authService.isLoggedIn(),

  canViewDetail: (inquiry, user = authService.getCurrentUser()) => {
    if (!inquiry) return false;
    // 공개글은 누구나 볼 수 있음
    if (!inquiry.isSecret) return true;
    // 비공개글은 작성자 본인 또는 관리자만 열람 가능
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.userId === inquiry.author?.id;
  },

  canEdit: (inquiry, user = authService.getCurrentUser()) => {
    if (!inquiry || !user) return false;
    return user.userId === inquiry.author?.id;
  },

  canDelete: (inquiry, user = authService.getCurrentUser()) => {
    if (!inquiry || !user) return false;
    return user.role === 'admin' || user.userId === inquiry.author?.id;
  },

  canAnswer: (user = authService.getCurrentUser()) => {
    return Boolean(user && user.role === 'admin');
  },
};

