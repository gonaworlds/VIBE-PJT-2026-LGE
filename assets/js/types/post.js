/**
 * @typedef {Object} PostAuthor
 * @property {string} id
 * @property {string} name
 * @property {string} [role]
 * @property {string} [avatarUrl]
 */

/**
 * @typedef {Object} PostAttachment
 * @property {string} id
 * @property {string} name
 * @property {number} size
 * @property {string} formattedSize
 * @property {string} type
 * @property {string} [url]
 * @property {string} [dataUrl]
 */

/**
 * @typedef {'important' | 'notice' | 'event' | 'update'} PostCategory
 */

/**
 * @typedef {Object} Post
 * @property {string} id - 고유 식별자 (crypto.randomUUID() 또는 Firestore doc.id)
 * @property {number} [postNumber] - 화면 표시용 게시글 가상 번호
 * @property {PostCategory} category - 카테고리 ('important', 'notice', 'event', 'update')
 * @property {string} categoryLabel - 카테고리 표시 라벨 ('중요', '안내', '이벤트', '업데이트')
 * @property {string} title - 게시글 제목
 * @property {string} content - 게시글 본문 (HTML)
 * @property {PostAuthor} author - 작성자 정보
 * @property {number} views - 조회수
 * @property {boolean} isPinned - 상단 고정 핀 여부
 * @property {PostAttachment[]} attachments - 첨부파일 목록
 * @property {string} createdAt - 생성일시 (ISO 8601 문자열)
 * @property {string} updatedAt - 수정일시 (ISO 8601 문자열)
 */

/**
 * @typedef {Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views'> & { views?: number }} CreatePostDto
 */

/**
 * @typedef {Partial<CreatePostDto>} UpdatePostDto
 */

export const CATEGORY_CONFIG = {
  important: {
    key: 'important',
    label: '중요',
    badgeClass: 'badge--important',
  },
  notice: {
    key: 'notice',
    label: '안내',
    badgeClass: 'badge--notice',
  },
  event: {
    key: 'event',
    label: '이벤트',
    badgeClass: 'badge--event',
  },
  update: {
    key: 'update',
    label: '업데이트',
    badgeClass: 'badge--update',
  },
};

