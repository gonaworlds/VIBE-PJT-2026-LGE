import { postService } from '../services/postService.js';
import { CATEGORY_CONFIG } from '../types/post.js';

/**
 * Notice Application Controller
 * UI 컴포넌트: 오직 postService를 통해서만 데이터에 접근합니다.
 */

// 상수 및 상태
const ITEMS_PER_PAGE = 7;

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
    await this.loadPosts();
    this.handleRoute();
  }

  setupHashRouting() {
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });
  }

  handleRoute() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const [route, id] = hash.split('/');

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
      this.renderDetail(id);
    } else {
      this.currentView = 'list';
      this.currentPostId = null;
      this.renderList();
    }

    this.updateHeroSubtitle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

          <a href="#write" class="btn btn--write">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            글쓰기
          </a>
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
  async renderDetail(id) {
    this.container.innerHTML = `
      <div class="notice-loading">
        <div class="notice-spinner"></div>
        <p>공지사항을 불러오는 중입니다...</p>
      </div>
    `;

    try {
      // 조회수 증가 및 상세 데이터 조회
      await postService.incrementViews(id);
      const post = await postService.getById(id);

      if (!post) {
        this.container.innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem;">
            <h3 style="margin-bottom: 1rem; color: #333;">존재하지 않거나 삭제된 공지사항입니다.</h3>
            <a href="#list" class="btn btn--write">목록으로 돌아가기</a>
          </div>
        `;
        return;
      }

      // 이전글 / 다음글 정보 조회
      const { prev, next } = await postService.getSiblings(id);
      const catConf = CATEGORY_CONFIG[post.category] || { label: post.categoryLabel || '안내', badgeClass: 'badge--notice' };
      const createdFormatted = this.formatDateTime(post.createdAt);

      const html = `
        <div class="notice-detail__header-bar">
          <a href="#list" class="notice-btn-back">
            ‹ 목록으로
          </a>
          <div class="notice-detail__nav">
            <button
              type="button"
              class="notice-btn-back"
              id="btnPrevPost"
              ${!prev ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}
              title="${prev ? this.escapeHtml(prev.title) : '이전글 없음'}"
            >
              ‹ 이전글
            </button>
            <button
              type="button"
              class="notice-btn-back"
              id="btnNextPost"
              ${!next ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}
              title="${next ? this.escapeHtml(next.title) : '다음글 없음'}"
            >
              다음글 ›
            </button>
          </div>
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
          <a href="#list" class="notice-btn-back">
            ‹ 목록으로
          </a>
          <div class="notice-detail__footer-actions">
            <a href="#edit/${post.id}" class="notice-btn-back" style="color: var(--color-tree-green); border-color: var(--color-tree-green);">
              ✏️ 수정하기
            </a>
            <button type="button" class="notice-btn-back" id="btnSharePost">
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
      `;

      this.container.innerHTML = html;
      this.attachDetailEvents(post, prev, next);
    } catch (err) {
      console.error('[NoticeApp] Failed to load detail:', err);
      this.showToast('게시글을 불러올 수 없습니다.');
    }
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
        <a href="#list" class="notice-btn-back">‹ 목록으로</a>
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
            <label class="btn btn--outline" style="min-height: 2.25rem; padding-inline: 1rem; cursor: pointer;">
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
            <button type="button" class="btn btn--cancel" id="btnCancelWrite">취소</button>
            <button type="submit" class="btn btn--submit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
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
          <a href="#detail/${post.id}" class="notice-btn-back">‹ 목록으로</a>
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
              <label class="btn btn--outline" style="min-height: 2.25rem; padding-inline: 1rem; cursor: pointer;">
                📎 파일 추가
                <input type="file" id="editFileInput" multiple style="display: none;" accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip">
              </label>
              <span class="notice-file-hint">최대 10MB, 최대 5개까지 첨부 가능</span>
            </div>
          </div>

          <div class="notice-form-actions">
            <button type="button" class="btn btn--delete" id="btnDeletePost">
              🗑️ 삭제하기
            </button>
            <div class="notice-form-actions__right">
              <button type="button" class="btn btn--cancel" id="btnCancelEdit">취소</button>
              <button type="submit" class="btn btn--submit">
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
            <option value="inherit">기본 글꼴 (Duolingo)</option>
            <option value="'Feather', sans-serif">Feather (듀오링고 디스플레이)</option>
            <option value="'Pretendard', sans-serif">Pretendard (프리텐다드)</option>
            <option value="'Noto Sans KR', sans-serif">Noto Sans KR (본고딕)</option>
            <option value="'Noto Serif KR', serif">Noto Serif KR (명조체)</option>
            <option value="'Gmarket Sans', sans-serif">Gmarket Sans</option>
            <option value="'Courier New', monospace">고정폭 (Monospace)</option>
          </select>

          <select class="editor-select" id="editorFontSize" title="글자 크기" aria-label="글자 크기">
            <option value="16px">보통 (16px)</option>
            <option value="13px">작게 (13px)</option>
            <option value="18px">크게 (18px)</option>
            <option value="22px">소제목 (22px)</option>
            <option value="26px">대제목 (26px)</option>
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

          <span class="editor-divider"></span>

          <button type="button" class="editor-btn" data-command="undo" title="실행 취소 (Ctrl+Z)">↩</button>
          <button type="button" class="editor-btn" data-command="redo" title="다시 실행 (Ctrl+Y)">↪</button>
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

    // 에디터 선택 영역(Selection) 보존 로직
    // (드롭다운 클릭 시 selection이 해제되는 브라우저 기본 동작 방지)
    const updateSavedRange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const r = sel.getRangeAt(0);
        if (editorBody.contains(r.commonAncestorContainer)) {
          this.savedRange = r.cloneRange();
        }
      }
    };

    editorBody.addEventListener('mouseup', updateSavedRange);
    editorBody.addEventListener('keyup', updateSavedRange);
    editorBody.addEventListener('focus', updateSavedRange);

    // 글꼴 변경
    const fontSelect = this.container.querySelector('#editorFontFamily');
    if (fontSelect) {
      fontSelect.addEventListener('mousedown', updateSavedRange);
      fontSelect.addEventListener('change', (e) => {
        const font = e.target.value;
        this.applyCustomStyle(editorBody, 'fontFamily', font);
      });
    }

    // 글자 크기 변경
    const sizeSelect = this.container.querySelector('#editorFontSize');
    if (sizeSelect) {
      sizeSelect.addEventListener('mousedown', updateSavedRange);
      sizeSelect.addEventListener('change', (e) => {
        const size = e.target.value;
        this.applyCustomStyle(editorBody, 'fontSize', size);
      });
    }

    // 에디터 툴바 커맨드 바인딩
    const toolbarBtns = this.container.querySelectorAll('.editor-btn[data-command]');
    toolbarBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-command');
        document.execCommand(cmd, false, null);
        editorBody.focus();
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
          document.execCommand('createLink', false, url);
          editorBody.focus();
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
          document.execCommand('insertImage', false, url);
          editorBody.focus();
        }
      });
    }

    // 글자 수 카운터 업데이트
    const updateCount = () => {
      this.updateCharCount(editorBody, charCounter);
    };
    editorBody.addEventListener('input', updateCount);
    editorBody.addEventListener('keyup', updateCount);
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

      const category = categoryEl.value;
      const title = titleEl.value.trim();
      const content = editorBody.innerHTML.trim();
      const plainText = editorBody.innerText.trim();

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

  applyCustomStyle(editorBody, styleProp, value) {
    editorBody.focus();

    // 1. 저장된 선택 영역 복원
    const selection = window.getSelection();
    let range = null;
    if (this.savedRange) {
      selection.removeAllRanges();
      selection.addRange(this.savedRange);
      range = this.savedRange;
    } else if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }

    if (!range || !editorBody.contains(range.commonAncestorContainer)) {
      // 선택 영역이 없을 때 에디터 기본 스타일 적용
      if (styleProp === 'fontFamily') {
        editorBody.style.fontFamily = value === 'inherit' ? '' : value;
      } else if (styleProp === 'fontSize') {
        editorBody.style.fontSize = value;
      }
      return;
    }

    // 2. 텍스트가 드래그 선택된 상태
    if (!range.collapsed) {
      let container = range.commonAncestorContainer;
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement;
      }

      // 조상 span의 기존 스타일(예: fontFamily 변경 시 기존 fontSize 유지 등) 수집
      const inheritedStyles = {};
      let ancestor = container;
      while (ancestor && ancestor !== editorBody) {
        if (ancestor.tagName === 'SPAN' && ancestor.style) {
          if (ancestor.style.fontFamily && styleProp !== 'fontFamily') {
            inheritedStyles.fontFamily = ancestor.style.fontFamily;
          }
          if (ancestor.style.fontSize && styleProp !== 'fontSize') {
            inheritedStyles.fontSize = ancestor.style.fontSize;
          }
          if (ancestor.style.fontWeight) {
            inheritedStyles.fontWeight = ancestor.style.fontWeight;
          }
          if (ancestor.style.color) {
            inheritedStyles.color = ancestor.style.color;
          }
        }
        ancestor = ancestor.parentElement;
      }

      // 만약 선택 영역이 이미 단일 SPAN 전체를 가리키고 있다면 직접 덮어쓰기
      if (
        container &&
        container !== editorBody &&
        container.tagName === 'SPAN' &&
        range.toString() === container.textContent
      ) {
        if (value === 'inherit') {
          container.style[styleProp] = '';
        } else {
          container.style[styleProp] = value;
        }

        // 스타일이 비어있으면 불필요한 태그 정리
        if (!container.getAttribute('style') || container.style.cssText.trim() === '') {
          const parent = container.parentNode;
          while (container.firstChild) {
            parent.insertBefore(container.firstChild, container);
          }
          parent.removeChild(container);
        }

        const newRange = document.createRange();
        newRange.selectNodeContents(container);
        selection.removeAllRanges();
        selection.addRange(newRange);
        this.savedRange = newRange.cloneRange();
        return;
      }

      // 내용 추출
      const fragment = range.extractContents();

      // 추출된 내부의 모든 자식에서 동일 styleProp 제거 (중첩 방지 핵심)
      this.cleanStyleFromFragment(fragment, styleProp);

      // 새 span 생성 및 스타일 병합
      const span = document.createElement('span');
      Object.assign(span.style, inheritedStyles);

      if (value !== 'inherit') {
        span.style[styleProp] = value;
      } else {
        span.style[styleProp] = '';
      }

      span.appendChild(fragment);
      range.insertNode(span);

      // 선택 영역을 새로 감싼 span으로 재지정 (연속 변경 가능하도록 보장)
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
      this.savedRange = newRange.cloneRange();
    } else {
      // 3. 커서만 있는 상태 (타이핑 전 서식 지정)
      const span = document.createElement('span');
      if (value !== 'inherit') {
        span.style[styleProp] = value;
      }
      const textNode = document.createTextNode('\u200B'); // zero-width space
      span.appendChild(textNode);
      range.insertNode(span);

      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStart(textNode, 1);
      newRange.setEnd(textNode, 1);
      selection.addRange(newRange);
      this.savedRange = newRange.cloneRange();
    }
  }

  cleanStyleFromFragment(fragment, styleProp) {
    if (!fragment) return;
    const elements = fragment.querySelectorAll ? Array.from(fragment.querySelectorAll('*')) : [];
    elements.forEach((el) => {
      if (el.style) {
        el.style[styleProp] = '';
        if (el.tagName === 'SPAN' && (!el.getAttribute('style') || el.style.cssText.trim() === '') && !el.className && !el.id) {
          const parent = el.parentNode;
          if (parent) {
            while (el.firstChild) {
              parent.insertBefore(el.firstChild, el);
            }
            parent.removeChild(el);
          }
        }
      }
      if (el.tagName === 'FONT') {
        if (styleProp === 'fontFamily') el.removeAttribute('face');
        if (styleProp === 'fontSize') el.removeAttribute('size');
      }
    });
  }

  updateCharCount(editorBody, charCounter) {
    if (!editorBody || !charCounter) return;
    const len = editorBody.innerText.trim().length;
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
          <button type="button" class="btn btn--cancel" id="btnModalCancel" style="min-height: 2.5rem; padding-inline: 1rem;">취소</button>
          <button type="button" class="btn btn--delete" id="btnModalConfirm" style="min-height: 2.5rem; padding-inline: 1rem;">삭제하기</button>
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
          <button type="button" class="btn btn--submit" id="btnModalWarningOk" style="min-height: 2.5rem; padding-inline: 2rem;">확인</button>
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

