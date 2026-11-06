import { postService } from '../services/postService.js';
import { authService } from '../services/authService.js';
import { CATEGORY_CONFIG } from '../types/post.js';

/**
 * Notice Application Controller
 * UI 컴포넌트: 오직 postService를 통해서만 데이터에 접근합니다.
 */

// 상수 및 상태
const ITEMS_PER_PAGE = 7;

// --------------------------------------------------------------------------
// 리치 텍스트 에디터 글꼴 정의
// bold: 'native'    → 실제 Bold 굵기 파일 보유
//       'synthetic' → Regular 단일 굵기 → 브라우저 합성 볼드로 표시
//       'stroke'    → Bold 단일 굵기 → 합성 불가, notice.css 의 text-stroke 보강으로 표시
// names: 계산된 font-family 의 첫 번째 글꼴명(소문자)과 매칭하기 위한 별칭 (구버전 값 포함)
// ※ EDITOR_DEFAULT_FONT_STACK 은 notice.css 의 --font-editor 와 동일하게 유지
// --------------------------------------------------------------------------
const EDITOR_DEFAULT_FONT_STACK = '"Duolingo Sans Editor", "Pretendard", "Noto Sans KR", system-ui, sans-serif';
const ZWSP = '​';

const BOLD_NOTICE = {
  synthetic: '전용 Bold 없음 · 굵게는 합성 표시',
  stroke: 'Bold 단일 굵기 · 굵게는 외곽선 보강으로 표시',
};

const EDITOR_FONTS = [
  {
    value: 'inherit',
    label: '기본 글꼴 (Duolingo)',
    name: '기본 글꼴 (Duolingo Sans)',
    names: ['duolingo sans editor', 'duolingo sans'],
    bold: 'synthetic',
    note: '영문 단일 굵기 · 한글은 Pretendard로 표시',
  },
  {
    value: "'Feather', 'Pretendard', sans-serif",
    label: 'Feather (듀오링고 디스플레이 · Bold 전용)',
    name: 'Feather',
    names: ['feather'],
    bold: 'stroke',
    note: '영문 전용 · 한글은 Pretendard로 표시',
  },
  {
    value: "'Pretendard', sans-serif",
    label: 'Pretendard (프리텐다드)',
    name: 'Pretendard',
    names: ['pretendard', 'pretendard variable'],
    bold: 'native',
  },
  {
    value: "'Noto Sans KR', sans-serif",
    label: 'Noto Sans KR (본고딕)',
    name: 'Noto Sans KR',
    names: ['noto sans kr'],
    bold: 'native',
  },
  {
    value: "'Noto Serif KR', serif",
    label: 'Noto Serif KR (명조체)',
    name: 'Noto Serif KR',
    names: ['noto serif kr'],
    bold: 'native',
  },
  {
    value: "'Gmarket Sans', sans-serif",
    label: 'Gmarket Sans',
    name: 'Gmarket Sans',
    names: ['gmarket sans', 'gmarketsansmedium'],
    bold: 'native',
  },
  {
    value: "'Courier New', monospace",
    label: '고정폭 (Monospace)',
    name: 'Courier New (고정폭)',
    names: ['courier new', 'monospace'],
    bold: 'native',
  },
];

const EDITOR_FONT_SIZES = [
  { value: '16px', label: '보통 (16px)' },
  { value: '13px', label: '작게 (13px)' },
  { value: '18px', label: '크게 (18px)' },
  { value: '22px', label: '소제목 (22px)' },
  { value: '26px', label: '대제목 (26px)' },
];

/** font-family 스택 문자열에서 첫 번째 글꼴명을 소문자로 추출 */
function primaryFontFamily(stack) {
  if (!stack) return '';
  return stack.split(',')[0].trim().replace(/^['"]|['"]$/g, '').toLowerCase();
}

/** 계산된 font-family 로 에디터 글꼴 정의를 찾음 (없으면 null) */
function findEditorFont(stack) {
  const primary = primaryFontFamily(stack);
  return EDITOR_FONTS.find((f) => f.names.includes(primary)) || null;
}

export class NoticeApp {
  constructor(containerEl) {
    this.container = containerEl;
    this.posts = [];
    this.totalCount = 0;
    this.filteredPosts = [];
    this.loading = true;

    // 필터 및 페이지네이션 상태
    this.categoryFilter = 'all';
    this.searchQuery = '';
    this.currentPage = 1;

    // 현재 뷰 상태 ('list', 'detail', 'write', 'edit')
    this.currentView = 'list';
    this.currentPostId = null;

    // 작성/수정 중 첨부파일 상태
    this.currentAttachments = [];

    this.init();
  }

  async init() {
    this.setupHashRouting();
    // 로그인 상태가 바뀌면(로그아웃, 권한 변경 등) 현재 화면을 권한에 맞게 다시 그림
    authService.onChange(() => {
      if (!this.loading) this.handleRoute({ fromAuthChange: true });
    });
    authService.verifySession();
    await this.loadPosts();
    this.handleRoute();
  }

  /** 글쓰기/수정/삭제 권한 (관리자 전용) */
  canManagePosts() {
    return authService.isAdmin();
  }

  /** 관리자 전용 기능 접근 시 안내 */
  denyManageAccess() {
    this.showToast(
      authService.isLoggedIn()
        ? '공지사항 작성·수정·삭제는 관리자만 할 수 있습니다.'
        : '관리자 로그인 후 이용할 수 있습니다.'
    );
  }

  setupHashRouting() {
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });
  }

  handleRoute({ fromAuthChange = false } = {}) {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const [route, id] = hash.split('/');

    // 글쓰기/수정 화면은 관리자만 접근 가능 (주소 직접 입력 포함)
    if ((route === 'write' || route === 'edit') && !this.canManagePosts()) {
      this.denyManageAccess();
      this.navigate(route === 'edit' && id ? `detail/${id}` : 'list');
      return;
    }

    if (route === 'write') {
      this.currentView = 'write';
      this.currentPostId = null;
      this.renderWrite();
    } else if (route === 'edit' && id) {
      this.currentView = 'edit';
      this.currentPostId = id;
      this.renderEdit(id);
    } else if (route === 'detail' && id) {
      this.currentView = 'detail';
      this.currentPostId = id;
      this.renderDetail(id, { countView: !fromAuthChange });
    } else {
      this.currentView = 'list';
      this.currentPostId = null;
      this.renderList();
    }

    this.updateHeroSubtitle();
    if (!fromAuthChange) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigate(hash) {
    window.location.hash = hash;
  }

  updateHeroSubtitle() {
    const subEl = document.getElementById('noticeHeroSubtitle');
    if (!subEl) return;

    if (this.currentView === 'write') {
      subEl.textContent = '듀오링고의 공지사항을 작성해요.';
    } else if (this.currentView === 'edit') {
      subEl.textContent = '듀오링고의 공지사항을 수정하세요.';
    } else {
      subEl.textContent = '듀오링고의 공지사항을 확인하세요.';
    }
  }

  async loadPosts() {
    try {
      this.loading = true;
      this.posts = await postService.getAll();
      this.applyFilters();
    } catch (err) {
      console.error('[NoticeApp] Failed to load posts:', err);
      this.showToast('공지사항을 불러오는 중 오류가 발생했습니다.');
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    let result = [...this.posts];

    // 카테고리 필터
    if (this.categoryFilter !== 'all') {
      result = result.filter((p) => p.category === this.categoryFilter);
    }

    // 검색어 필터
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.content && p.content.toLowerCase().includes(q))
      );
    }

    // 핀 고정 글 상단 우선 정렬, 그 다음 등록일 최신순
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    this.filteredPosts = result;
    this.totalCount = result.length;
  }

  // ==========================================================================
  // 1. 목록 화면 (List View)
  // ==========================================================================
  renderList() {
    const totalPages = Math.max(1, Math.ceil(this.filteredPosts.length / ITEMS_PER_PAGE));
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIdx = (this.currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = this.filteredPosts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const html = `
      <div class="notice-top-bar">
        <div class="notice-count" id="noticeCountText">
          전체 <strong>${this.totalCount}</strong>건
        </div>
        <div class="notice-top-bar__actions">
          <select class="notice-select" id="categorySelect" aria-label="카테고리 필터">
            <option value="all" ${this.categoryFilter === 'all' ? 'selected' : ''}>전체 카테고리</option>
            <option value="important" ${this.categoryFilter === 'important' ? 'selected' : ''}>중요</option>
            <option value="notice" ${this.categoryFilter === 'notice' ? 'selected' : ''}>안내</option>
            <option value="event" ${this.categoryFilter === 'event' ? 'selected' : ''}>이벤트</option>
            <option value="update" ${this.categoryFilter === 'update' ? 'selected' : ''}>업데이트</option>
          </select>

          <div class="notice-search">
            <svg class="notice-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              class="notice-search__input"
              id="searchInput"
              placeholder="공지사항 검색"
              value="${this.escapeHtml(this.searchQuery)}"
              aria-label="공지사항 검색"
            >
          </div>

          ${
            this.canManagePosts()
              ? `<a href="#write" class="btn btn--sm notice-write-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            글쓰기
          </a>`
              : ''
          }
        </div>
      </div>

      <div class="notice-table-container">
        <table class="notice-table" aria-label="공지사항 목록">
          <thead>
            <tr>
              <th scope="col" class="notice-col-num">번호</th>
              <th scope="col" class="notice-col-category">카테고리</th>
              <th scope="col" class="notice-col-title">제목</th>
              <th scope="col" class="notice-col-date">등록일</th>
              <th scope="col" class="notice-col-views">조회수</th>
            </tr>
          </thead>
          <tbody>
            ${
              pageItems.length === 0
                ? `<tr><td colspan="5" style="padding: 3.5rem 1rem; color: #888888;">등록된 공지사항이 없거나 검색 결과가 없습니다.</td></tr>`
                : pageItems.map((post) => this.renderTableRow(post)).join('')
            }
          </tbody>
        </table>
      </div>

      ${this.renderPaginationHtml(totalPages)}
    `;

    this.container.innerHTML = html;
    this.attachListEvents();
  }

  renderTableRow(post) {
    const isPinned = post.isPinned;
    const catConf = CATEGORY_CONFIG[post.category] || { label: post.categoryLabel || '안내', badgeClass: 'badge--notice' };
    const dateFormatted = this.formatDate(post.createdAt);
    const viewsFormatted = (post.views || 0).toLocaleString();

    return `
      <tr class="${isPinned ? 'is-pinned' : ''}" data-post-id="${post.id}">
        <td class="notice-col-num">
          ${
            isPinned
              ? `<span class="notice-pin-icon" title="상단 고정">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M16 3a1 1 0 0 1 1 1v1.5a1 1 0 0 1-.293.707L15 7.914V13l2 2v2h-6v4l-1 1-1-1v-4H3v-2l2-2V7.914l-1.707-1.707A1 1 0 0 1 3 5.5V4a1 1 0 0 1 1-1h12z"/>
                   </svg>
                 </span>`
              : `<span>${post.postNumber || '-'}</span>`
          }
        </td>
        <td class="notice-col-category">
          <span class="badge ${catConf.badgeClass}">${catConf.label}</span>
        </td>
        <td class="notice-col-title">
          <a href="#detail/${post.id}" class="notice-title-link" title="${this.escapeHtml(post.title)}">
            ${this.escapeHtml(post.title)}
          </a>
        </td>
        <td class="notice-col-date">${dateFormatted}</td>
        <td class="notice-col-views">${viewsFormatted}</td>
      </tr>
    `;
  }

  renderPaginationHtml(totalPages) {
    if (totalPages <= 1) return '';

    const current = this.currentPage;
    const pages = [];

    // 듀오링고 레퍼런스 스타일: 1 2 3 4 5 ... 19
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (current >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
      }
    }

    return `
      <nav class="notice-pagination" aria-label="게시판 페이지 이동">
        <button
          type="button"
          class="notice-page-btn"
          id="btnPrevPage"
          ${current === 1 ? 'disabled' : ''}
          aria-label="이전 페이지"
        >‹</button>

        ${pages
          .map((p) => {
            if (p === '...') {
              return `<span class="notice-page-ellipsis">…</span>`;
            }
            return `
              <button
                type="button"
                class="notice-page-btn ${p === current ? 'is-active' : ''}"
                data-page="${p}"
                aria-current="${p === current ? 'page' : 'false'}"
              >${p}</button>
            `;
          })
          .join('')}

        <button
          type="button"
          class="notice-page-btn"
          id="btnNextPage"
          ${current === totalPages ? 'disabled' : ''}
          aria-label="다음 페이지"
        >›</button>
      </nav>
    `;
  }

  attachListEvents() {
    // 카테고리 필터 변경
    const selectEl = this.container.querySelector('#categorySelect');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        this.categoryFilter = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
        this.renderList();
      });
    }

    // 검색창 입력 (디바운스)
    const searchEl = this.container.querySelector('#searchInput');
    if (searchEl) {
      let timer;
      searchEl.addEventListener('input', (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.searchQuery = e.target.value;
          this.currentPage = 1;
          this.applyFilters();
          this.renderList();
          // 포커스 복원
          const freshInput = this.container.querySelector('#searchInput');
          if (freshInput) {
            freshInput.focus();
            freshInput.setSelectionRange(freshInput.value.length, freshInput.value.length);
          }
        }, 200);
      });
    }

    // 테이블 행 클릭 시 상세 페이지로 이동
    const rows = this.container.querySelectorAll('.notice-table tbody tr');
    rows.forEach((tr) => {
      tr.addEventListener('click', (e) => {
        // a 태그 직접 클릭이 아닐 경우에도 이동
        if (e.target.closest('a')) return;
        const id = tr.getAttribute('data-post-id');
        if (id) this.navigate(`detail/${id}`);
      });
    });

    // 페이지네이션 클릭
    const pageBtns = this.container.querySelectorAll('.notice-page-btn[data-page]');
    pageBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page'), 10);
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          this.renderList();
          window.scrollTo({ top: 120, behavior: 'smooth' });
        }
      });
    });

    const prevBtn = this.container.querySelector('#btnPrevPage');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderList();
          window.scrollTo({ top: 120, behavior: 'smooth' });
        }
      });
    }

    const nextBtn = this.container.querySelector('#btnNextPage');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(this.filteredPosts.length / ITEMS_PER_PAGE);
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderList();
          window.scrollTo({ top: 120, behavior: 'smooth' });
        }
      });
    }
  }

  // ==========================================================================
  // 2. 상세보기 화면 (Detail View)
  // ==========================================================================
  async renderDetail(id, { countView = true } = {}) {
    this.container.innerHTML = `
      <div class="notice-loading">
        <div class="notice-spinner"></div>
        <p>공지사항을 불러오는 중입니다...</p>
      </div>
    `;

    try {
      // 조회수 증가 및 상세 데이터 조회 (로그인 상태 변경에 따른 재렌더링 시에는 증가하지 않음)
      if (countView) await postService.incrementViews(id);
      const post = await postService.getById(id);

      if (!post) {
        this.container.innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem;">
            <h3 style="margin-bottom: 1rem; color: #333;">존재하지 않거나 삭제된 공지사항입니다.</h3>
            <a href="#list" class="btn btn--sm">목록으로 돌아가기</a>
          </div>
        `;
        return;
      }

      // 이전글 / 다음글 정보 조회
      const { prev, next, nearby = [] } = await postService.getSiblings(id);
      const catConf = CATEGORY_CONFIG[post.category] || { label: post.categoryLabel || '안내', badgeClass: 'badge--notice' };
      const createdFormatted = this.formatDateTime(post.createdAt);

      const html = `
        <div class="notice-detail__header-bar">
          <a href="#list" class="btn btn--outline btn--sm">
            ‹ 목록으로
          </a>
        </div>

        <div class="notice-detail__post-meta">
          <span class="badge ${catConf.badgeClass}">${catConf.label}</span>
          <h2 class="notice-detail__title">${this.escapeHtml(post.title)}</h2>

          <div class="notice-meta-info">
            <span class="notice-meta-author">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#58cc02"/>
                <circle cx="8.5" cy="10" r="1.5" fill="#ffffff"/>
                <circle cx="15.5" cy="10" r="1.5" fill="#ffffff"/>
                <circle cx="8.5" cy="10" r="0.7" fill="#4b4b4b"/>
                <circle cx="15.5" cy="10" r="0.7" fill="#4b4b4b"/>
                <path d="M10.5 13.5L12 15L13.5 13.5" stroke="#ff9600" stroke-width="2" stroke-linecap="round"/>
              </svg>
              ${this.escapeHtml(post.author?.name || '듀오링고 운영팀')}
            </span>
            <span class="notice-meta-divider">|</span>
            <span>${createdFormatted}</span>
            <span class="notice-meta-divider">|</span>
            <span>👁 ${(post.views || 0).toLocaleString()}</span>
          </div>
        </div>

        <div class="notice-detail__content">
          ${post.content}
        </div>

        ${
          post.attachments && post.attachments.length > 0
            ? `
              <div class="notice-attachments-card">
                <span class="notice-attachments__label">첨부파일</span>
                <div class="notice-file-chips">
                  ${post.attachments
                    .map(
                      (att) => `
                    <div class="notice-attachment-chip" data-att-name="${this.escapeHtml(att.name)}" title="다운로드">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                      </svg>
                      <span>${this.escapeHtml(att.name)} (${att.formattedSize || '1.2MB'})</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
            : ''
        }

        <div class="notice-detail__footer-bar">
          <div class="notice-detail__nav">
            <button
              type="button"
              class="btn btn--outline btn--sm"
              id="btnPrevPost"
              ${prev ? '' : 'disabled'}
              title="${prev ? this.escapeHtml(prev.title) : '이전글 없음'}"
            >
              ‹ 이전글
            </button>
            <button
              type="button"
              class="btn btn--outline btn--sm"
              id="btnNextPost"
              ${next ? '' : 'disabled'}
              title="${next ? this.escapeHtml(next.title) : '다음글 없음'}"
            >
              다음글 ›
            </button>
          </div>
          <div class="notice-detail__footer-actions">
            ${
              this.canManagePosts()
                ? `<a href="#edit/${post.id}" class="btn btn--outline btn--text-primary btn--sm">
              ✏️ 수정하기
            </a>`
                : ''
            }
            <button type="button" class="btn btn--outline btn--sm" id="btnSharePost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              공유하기
            </button>
          </div>
        </div>

        ${this.renderSiblingList(nearby)}
      `;

      this.container.innerHTML = html;
      this.attachDetailEvents(post, prev, next);
    } catch (err) {
      console.error('[NoticeApp] Failed to load detail:', err);
      this.showToast('게시글을 불러올 수 없습니다.');
    }
  }

  /**
   * 상세 하단 이전글/다음글 미리보기 목록 (현재 글 포함 최대 3개)
   * @param {Array<{ post: object, offset: number }>} nearby
   */
  renderSiblingList(nearby) {
    if (nearby.length < 2) return '';

    const rows = nearby
      .map(({ post: item, offset }) => {
        const label = offset < 0 ? '이전글' : offset > 0 ? '다음글' : '현재 글';
        const arrow = offset < 0 ? '▲' : offset > 0 ? '▼' : '';
        const title = this.escapeHtml(item.title);
        const titleHtml =
          offset === 0
            ? `<span class="notice-siblings__title" aria-current="page">${title}</span>`
            : `<a class="notice-siblings__title" href="#detail/${item.id}">${title}</a>`;

        return `
          <li class="notice-siblings__item${offset === 0 ? ' is-current' : ''}">
            <span class="notice-siblings__label">${label}${arrow ? ` <span aria-hidden="true">${arrow}</span>` : ''}</span>
            ${titleHtml}
            <span class="notice-siblings__date">${this.formatDate(item.createdAt)}</span>
          </li>
        `;
      })
      .join('');

    return `
      <nav class="notice-siblings" aria-label="이전글 다음글 목록">
        <ul class="notice-siblings__list">${rows}</ul>
      </nav>
    `;
  }

  attachDetailEvents(post, prev, next) {
    const prevBtn = this.container.querySelector('#btnPrevPost');
    if (prevBtn && prev) {
      prevBtn.addEventListener('click', () => {
        this.navigate(`detail/${prev.id}`);
      });
    }

    const nextBtn = this.container.querySelector('#btnNextPost');
    if (nextBtn && next) {
      nextBtn.addEventListener('click', () => {
        this.navigate(`detail/${next.id}`);
      });
    }

    const shareBtn = this.container.querySelector('#btnSharePost');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(window.location.href);
            this.showToast('공지사항 링크가 복사되었습니다!');
          } else {
            this.showToast('공지사항 URL: ' + window.location.href);
          }
        } catch {
          this.showToast('공지사항 링크가 복사되었습니다!');
        }
      });
    }

    // 첨부파일 클릭 시 다운로드 시뮬레이션
    const attChips = this.container.querySelectorAll('.notice-attachment-chip');
    attChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const name = chip.getAttribute('data-att-name');
        this.showToast(`[다운로드] ${name} 파일 다운로드를 시작합니다.`);
      });
    });
  }

  // ==========================================================================
  // 3. 글쓰기 화면 (Write View)
  // ==========================================================================
  renderWrite() {
    this.currentAttachments = [];

    const html = `
      <div class="notice-form-header">
        <a href="#list" class="btn btn--outline btn--sm">‹ 목록으로</a>
        <h2 class="notice-form-header__title">
          <span>✏️</span> 공지사항 글쓰기
        </h2>
        <div style="width: 80px;"></div>
      </div>

      <form id="noticeWriteForm" novalidate>
        <div class="notice-form-group">
          <label class="notice-form-label" for="writeCategory">
            카테고리 <span class="required">*</span>
          </label>
          <div>
            <div class="notice-form-category-row">
              <select class="notice-select" id="writeCategory" required style="width: 200px;">
                <option value="" disabled selected>카테고리 선택</option>
                <option value="important">중요</option>
                <option value="notice">안내</option>
                <option value="event">이벤트</option>
                <option value="update">업데이트</option>
              </select>

              <label class="notice-pinned-toggle" for="writeIsPinned" title="상단 고정 공지는 최대 5개까지 설정할 수 있습니다.">
                <input type="checkbox" id="writeIsPinned" class="notice-pinned-checkbox">
                <span class="notice-pinned-toggle__icon">📌</span>
                <span class="notice-pinned-toggle__text">상단 고정 공지</span>
              </label>
            </div>
            <div id="writeCategoryError" style="color: #ea2b2b; font-size: 0.8125rem; margin-top: 4px; display: none;">카테고리를 선택해 주세요.</div>
          </div>
        </div>

        <div class="notice-form-group">
          <label class="notice-form-label" for="writeTitle">
            제목 <span class="required">*</span>
          </label>
          <div>
            <input
              type="text"
              class="notice-form-input"
              id="writeTitle"
              maxlength="100"
              placeholder="제목을 입력해 주세요. (최대 100자)"
              required
            >
            <div id="writeTitleError" style="color: #ea2b2b; font-size: 0.8125rem; margin-top: 4px; display: none;">제목을 입력해 주세요.</div>
          </div>
        </div>

        <div class="notice-form-group">
          <label class="notice-form-label" for="editorBody">
            내용 <span class="required">*</span>
          </label>
          <div>
            ${this.renderRichTextEditorHtml('공지 내용을 입력해 주세요.')}
            <div id="writeContentError" style="color: #ea2b2b; font-size: 0.8125rem; margin-top: 4px; display: none;">내용을 입력해 주세요.</div>
          </div>
        </div>

        <div class="notice-form-group">
          <label class="notice-form-label">
            첨부파일
          </label>
          <div class="notice-file-upload-wrap">
            <label class="btn btn--outline btn--sm">
              📎 파일 첨부
              <input type="file" id="writeFileInput" multiple style="display: none;" accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip">
            </label>
            <span class="notice-file-hint">최대 10MB, 최대 5개까지 첨부할 수 있어요. (jpg, png, pdf, doc, xls 등)</span>
            <div class="notice-file-chips" id="fileChipsContainer" style="width: 100%; margin-top: 0.5rem;"></div>
          </div>
        </div>

        <div class="notice-form-actions">
          <div></div>
          <div class="notice-form-actions__right">
            <button type="button" class="btn btn--outline btn--sm" id="btnCancelWrite">취소</button>
            <button type="submit" class="btn btn--sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              등록하기
            </button>
          </div>
        </div>
      </form>
    `;

    this.container.innerHTML = html;
    this.attachFormEvents('write');
  }

  // ==========================================================================
  // 4. 글수정 화면 (Edit View)
  // ==========================================================================
  async renderEdit(id) {
    this.container.innerHTML = `
      <div class="notice-loading">
        <div class="notice-spinner"></div>
        <p>수정할 공지사항을 불러오는 중입니다...</p>
      </div>
    `;

    try {
      const post = await postService.getById(id);
      if (!post) {
        this.showToast('게시글을 찾을 수 없습니다.');
        this.navigate('list');
        return;
      }

      this.currentAttachments = post.attachments ? [...post.attachments] : [];
      const updatedFormatted = this.formatDateTime(post.updatedAt || post.createdAt);

      const html = `
        <div class="notice-form-header">
          <a href="#detail/${post.id}" class="btn btn--outline btn--sm">‹ 목록으로</a>
          <h2 class="notice-form-header__title">
            <span>✏️</span> 공지사항 글수정
          </h2>
          <div class="notice-form-header__meta">
            마지막 수정: ${updatedFormatted}
          </div>
        </div>

        <form id="noticeEditForm" novalidate>
          <div class="notice-form-group">
            <label class="notice-form-label" for="editCategory">
              카테고리 <span class="required">*</span>
            </label>
            <div>
              <div class="notice-form-category-row">
                <select class="notice-select" id="editCategory" required style="width: 200px;">
                  <option value="important" ${post.category === 'important' ? 'selected' : ''}>중요</option>
                  <option value="notice" ${post.category === 'notice' ? 'selected' : ''}>안내</option>
                  <option value="event" ${post.category === 'event' ? 'selected' : ''}>이벤트</option>
                  <option value="update" ${post.category === 'update' ? 'selected' : ''}>업데이트</option>
                </select>

                <label class="notice-pinned-toggle" for="editIsPinned" title="상단 고정 공지는 최대 5개까지 설정할 수 있습니다.">
                  <input type="checkbox" id="editIsPinned" class="notice-pinned-checkbox" ${post.isPinned ? 'checked' : ''}>
                  <span class="notice-pinned-toggle__icon">📌</span>
                  <span class="notice-pinned-toggle__text">상단 고정 공지</span>
                </label>
              </div>
            </div>
          </div>

          <div class="notice-form-group">
            <label class="notice-form-label" for="editTitle">
              제목 <span class="required">*</span>
            </label>
            <div>
              <input
                type="text"
                class="notice-form-input"
                id="editTitle"
                maxlength="100"
                value="${this.escapeHtml(post.title)}"
                placeholder="제목을 입력해 주세요. (최대 100자)"
                required
              >
              <div id="editTitleError" style="color: #ea2b2b; font-size: 0.8125rem; margin-top: 4px; display: none;">제목을 입력해 주세요.</div>
            </div>
          </div>

          <div class="notice-form-group">
            <label class="notice-form-label" for="editorBody">
              내용 <span class="required">*</span>
            </label>
            <div>
              ${this.renderRichTextEditorHtml('공지 내용을 입력해 주세요.', post.content)}
              <div id="editContentError" style="color: #ea2b2b; font-size: 0.8125rem; margin-top: 4px; display: none;">내용을 입력해 주세요.</div>
            </div>
          </div>

          <div class="notice-form-group">
            <label class="notice-form-label">
              첨부파일
            </label>
            <div class="notice-file-upload-wrap">
              <div class="notice-file-chips" id="fileChipsContainer"></div>
              <label class="btn btn--outline btn--sm">
                📎 파일 추가
                <input type="file" id="editFileInput" multiple style="display: none;" accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip">
              </label>
              <span class="notice-file-hint">최대 10MB, 최대 5개까지 첨부 가능</span>
            </div>
          </div>

          <div class="notice-form-actions">
            <button type="button" class="btn btn--danger btn--sm" id="btnDeletePost">
              🗑️ 삭제하기
            </button>
            <div class="notice-form-actions__right">
              <button type="button" class="btn btn--outline btn--sm" id="btnCancelEdit">취소</button>
              <button type="submit" class="btn btn--sm">
                ✓ 수정하기
              </button>
            </div>
          </div>
        </form>
      `;

      this.container.innerHTML = html;
      this.attachFormEvents('edit', post);
    } catch (err) {
      console.error('[NoticeApp] Failed to load post for editing:', err);
      this.showToast('수정 화면을 불러오지 못했습니다.');
    }
  }

  // ==========================================================================
  // 5. Rich Text Editor & File Upload Helpers
  // ==========================================================================
  renderRichTextEditorHtml(placeholder, initialContent = '') {
    return `
      <div class="notice-editor">
        <div class="notice-editor__toolbar" role="toolbar" aria-label="텍스트 서식">
          <!-- 폰트 글꼴 및 크기 선택 옵션 -->
          <select class="editor-select" id="editorFontFamily" title="글꼴 선택" aria-label="글꼴 선택">
            <option value="" data-role="placeholder" disabled hidden>여러 글꼴</option>
            ${EDITOR_FONTS.map((f) => `<option value="${f.value}">${f.label}</option>`).join('')}
          </select>

          <select class="editor-select" id="editorFontSize" title="글자 크기" aria-label="글자 크기">
            <option value="" data-role="placeholder" disabled hidden>여러 크기</option>
            ${EDITOR_FONT_SIZES.map((s) => `<option value="${s.value}">${s.label}</option>`).join('')}
          </select>

          <span class="editor-divider"></span>

          <button type="button" class="editor-btn" data-command="bold" title="굵게 (Ctrl+B)"><strong>B</strong></button>
          <button type="button" class="editor-btn" data-command="italic" title="기울임 (Ctrl+I)"><em>I</em></button>
          <button type="button" class="editor-btn" data-command="underline" title="밑줄 (Ctrl+U)"><u>U</u></button>
          <button type="button" class="editor-btn" data-command="strikeThrough" title="취소선"><s>S</s></button>

          <span class="editor-divider"></span>

          <button type="button" class="editor-btn" data-command="insertUnorderedList" title="글머리 기호 목록">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
          <button type="button" class="editor-btn" data-command="insertOrderedList" title="번호 매기기 목록">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
          </button>

          <span class="editor-divider"></span>

          <button type="button" class="editor-btn" data-command="justifyLeft" title="왼쪽 정렬">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
          </button>
          <button type="button" class="editor-btn" data-command="justifyCenter" title="가운데 정렬">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
          <button type="button" class="editor-btn" data-command="justifyRight" title="오른쪽 정렬">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
          </button>

          <span class="editor-divider"></span>

          <button type="button" class="editor-btn" id="btnEditorLink" title="링크 삽입">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
          <button type="button" class="editor-btn" id="btnEditorImage" title="이미지 삽입">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button type="button" class="editor-btn" id="btnEditorInfoBox" title="안내 박스 삽입/해제 (선택한 문단을 배경 블록으로 감싸기)" aria-pressed="false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="4" fill="#e5f8d6"/><circle cx="7" cy="10" r="1.6" fill="currentColor" stroke="none"/><line x1="11" y1="10" x2="18" y2="10"/><line x1="11" y1="14" x2="16" y2="14"/></svg>
          </button>

          <span class="editor-divider"></span>

          <button type="button" class="editor-btn" data-command="undo" title="실행 취소 (Ctrl+Z)">↩</button>
          <button type="button" class="editor-btn" data-command="redo" title="다시 실행 (Ctrl+Y)">↪</button>
        </div>

        <div class="notice-editor__status" id="editorFontInfo" aria-live="polite">
          텍스트를 선택하면 적용된 글꼴이 여기에 표시됩니다.
        </div>

        <div
          class="notice-editor__body"
          id="editorBody"
          contenteditable="true"
          role="textbox"
          aria-multiline="true"
          data-placeholder="${placeholder}"
        >${initialContent}</div>

        <div class="notice-editor__counter" id="charCounter">
          0 / 5,000
        </div>
      </div>
    `;
  }

  attachFormEvents(mode, existingPost = null) {
    const isEdit = mode === 'edit';
    const form = this.container.querySelector(isEdit ? '#noticeEditForm' : '#noticeWriteForm');
    const categoryEl = this.container.querySelector(isEdit ? '#editCategory' : '#writeCategory');
    const titleEl = this.container.querySelector(isEdit ? '#editTitle' : '#writeTitle');
    const editorBody = this.container.querySelector('#editorBody');
    const charCounter = this.container.querySelector('#charCounter');
    const fileInput = this.container.querySelector(isEdit ? '#editFileInput' : '#writeFileInput');
    const chipsContainer = this.container.querySelector('#fileChipsContainer');
    const pinnedCheckbox = this.container.querySelector(isEdit ? '#editIsPinned' : '#writeIsPinned');

    // 상단 고정 체크박스 이벤트 바인딩
    if (pinnedCheckbox) {
      pinnedCheckbox.addEventListener('change', async (e) => {
        if (e.target.checked) {
          const pinnedCount = await postService.getPinnedCount(isEdit ? existingPost?.id : null);
          if (pinnedCount >= 5) {
            e.target.checked = false;
            this.showWarningModal('공지는 최대 5개 고정가능합니다.');
          }
        }
      });
    }

    // 에디터 선택 영역(Selection) 보존 + 툴바 상태(글꼴/크기/서식) 동기화
    // (드롭다운·프롬프트로 포커스가 빠져도 마지막 선택 영역을 복원하기 위함)
    this.savedRange = null;

    if (this.editorSelectionHandler) {
      document.removeEventListener('selectionchange', this.editorSelectionHandler);
    }
    const onSelectionChange = () => {
      if (!editorBody.isConnected) {
        document.removeEventListener('selectionchange', onSelectionChange);
        if (this.editorSelectionHandler === onSelectionChange) this.editorSelectionHandler = null;
        return;
      }
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const r = sel.getRangeAt(0);
      // 툴바/다른 입력란으로 포커스가 옮겨간 경우엔 마지막 상태 유지
      if (!editorBody.contains(r.commonAncestorContainer)) return;
      this.savedRange = r.cloneRange();
      this.updateToolbarState(editorBody, r);
    };
    this.editorSelectionHandler = onSelectionChange;
    document.addEventListener('selectionchange', onSelectionChange);

    // 글꼴 변경
    const fontSelect = this.container.querySelector('#editorFontFamily');
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        this.applyCustomStyle(editorBody, 'fontFamily', e.target.value);
        this.updateCharCount(editorBody, charCounter);
      });
    }

    // 글자 크기 변경
    const sizeSelect = this.container.querySelector('#editorFontSize');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        this.applyCustomStyle(editorBody, 'fontSize', e.target.value);
        this.updateCharCount(editorBody, charCounter);
      });
    }

    // 툴바 버튼 mousedown 시 에디터 포커스/선택 영역이 해제되지 않도록 방지
    this.container.querySelectorAll('.notice-editor__toolbar .editor-btn').forEach((btn) => {
      btn.addEventListener('mousedown', (e) => e.preventDefault());
    });

    // 에디터 툴바 커맨드 바인딩
    const toolbarBtns = this.container.querySelectorAll('.editor-btn[data-command]');
    toolbarBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-command');
        this.restoreEditorSelection(editorBody);
        document.execCommand(cmd, false, null);
        this.refreshEditorState(editorBody);
        this.updateCharCount(editorBody, charCounter);
      });
    });

    // 링크 삽입 버튼
    const linkBtn = this.container.querySelector('#btnEditorLink');
    if (linkBtn) {
      linkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = prompt('삽입할 링크 URL을 입력하세요:', 'https://');
        if (url) {
          const range = this.restoreEditorSelection(editorBody);
          if (range.collapsed) {
            // 선택된 텍스트가 없으면 URL 자체를 링크 텍스트로 삽입
            document.execCommand('insertHTML', false, `<a href="${this.escapeHtml(url)}">${this.escapeHtml(url)}</a>`);
          } else {
            document.execCommand('createLink', false, url);
          }
          this.refreshEditorState(editorBody);
          this.updateCharCount(editorBody, charCounter);
        }
      });
    }

    // 이미지 삽입 버튼
    const imgBtn = this.container.querySelector('#btnEditorImage');
    if (imgBtn) {
      imgBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = prompt('삽입할 이미지 URL을 입력하세요:');
        if (url) {
          this.restoreEditorSelection(editorBody);
          document.execCommand('insertImage', false, url);
          this.refreshEditorState(editorBody);
          this.updateCharCount(editorBody, charCounter);
        }
      });
    }

    // 안내 박스(배경 블록) 삽입/해제 버튼
    editorBody.querySelectorAll('.notice-info-box__icon').forEach((icon) => {
      icon.setAttribute('contenteditable', 'false');
    });
    const infoBoxBtn = this.container.querySelector('#btnEditorInfoBox');
    if (infoBoxBtn) {
      infoBoxBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleInfoBox(editorBody);
        this.updateCharCount(editorBody, charCounter);
      });
    }

    // 글자 수 카운터 + 단축키(Ctrl+B 등) 이후 툴바 상태 업데이트
    const updateCount = () => {
      this.updateCharCount(editorBody, charCounter);
    };
    editorBody.addEventListener('input', updateCount);
    editorBody.addEventListener('keyup', () => {
      updateCount();
      this.refreshEditorState(editorBody);
    });
    updateCount();

    // 첨부파일 렌더링
    this.renderFileChips(chipsContainer);

    // 파일 추가 핸들러
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        for (const file of files) {
          if (this.currentAttachments.length >= 5) {
            this.showToast('첨부파일은 최대 5개까지만 등록 가능합니다.');
            break;
          }
          if (file.size > 10 * 1024 * 1024) {
            this.showToast(`[${file.name}] 파일 용량이 10MB를 초과했습니다.`);
            continue;
          }

          const formatted = file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
            : `${Math.round(file.size / 1024)}KB`;

          this.currentAttachments.push({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name: file.name,
            size: file.size,
            formattedSize: formatted,
            type: file.type || 'application/octet-stream',
          });
        }

        fileInput.value = '';
        this.renderFileChips(chipsContainer);
      });
    }

    // 취소 버튼
    const cancelBtn = this.container.querySelector(isEdit ? '#btnCancelEdit' : '#btnCancelWrite');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (isEdit) {
          this.navigate(`detail/${existingPost.id}`);
        } else {
          this.navigate('list');
        }
      });
    }

    // 삭제 버튼 (수정 모드)
    if (isEdit) {
      const deleteBtn = this.container.querySelector('#btnDeletePost');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          this.showConfirmModal(
            '공지사항 삭제',
            '정말 이 공지사항을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.',
            async () => {
              if (!this.canManagePosts()) {
                this.denyManageAccess();
                return;
              }
              try {
                await postService.delete(existingPost.id);
                this.showToast('공지사항이 삭제되었습니다.');
                await this.loadPosts();
                this.navigate('list');
              } catch (err) {
                console.error(err);
                this.showToast('삭제 중 오류가 발생했습니다.');
              }
            }
          );
        });
      }
    }

    // 폼 제출 (등록 또는 수정)
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 작성 도중 로그아웃/권한 변경된 경우 차단
      if (!this.canManagePosts()) {
        this.denyManageAccess();
        return;
      }

      const category = categoryEl.value;
      const title = titleEl.value.trim();
      const content = this.getCleanEditorHtml(editorBody);
      const plainText = editorBody.innerText.replace(/​/g, '').trim();

      // 유효성 검증
      let isValid = true;

      const catErr = this.container.querySelector(isEdit ? '#editCategoryError' : '#writeCategoryError');
      if (!category) {
        if (catErr) catErr.style.display = 'block';
        isValid = false;
      } else {
        if (catErr) catErr.style.display = 'none';
      }

      const titleErr = this.container.querySelector(isEdit ? '#editTitleError' : '#writeTitleError');
      if (!title) {
        if (titleErr) titleErr.style.display = 'block';
        isValid = false;
      } else {
        if (titleErr) titleErr.style.display = 'none';
      }

      const contentErr = this.container.querySelector(isEdit ? '#editContentError' : '#writeContentError');
      if (!plainText && !editorBody.querySelector('img')) {
        if (contentErr) contentErr.style.display = 'block';
        isValid = false;
      } else {
        if (contentErr) contentErr.style.display = 'none';
      }

      if (!isValid) return;

      const isPinned = pinnedCheckbox ? Boolean(pinnedCheckbox.checked) : false;

      // 5개 초과 검증
      if (isPinned) {
        const pinnedCount = await postService.getPinnedCount(isEdit ? existingPost?.id : null);
        if (pinnedCount >= 5) {
          if (pinnedCheckbox) pinnedCheckbox.checked = false;
          this.showWarningModal('공지는 최대 5개 고정가능합니다.');
          return;
        }
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        if (isEdit) {
          await postService.update(existingPost.id, {
            category,
            title,
            content,
            isPinned,
            attachments: this.currentAttachments,
          });
          this.showToast('공지사항이 성공적으로 수정되었습니다.');
          await this.loadPosts();
          this.navigate(`detail/${existingPost.id}`);
        } else {
          const newPost = await postService.create({
            category,
            title,
            content,
            isPinned,
            author: {
              id: 'duo-admin',
              name: '듀오링고 운영팀',
              role: '관리자',
            },
            createdBy: authService.getCurrentUser()?.userId || null,
            attachments: this.currentAttachments,
          });
          this.showToast('공지사항이 등록되었습니다.');
          await this.loadPosts();
          this.navigate(`detail/${newPost.id}`);
        }
      } catch (err) {
        console.error('[NoticeApp] Submit error:', err);
        if (err.message && err.message.includes('최대 5개')) {
          this.showWarningModal(err.message);
        } else {
          this.showToast('처리 중 오류가 발생했습니다.');
        }
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 에디터 선택 영역 유틸
  // --------------------------------------------------------------------------

  /** 저장된 선택 영역을 복원하고 현재 Range 를 반환 (없으면 본문 끝에 커서 배치) */
  restoreEditorSelection(editorBody) {
    const saved =
      this.savedRange && editorBody.contains(this.savedRange.commonAncestorContainer)
        ? this.savedRange.cloneRange()
        : null;

    if (document.activeElement !== editorBody) {
      editorBody.focus({ preventScroll: true });
    }

    const selection = window.getSelection();
    if (saved) {
      selection.removeAllRanges();
      selection.addRange(saved);
      return saved;
    }
    if (selection.rangeCount > 0 && editorBody.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      return selection.getRangeAt(0);
    }
    const range = document.createRange();
    range.selectNodeContents(editorBody);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    return range;
  }

  /** 현재 선택 영역 기준으로 savedRange + 툴바 상태 갱신 */
  refreshEditorState(editorBody) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0);
    if (!editorBody.contains(r.commonAncestorContainer)) return;
    this.savedRange = r.cloneRange();
    this.updateToolbarState(editorBody, r);
  }

  /** Range 와 겹치는 텍스트 노드 구간 목록 [{ node, start, end }] (DOM 변경 없음) */
  getTextSegmentsInRange(range, root) {
    const segments = [];
    if (range.collapsed) return segments;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!range.intersectsNode(node)) continue;
      const start = node === range.startContainer ? range.startOffset : 0;
      const end = node === range.endContainer ? range.endOffset : node.data.length;
      if (end > start) segments.push({ node, start, end });
    }
    return segments;
  }

  /** 요소의 계산된 스타일이 원하는 값과 같은지 비교 */
  styleMatches(el, styleProp, wanted) {
    if (!el) return false;
    const computed = window.getComputedStyle(el)[styleProp];
    if (styleProp === 'fontFamily') {
      return primaryFontFamily(computed) === primaryFontFamily(wanted);
    }
    return computed === wanted;
  }

  // --------------------------------------------------------------------------
  // 글꼴 / 글자 크기 적용
  // - 선택 영역의 텍스트 노드 단위로 적용 (블록 요소 p/div/li 구조를 깨지 않음)
  // - 한 줄 안에 여러 글꼴이 섞여 있어도 선택한 부분만 정확히 변경
  // - 부모 span 이 다른 글꼴을 가진 경우에도 "기본 글꼴"로 되돌릴 수 있도록 명시값 지정
  // --------------------------------------------------------------------------
  applyCustomStyle(editorBody, styleProp, value) {
    const range = this.restoreEditorSelection(editorBody);
    const wanted = styleProp === 'fontFamily' && value === 'inherit' ? EDITOR_DEFAULT_FONT_STACK : value;
    if (!wanted) return;

    if (range.collapsed) {
      this.applyStyleAtCaret(editorBody, range, styleProp, wanted);
      this.refreshEditorState(editorBody);
      return;
    }

    const segments = this.getTextSegmentsInRange(range, editorBody);
    if (!segments.length) return;

    // 경계 텍스트 노드 분리 (끝 → 시작 순서로 분리해야 offset 이 유지됨)
    const targets = segments.map(({ node, start, end }) => {
      let target = node;
      if (end < target.data.length) target.splitText(end);
      if (start > 0) target = target.splitText(start);
      return target;
    });

    targets.forEach((textNode) => this.applyStyleToTextNode(editorBody, textNode, styleProp, wanted));
    this.normalizeEditorSpans(editorBody);

    // 적용한 텍스트 전체를 다시 선택 (연속 변경 가능)
    const first = targets[0];
    const last = targets[targets.length - 1];
    if (first.isConnected && last.isConnected) {
      const selection = window.getSelection();
      const newRange = document.createRange();
      newRange.setStart(first, 0);
      newRange.setEnd(last, last.data.length);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    this.refreshEditorState(editorBody);
  }

  applyStyleToTextNode(editorBody, textNode, styleProp, wanted) {
    const parent = textNode.parentElement;
    if (!parent || !editorBody.contains(parent)) return;

    // 텍스트 노드 하나만 감싸고 있는 span 은 재사용 (불필요한 중첩 방지)
    let target =
      parent !== editorBody && parent.tagName === 'SPAN' && parent.childNodes.length === 1 ? parent : null;

    if (target) target.style[styleProp] = '';
    // 상속값이 이미 원하는 값이면 별도 지정 불필요
    if (this.styleMatches(target || parent, styleProp, wanted)) return;

    if (!target) {
      target = document.createElement('span');
      parent.insertBefore(target, textNode);
      target.appendChild(textNode);
    }
    target.style[styleProp] = wanted;
  }

  /** 커서만 있는 상태: 이후 입력할 글자에 적용될 서식 span 삽입 */
  applyStyleAtCaret(editorBody, range, styleProp, wanted) {
    const selection = window.getSelection();
    const container = range.startContainer;
    const hostEl = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;

    const placeCaret = (node, offset) => {
      const r = document.createRange();
      r.setStart(node, offset);
      r.collapse(true);
      selection.removeAllRanges();
      selection.addRange(r);
    };

    // 이미 커서용 빈 span(ZWSP) 안이라면 그 span 의 스타일만 갱신 (글꼴→크기 연속 지정 대응)
    if (
      container.nodeType === Node.TEXT_NODE &&
      container.data === ZWSP &&
      hostEl &&
      hostEl !== editorBody &&
      hostEl.tagName === 'SPAN' &&
      hostEl.childNodes.length === 1
    ) {
      hostEl.style[styleProp] = '';
      if (!this.styleMatches(hostEl, styleProp, wanted)) hostEl.style[styleProp] = wanted;
      placeCaret(container, 1);
      return;
    }

    if (this.styleMatches(hostEl, styleProp, wanted)) return;

    const span = document.createElement('span');
    span.style[styleProp] = wanted;
    const zw = document.createTextNode(ZWSP);
    span.appendChild(zw);
    range.insertNode(span);
    placeCaret(zw, 1);
  }

  /** 빈 span 제거, 속성 없는 span 해제, 인접한 동일 스타일 span 병합 */
  normalizeEditorSpans(root) {
    const isPlainSpan = (el) =>
      el &&
      el.nodeType === Node.ELEMENT_NODE &&
      el.tagName === 'SPAN' &&
      Array.from(el.attributes).every((a) => a.name === 'style');

    const unwrap = (el) => {
      const parent = el.parentNode;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    };

    Array.from(root.querySelectorAll('span'))
      .reverse()
      .forEach((span) => {
        if (!root.contains(span) || !isPlainSpan(span)) return;
        if (!span.textContent && !span.querySelector('img, br')) {
          span.remove();
        } else if (!span.style.cssText.trim()) {
          unwrap(span);
        }
      });

    Array.from(root.querySelectorAll('span')).forEach((span) => {
      if (!root.contains(span) || !isPlainSpan(span)) return;
      let next = span.nextSibling;
      while (next) {
        if (next.nodeType === Node.TEXT_NODE && next.data === '') {
          const empty = next;
          next = next.nextSibling;
          empty.remove();
          continue;
        }
        if (isPlainSpan(next) && next.style.cssText === span.style.cssText) {
          while (next.firstChild) span.appendChild(next.firstChild);
          const merged = next;
          next = next.nextSibling;
          merged.remove();
          continue;
        }
        break;
      }
    });
  }

  /** 저장용 HTML: 커서용 ZWSP 와 빈/불필요 span 정리 */
  getCleanEditorHtml(editorBody) {
    const clone = editorBody.cloneNode(true);
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);
    textNodes.forEach((t) => {
      if (t.data.includes(ZWSP)) t.data = t.data.split(ZWSP).join('');
    });
    // 편집 전용 속성 제거 (안내 박스 아이콘의 contenteditable="false" 등)
    clone.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'));
    this.normalizeEditorSpans(clone);
    return clone.innerHTML.trim();
  }

  // --------------------------------------------------------------------------
  // 안내 박스 (배경색 블록: .notice-info-box)
  // - 커서만 있을 때: 현재 문단 아래에 템플릿 박스 삽입 (빈 문단이면 그 자리를 대체)
  // - 텍스트 선택 시: 선택한 문단들을 박스로 감싸기
  // - 커서가 박스 안에 있을 때: 박스 해제 (내용은 일반 문단으로 유지)
  // --------------------------------------------------------------------------
  findInfoBox(editorBody, node) {
    const el = node && (node.nodeType === Node.TEXT_NODE ? node.parentElement : node);
    const box = el && el.closest ? el.closest('.notice-info-box') : null;
    return box && editorBody.contains(box) && box !== editorBody ? box : null;
  }

  createInfoBoxElement() {
    const box = document.createElement('div');
    box.className = 'notice-info-box';
    box.innerHTML =
      '<div class="notice-info-box__icon" contenteditable="false">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#58cc02"/><path d="M12 7V13M12 16V17" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/></svg>' +
      '</div><div class="notice-info-box__content"></div>';
    return box;
  }

  isBlockNode(node) {
    return (
      node.nodeType === Node.ELEMENT_NODE &&
      /^(P|DIV|UL|OL|LI|H[1-6]|BLOCKQUOTE|PRE|TABLE|HR|FIGURE)$/.test(node.tagName)
    );
  }

  isEmptyBlock(node) {
    return (
      this.isBlockNode(node) &&
      !node.classList.contains('notice-info-box') &&
      node.textContent.split(ZWSP).join('').trim() === '' &&
      !node.querySelector('img')
    );
  }

  toggleInfoBox(editorBody) {
    const range = this.restoreEditorSelection(editorBody);
    const selection = window.getSelection();
    const placeCaret = (node, offset, endNode = node, endOffset = offset) => {
      const r = document.createRange();
      r.setStart(node, offset);
      r.setEnd(endNode, endOffset);
      selection.removeAllRanges();
      selection.addRange(r);
    };

    // 1) 박스 안에 커서가 있으면 → 해제
    const existing =
      this.findInfoBox(editorBody, range.startContainer) || this.findInfoBox(editorBody, range.endContainer);
    if (existing) {
      const content = existing.querySelector('.notice-info-box__content');
      const moved = content ? Array.from(content.childNodes) : [];
      const meaningful = moved.filter((n) => !(n.nodeType === Node.TEXT_NODE && !n.data.trim()));
      const frag = document.createDocumentFragment();
      if (meaningful.length) {
        meaningful.forEach((n) => frag.appendChild(n));
      } else {
        const p = document.createElement('p');
        p.appendChild(document.createElement('br'));
        frag.appendChild(p);
      }
      const first = frag.firstChild;
      existing.replaceWith(frag);
      placeCaret(first, 0);
      this.refreshEditorState(editorBody);
      return;
    }

    // 최상위(에디터 직계) 노드 찾기
    const topLevelOf = (node, offset) => {
      if (node === editorBody) {
        return editorBody.childNodes[Math.max(0, offset - 1)] || null;
      }
      let n = node;
      while (n && n.parentNode !== editorBody) n = n.parentNode;
      return n;
    };

    const box = this.createInfoBoxElement();
    const content = box.querySelector('.notice-info-box__content');

    if (!range.collapsed) {
      // 2) 선택한 문단들을 박스로 감싸기
      let startTop = topLevelOf(range.startContainer, range.startOffset);
      let endTop = topLevelOf(range.endContainer, range.endOffset);
      if (!startTop || !endTop) return;
      // 인라인 노드(텍스트, span 등)는 같은 줄의 인접 인라인까지 포함
      while (startTop.previousSibling && !this.isBlockNode(startTop) && !this.isBlockNode(startTop.previousSibling)) {
        startTop = startTop.previousSibling;
      }
      while (endTop.nextSibling && !this.isBlockNode(endTop) && !this.isBlockNode(endTop.nextSibling)) {
        endTop = endTop.nextSibling;
      }

      const nodes = [];
      for (let n = startTop; n; n = n.nextSibling) {
        nodes.push(n);
        if (n === endTop) break;
      }
      editorBody.insertBefore(box, startTop);

      let inlineGroup = null;
      nodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE && n.classList.contains('notice-info-box')) {
          // 기존 박스가 선택에 포함되면 내용만 합침 (박스 중첩 방지)
          const inner = n.querySelector('.notice-info-box__content');
          if (inner) Array.from(inner.childNodes).forEach((c) => content.appendChild(c));
          n.remove();
          inlineGroup = null;
        } else if (this.isBlockNode(n)) {
          content.appendChild(n);
          inlineGroup = null;
        } else {
          if (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'BR') {
            n.remove();
            inlineGroup = null;
            return;
          }
          if (!inlineGroup) {
            inlineGroup = document.createElement('p');
            content.appendChild(inlineGroup);
          }
          inlineGroup.appendChild(n);
        }
      });
      if (!content.childNodes.length) {
        content.innerHTML = '<p><br></p>';
      }
      placeCaret(content, 0, content, content.childNodes.length);
    } else {
      // 3) 커서 위치에 템플릿 박스 삽입
      content.innerHTML = '<p><strong>항목</strong>&nbsp;&nbsp; 내용을 입력하세요</p>';
      const currentTop = topLevelOf(range.startContainer, range.startOffset);
      if (currentTop && this.isEmptyBlock(currentTop)) {
        editorBody.replaceChild(box, currentTop);
      } else if (currentTop) {
        editorBody.insertBefore(box, currentTop.nextSibling);
      } else {
        editorBody.insertBefore(box, editorBody.firstChild);
      }
      const label = content.querySelector('strong').firstChild;
      placeCaret(label, 0, label, label.data.length);
    }

    // 박스 뒤에서 계속 입력할 수 있도록 빈 문단 확보
    const next = box.nextSibling;
    const nextIsTyping =
      next && !(next.nodeType === Node.ELEMENT_NODE && next.classList.contains('notice-info-box')) &&
      !(next.nodeType === Node.TEXT_NODE && !next.data.trim() && !next.nextSibling);
    if (!nextIsTyping) {
      const p = document.createElement('p');
      p.appendChild(document.createElement('br'));
      editorBody.insertBefore(p, box.nextSibling);
    }
    // 박스가 맨 앞이면 앞에도 입력용 문단 확보
    if (box === editorBody.firstChild) {
      const p = document.createElement('p');
      p.appendChild(document.createElement('br'));
      editorBody.insertBefore(p, box);
    }

    this.refreshEditorState(editorBody);
  }

  // --------------------------------------------------------------------------
  // 툴바 상태 표시 (선택 영역에 적용된 글꼴/크기/서식)
  // --------------------------------------------------------------------------
  updateToolbarState(editorBody, range) {
    const fontSelect = this.container.querySelector('#editorFontFamily');
    const sizeSelect = this.container.querySelector('#editorFontSize');
    const infoEl = this.container.querySelector('#editorFontInfo');

    // 1) 스타일을 확인할 요소 수집
    const elementOf = (node) => (node.nodeType === Node.TEXT_NODE ? node.parentElement : node);
    let elements = [];
    if (range.collapsed) {
      elements = [elementOf(range.startContainer)];
    } else {
      const segments = this.getTextSegmentsInRange(range, editorBody);
      // 블록 사이 공백/줄바꿈 텍스트는 글꼴 판정에서 제외 (혼합 오판 방지)
      const meaningful = segments.filter(
        (s) => s.node.data.slice(s.start, s.end).split(ZWSP).join('').trim() !== ''
      );
      elements = (meaningful.length ? meaningful : segments).map((s) => s.node.parentElement);
      if (!elements.length) elements = [elementOf(range.startContainer)];
    }
    elements = Array.from(new Set(elements.filter(Boolean)));

    // 2) 글꼴/크기 집계
    const fonts = new Map();
    const sizes = new Set();
    elements.forEach((el) => {
      const cs = window.getComputedStyle(el);
      const entry = findEditorFont(cs.fontFamily);
      if (entry) {
        fonts.set(entry.value, entry);
      } else {
        const raw = cs.fontFamily.split(',')[0].trim().replace(/^['"]|['"]$/g, '') || '알 수 없음';
        fonts.set(`raw:${raw}`, { value: null, name: raw, bold: 'unknown' });
      }
      sizes.add(cs.fontSize);
    });

    const fontList = Array.from(fonts.values());
    const sizeList = Array.from(sizes);

    // 3) 셀렉트 표시 (혼합/목록 외 값은 placeholder 옵션으로 표시)
    if (fontSelect) {
      if (fontList.length === 1) {
        this.setSelectDisplay(fontSelect, fontList[0].value, `기타: ${fontList[0].name}`);
      } else {
        this.setSelectDisplay(fontSelect, null, `여러 글꼴 (${fontList.length}종)`);
      }
    }
    if (sizeSelect) {
      if (sizeList.length === 1) {
        this.setSelectDisplay(sizeSelect, sizeList[0], sizeList[0]);
      } else {
        this.setSelectDisplay(sizeSelect, null, '여러 크기');
      }
    }

    // 4) 정보 표시줄
    if (infoEl) {
      const boldLabel = (f) => {
        if (f.bold === 'native') return '굵게 지원';
        if (BOLD_NOTICE[f.bold]) return `<span class="is-warn">${BOLD_NOTICE[f.bold]}</span>`;
        return '굵기 정보 없음';
      };
      const parts = [];
      if (fontList.length === 1) {
        const f = fontList[0];
        parts.push(`<span>글꼴: <strong>${this.escapeHtml(f.name)}</strong></span>`);
        if (f.note) parts.push(`<span>${this.escapeHtml(f.note)}</span>`);
        parts.push(`<span>${boldLabel(f)}</span>`);
      } else {
        const names = fontList.map((f) => `<strong>${this.escapeHtml(f.name)}</strong>`).join(', ');
        parts.push(`<span>여러 글꼴 혼합: ${names}</span>`);
        fontList
          .filter((f) => BOLD_NOTICE[f.bold])
          .forEach((f) => {
            parts.push(`<span class="is-warn">${this.escapeHtml(f.name)}: ${BOLD_NOTICE[f.bold]}</span>`);
          });
      }
      parts.push(`<span>크기: <strong>${this.escapeHtml(sizeList.join(', '))}</strong></span>`);
      infoEl.innerHTML = parts.join('');
    }

    // 5) 안내 박스 버튼 활성 상태 (커서가 박스 안에 있으면 "해제" 모드)
    const infoBoxBtn = this.container.querySelector('#btnEditorInfoBox');
    if (infoBoxBtn) {
      const inBox = Boolean(this.findInfoBox(editorBody, range.startContainer));
      infoBoxBtn.classList.toggle('is-active', inBox);
      infoBoxBtn.setAttribute('aria-pressed', inBox ? 'true' : 'false');
      infoBoxBtn.title = inBox ? '안내 박스 해제' : '안내 박스 삽입 (선택한 문단을 배경 블록으로 감싸기)';
    }

    // 6) 서식 버튼 활성 상태
    this.container.querySelectorAll('.editor-btn[data-command]').forEach((btn) => {
      const cmd = btn.getAttribute('data-command');
      if (cmd === 'undo' || cmd === 'redo') return;
      let active = false;
      try {
        active = document.queryCommandState(cmd);
      } catch (_) {
        active = false;
      }
      btn.classList.toggle('is-active', Boolean(active));
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  /** 셀렉트에 값 표시. 목록에 없는 값/혼합 상태면 placeholder 옵션에 텍스트를 넣어 표시 */
  setSelectDisplay(select, value, placeholderText) {
    const placeholder = select.querySelector('option[data-role="placeholder"]');
    const hasOption =
      value !== null && Array.from(select.options).some((o) => o !== placeholder && o.value === value);
    if (hasOption) {
      select.value = value;
    } else if (placeholder) {
      placeholder.textContent = placeholderText;
      placeholder.selected = true;
    }
  }

  updateCharCount(editorBody, charCounter) {
    if (!editorBody || !charCounter) return;
    const len = editorBody.innerText.replace(/​/g, '').trim().length;
    charCounter.textContent = `${len.toLocaleString()} / 5,000`;
    if (len > 5000) {
      charCounter.style.color = '#ea2b2b';
      charCounter.style.fontWeight = '700';
    } else {
      charCounter.style.color = '#888888';
      charCounter.style.fontWeight = '500';
    }
  }

  renderFileChips(container) {
    if (!container) return;
    if (!this.currentAttachments || this.currentAttachments.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = this.currentAttachments
      .map(
        (att, idx) => `
        <span class="notice-file-chip">
          <span>📄</span>
          <span>${this.escapeHtml(att.name)} (${att.formattedSize || '1.2MB'})</span>
          <button type="button" class="notice-file-chip__remove" data-file-idx="${idx}" title="삭제" aria-label="${att.name} 삭제">✕</button>
        </span>
      `
      )
      .join('');

    container.querySelectorAll('.notice-file-chip__remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-file-idx'), 10);
        this.currentAttachments.splice(idx, 1);
        this.renderFileChips(container);
      });
    });
  }

  // ==========================================================================
  // 6. UI Helpers (Toast, Modal, Formatters)
  // ==========================================================================
  showToast(message) {
    let toast = document.getElementById('noticeToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'noticeToast';
      toast.className = 'notice-toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('is-show');

    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('is-show');
    }, 2800);
  }

  showConfirmModal(title, description, onConfirm) {
    let backdrop = document.getElementById('noticeModalBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'noticeModalBackdrop';
      backdrop.className = 'notice-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    backdrop.innerHTML = `
      <div class="notice-modal" role="dialog" aria-modal="true">
        <h3 class="notice-modal__title">${this.escapeHtml(title)}</h3>
        <p class="notice-modal__desc">${this.escapeHtml(description)}</p>
        <div class="notice-modal__actions">
          <button type="button" class="btn btn--outline btn--sm" id="btnModalCancel">취소</button>
          <button type="button" class="btn btn--danger btn--sm" id="btnModalConfirm">삭제하기</button>
        </div>
      </div>
    `;

    backdrop.classList.add('is-open');

    const closeModal = () => {
      backdrop.classList.remove('is-open');
    };

    backdrop.querySelector('#btnModalCancel').addEventListener('click', closeModal);
    backdrop.querySelector('#btnModalConfirm').addEventListener('click', () => {
      closeModal();
      if (typeof onConfirm === 'function') onConfirm();
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  showWarningModal(message) {
    let backdrop = document.getElementById('noticeModalBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'noticeModalBackdrop';
      backdrop.className = 'notice-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    backdrop.innerHTML = `
      <div class="notice-modal" role="dialog" aria-modal="true" style="text-align: center; max-width: 380px;">
        <div style="font-size: 2.25rem; margin-bottom: 0.5rem; line-height: 1;">⚠️</div>
        <h3 class="notice-modal__title" style="margin-bottom: 0.5rem;">알림</h3>
        <p class="notice-modal__desc" style="margin-bottom: 1.5rem; font-size: 1rem; color: #2b2b2b; font-weight: 600; line-height: 1.5;">${this.escapeHtml(message)}</p>
        <div class="notice-modal__actions" style="justify-content: center;">
          <button type="button" class="btn btn--sm" id="btnModalWarningOk" style="min-width: 6rem;">확인</button>
        </div>
      </div>
    `;

    backdrop.classList.add('is-open');

    const closeModal = () => {
      backdrop.classList.remove('is-open');
    };

    const okBtn = backdrop.querySelector('#btnModalWarningOk');
    if (okBtn) {
      okBtn.addEventListener('click', closeModal);
      okBtn.focus();
    }

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }

  formatDateTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${day} ${hh}:${mm}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

