import { storageHelper } from './storageHelper.js';
import { generateInitialPosts } from './initialSeedData.js';
import { CATEGORY_CONFIG } from '../../types/post.js';

const STORAGE_KEY = 'mock_duo_notice_posts_v2';
const LEGACY_STORAGE_KEY = 'mock_duo_notice_posts';
export const MAX_PINNED_POSTS = 5;

/**
 * LocalStorage 기반 Mock Post Service 구현체
 * 가이드라인 지침 100% 준수: 비동기(Promise), crypto.randomUUID(), ISO 8601 타임스탬프
 */
export const postMockService = {
  /**
   * 저장소 초기화 (데이터가 없을 경우 초기 35건 / 5페이지 자동 시딩)
   * @returns {Promise<import('../../types/post.js').Post[]>}
   */
  initStorage: async () => {
    // 이전 128건 데이터가 남아있을 경우 정리
    await storageHelper.remove(LEGACY_STORAGE_KEY);

    let list = await storageHelper.get(STORAGE_KEY, null);
    if (!list || !Array.isArray(list) || list.length === 0) {
      list = generateInitialPosts();
      await storageHelper.set(STORAGE_KEY, list);
    }
    return list;
  },

  /**
   * 전체 게시글 목록 조회
   * @returns {Promise<import('../../types/post.js').Post[]>}
   */
  getAll: async () => {
    let list = await storageHelper.get(STORAGE_KEY, null);
    if (!list || !Array.isArray(list) || list.length === 0) {
      list = await postMockService.initStorage();
    }
    return list;
  },

  /**
   * 단일 게시글 조회
   * @param {string} id
   * @returns {Promise<import('../../types/post.js').Post | null>}
   */
  getById: async (id) => {
    const list = await postMockService.getAll();
    return list.find((item) => item.id === id) || null;
  },

  /**
   * 상단 고정 공지글 개수 조회 (수정 시 자기 자신 제외 가능)
   * @param {string} [excludeId]
   * @returns {Promise<number>}
   */
  getPinnedCount: async (excludeId = null) => {
    const list = await postMockService.getAll();
    return list.filter((item) => item.isPinned && item.id !== excludeId).length;
  },

  /**
   * 새 게시글 생성
   * @param {import('../../types/post.js').CreatePostDto} dto
   * @returns {Promise<import('../../types/post.js').Post>}
   */
  create: async (dto) => {
    const list = await postMockService.getAll();
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

    const newPost = {
      ...dto,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      postNumber: maxPostNumber + 1,
      categoryLabel: dto.categoryLabel || categoryConf.label,
      views: 0,
      isPinned,
      attachments: dto.attachments || [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 최신 글이 맨 위로 오도록 unshift (단, 핀 고정 글이 최상단 유지)
    list.unshift(newPost);
    await storageHelper.set(STORAGE_KEY, list);
    return newPost;
  },

  /**
   * 게시글 수정
   * @param {string} id
   * @param {import('../../types/post.js').UpdatePostDto} dto
   * @returns {Promise<import('../../types/post.js').Post>}
   */
  update: async (id, dto) => {
    const list = await postMockService.getAll();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Post with id "${id}" not found`);
    }

    const nowIso = new Date().toISOString();
    const prev = list[index];

    let isPinned = prev.isPinned;
    if (dto.isPinned !== undefined) {
      isPinned = Boolean(dto.isPinned);
      if (isPinned && !prev.isPinned) {
        const otherPinnedCount = list.filter((item) => item.isPinned && item.id !== id).length;
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

    list[index] = updated;
    await storageHelper.set(STORAGE_KEY, list);
    return updated;
  },

  /**
   * 게시글 삭제
   * @param {string} id
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    const list = await postMockService.getAll();
    const filtered = list.filter((item) => item.id !== id);
    await storageHelper.set(STORAGE_KEY, filtered);
  },

  /**
   * 조회수 1 증가
   * @param {string} id
   * @returns {Promise<number>} 업데이트된 조회수
   */
  incrementViews: async (id) => {
    const list = await postMockService.getAll();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return 0;

    list[index].views = (list[index].views || 0) + 1;
    await storageHelper.set(STORAGE_KEY, list);
    return list[index].views;
  },

  /**
   * 이전글 및 다음글 ID/제목 탐색
   * @param {string} currentId
   * @returns {Promise<{ prev: import('../../types/post.js').Post | null, next: import('../../types/post.js').Post | null }>}
   */
  getSiblings: async (currentId) => {
    const list = await postMockService.getAll();
    const index = list.findIndex((item) => item.id === currentId);
    if (index === -1) return { prev: null, next: null };

    // index - 1은 더 최신 글(이전글/다음글 네비게이션용)
    return {
      prev: index > 0 ? list[index - 1] : null,
      next: index < list.length - 1 ? list[index + 1] : null,
    };
  },

  /**
   * 저장소 초기화 (초기 데이터로 리셋)
   * @returns {Promise<void>}
   */
  resetToInitial: async () => {
    const initial = generateInitialPosts();
    await storageHelper.set(STORAGE_KEY, initial);
  },
};

