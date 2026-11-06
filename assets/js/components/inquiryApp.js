/**
 * Inquiry (1:1 문의하기 / Q&A) Application Controller
 * UI 컴포넌트: 오직 inquiryService와 authService를 통해서만 데이터에 접근하고 권한을 처리합니다.
 */

import { inquiryService } from '../services/inquiryService.js';
import { authService } from '../services/authService.js';
import { INQUIRY_CATEGORIES, INQUIRY_STATUS } from '../types/inquiry.js';

const ITEMS_PER_PAGE = 7;

export class InquiryApp {
  constructor(containerEl) {
    this.container = containerEl;
    this.inquiries = [];
    this.filteredInquiries = [];
    this.totalCount = 0;
    this.loading = true;

    // 필터 및 페이지네이션
    this.categoryFilter = 'all';
    this.statusFilter = 'all';
    this.searchQuery = '';
    this.currentPage = 1;

    // 뷰 상태 ('list', 'detail', 'write', 'edit')
    this.currentView = 'list';
    this.currentInquiryId = null;

    // 답변 수정 모드 상태
    this.isEditingAnswer = false;

    this.init();
  }

  async init() {
    this.setupHashRouting();

    // 로그인 상태 변경 시 권한에 맞게 현재 화면 다시 렌더링
    authService.onChange(() => {
      if (!this.loading) this.handleRoute({ fromAuthChange: true });
    });
    authService.verifySession();

    await this.loadInquiries();
    this.handleRoute();
  }

  setupHashRouting() {
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });
  }

  handleRoute({ fromAuthChange = false } = {}) {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const [route, id] = hash.split('/');

    // 1. 글쓰기 접근 제한: 로그인 필수
    if (route === 'write' && !authService.isLoggedIn()) {
      this.showToast('로그인한 회원만 문의글을 작성할 수 있습니다.');
      this.navigate('list');
      return;
    }

    if (route === 'write') {
      this.currentView = 'write';
      this.currentInquiryId = null;
      this.renderWrite();
    } else if (route === 'edit' && id) {
      this.currentView = 'edit';
      this.currentInquiryId = id;
      this.renderEdit(id);
    } else if (route === 'detail' && id) {
      this.currentView = 'detail';
      this.currentInquiryId = id;
      this.renderDetail(id, { countView: !fromAuthChange });
    } else {
      this.currentView = 'list';
      this.currentInquiryId = null;
      this.renderList();
    }

    this.updateHeroSubtitle();
    if (!fromAuthChange) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigate(hash) {
    window.location.hash = hash;
  }

  updateHeroSubtitle() {
    const subEl = document.getElementById('inquiryHeroSubtitle');
    if (!subEl) return;

    if (this.currentView === 'write') {
      subEl.textContent = '듀오링고 이용에 관한 질문을 남겨주시면 정성껏 답변해 드립니다.';
    } else if (this.currentView === 'edit') {
      subEl.textContent = '작성하신 문의글의 내용을 수정하세요.';
    } else {
      subEl.textContent = '궁금한 점을 문의하시면 친절하고 신속하게 답변해 드립니다.';
    }
  }

  async loadInquiries() {
    try {
      this.loading = true;
      this.inquiries = await inquiryService.getAll();
      this.applyFilters();
    } catch (err) {
      console.error('[InquiryApp] Failed to load inquiries:', err);
      this.showToast('문의글 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    let result = [...this.inquiries];

    // 질문유형 필터
    if (this.categoryFilter !== 'all') {
      result = result.filter((item) => item.category === this.categoryFilter);
    }

    // 답변 상태 필터
    if (this.statusFilter !== 'all') {
      result = result.filter((item) => item.status === this.statusFilter);
    }

    // 검색어 필터 (제목 또는 내용)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.content && item.content.toLowerCase().includes(q))
      );
    }

    // 최신 작성일순 정렬
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.filteredInquiries = result;
    this.totalCount = result.length;
  }

  // ==========================================================================
  // 1. 목록 화면 (List View)
  // ==========================================================================
  renderList() {
    const totalPages = Math.max(1, Math.ceil(this.filteredInquiries.length / ITEMS_PER_PAGE));
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIdx = (this.currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = this.filteredInquiries.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const currentUser = authService.getCurrentUser();

    const html = `
      <div class="notice-top-bar">
        <div class="notice-count" id="inquiryCountText">
          전체 <strong>${this.totalCount}</strong>건
        </div>
        <div class="notice-top-bar__actions">
          <!-- 1. 질문유형 필터 드롭다운 -->
          <select class="notice-select" id="inquiryCategorySelect" aria-label="질문유형 필터">
            <option value="all" ${this.categoryFilter === 'all' ? 'selected' : ''}>전체 유형</option>
            <option value="delivery" ${this.categoryFilter === 'delivery' ? 'selected' : ''}>배송문의</option>
            <option value="account" ${this.categoryFilter === 'account' ? 'selected' : ''}>계정문의</option>
            <option value="refund" ${this.categoryFilter === 'refund' ? 'selected' : ''}>교환/환불</option>
            <option value="error" ${this.categoryFilter === 'error' ? 'selected' : ''}>시스템오류</option>
            <option value="etc" ${this.categoryFilter === 'etc' ? 'selected' : ''}>기타</option>
          </select>

          <!-- 2. 답변상태 필터 드롭다운 -->
          <select class="notice-select" id="inquiryStatusSelect" aria-label="답변상태 필터">
            <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>전체 상태</option>
            <option value="waiting" ${this.statusFilter === 'waiting' ? 'selected' : ''}>답변대기</option>
            <option value="answered" ${this.statusFilter === 'answered' ? 'selected' : ''}>답변완료</option>
          </select>

          <!-- 3. 검색어 입력창 -->
          <div class="notice-search">
            <svg class="notice-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              class="notice-search__input"
              id="inquirySearchInput"
              placeholder="문의글 검색"
              value="${this.escapeHtml(this.searchQuery)}"
              aria-label="문의글 검색"
            >
          </div>

          <!-- 4. 글쓰기 버튼 -->
          <button type="button" class="btn btn--sm notice-write-btn" id="btnInquiryWrite">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            문의하기
          </button>
        </div>
      </div>

      <!-- 문의글 테이블 목록 -->
      <div class="notice-table-container">
        <table class="notice-table" aria-label="1:1 문의하기 목록">
          <thead>
            <tr>
              <th scope="col" style="width: 100px; text-align: center;">상태</th>
              <th scope="col" style="width: 110px; text-align: center;">유형</th>
              <th scope="col" class="notice-col-title">제목</th>
              <th scope="col" style="width: 100px; text-align: center;">작성자</th>
              <th scope="col" class="notice-col-date">등록일</th>
              <th scope="col" class="notice-col-views">조회</th>
            </tr>
          </thead>
          <tbody>
            ${
              pageItems.length === 0
                ? `<tr><td colspan="6" style="padding: 3.5rem 1rem; color: #888888; text-align: center;">등록된 문의글이 없거나 검색 결과가 없습니다.</td></tr>`
                : pageItems.map((item) => this.renderTableRow(item, currentUser)).join('')
            }
          </tbody>
        </table>
      </div>

      ${this.renderPaginationHtml(totalPages)}
    `;

    this.container.innerHTML = html;
    this.attachListEvents();
  }

  renderTableRow(item, currentUser) {
    const isAnswered = item.status === 'answered';
    const statusConf = isAnswered ? INQUIRY_STATUS.answered : INQUIRY_STATUS.waiting;
    const catConf = INQUIRY_CATEGORIES[item.category] || INQUIRY_CATEGORIES.etc;
    const dateFormatted = this.formatDate(item.createdAt);
    const viewsFormatted = (item.views || 0).toLocaleString();

    // 비밀글 권한 판단: 작성자 본인이거나 관리자만 내용 확인 가능
    const canView = inquiryService.canViewDetail(item, currentUser);
    const isSecret = Boolean(item.isSecret);

    // 작성자명 마스킹 (예: 김*습)
    const authorMasked = this.maskName(item.author?.name || '익명');

    // 제목 표시: 비밀글일 경우 자물쇠 아이콘 + 비공개 뱃지
    let titleHtml = '';
    if (isSecret) {
      if (canView) {
        titleHtml = `
          <a href="#detail/${item.id}" class="notice-title-link" title="${this.escapeHtml(item.title)}">
            <span class="inquiry-lock-icon" title="비공개 글">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </span>
            ${this.escapeHtml(item.title)}
            <span class="inquiry-lock-badge">비공개</span>
          </a>
        `;
      } else {
        // 열람 불가한 타인/비로그인 유저인 경우 클릭 시 알림 안내
        titleHtml = `
          <a href="javascript:void(0)" class="notice-title-link inquiry-secret-link" data-inquiry-id="${item.id}" title="비밀글입니다.">
            <span class="inquiry-lock-icon" title="비공개 글">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </span>
            <span style="color: #888888;">비밀글입니다.</span>
            <span class="inquiry-lock-badge">비공개</span>
          </a>
        `;
      }
    } else {
      titleHtml = `
        <a href="#detail/${item.id}" class="notice-title-link" title="${this.escapeHtml(item.title)}">
          ${this.escapeHtml(item.title)}
        </a>
      `;
    }

    return `
      <tr data-inquiry-id="${item.id}">
        <!-- 첫 열: 답변 상태 (답변완료 / 답변대기) -->
        <td style="text-align: center;">
          <span class="badge ${statusConf.badgeClass}">${statusConf.label}</span>
        </td>
        <!-- 질문유형 -->
        <td style="text-align: center;">
          <span class="badge ${catConf.badgeClass}">${catConf.label}</span>
        </td>
        <!-- 제목 -->
        <td class="notice-col-title">
          ${titleHtml}
        </td>
        <!-- 작성자 -->
        <td style="text-align: center; color: #64748b; font-size: 0.9rem;">
          ${canView ? this.escapeHtml(item.author?.name || '익명') : authorMasked}
        </td>
        <!-- 등록일 -->
        <td class="notice-col-date">${dateFormatted}</td>
        <!-- 조회수 -->
        <td class="notice-col-views">${viewsFormatted}</td>
      </tr>
    `;
  }

  renderPaginationHtml(totalPages) {
    if (totalPages <= 1) return '';

    const current = this.currentPage;
    const pages = [];

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
          id="btnInquiryPrevPage"
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
                aria-label="${p} 페이지"
                ${p === current ? 'aria-current="page"' : ''}
              >${p}</button>
            `;
          })
          .join('')}

        <button
          type="button"
          class="notice-page-btn"
          id="btnInquiryNextPage"
          ${current === totalPages ? 'disabled' : ''}
          aria-label="다음 페이지"
        >›</button>
      </nav>
    `;
  }

  attachListEvents() {
    // 1. 질문유형 필터 변경
    const catSelect = document.getElementById('inquiryCategorySelect');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.categoryFilter = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
        this.renderList();
      });
    }

    // 2. 답변상태 필터 변경
    const statusSelect = document.getElementById('inquiryStatusSelect');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
        this.renderList();
      });
    }

    // 3. 검색어 입력 (디바운스)
    const searchInput = document.getElementById('inquirySearchInput');
    if (searchInput) {
      let timer = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.searchQuery = e.target.value;
          this.currentPage = 1;
          this.applyFilters();
          this.renderList();
        }, 250);
      });
    }

    // 4. 문의하기 버튼 (로그인 검사)
    const btnWrite = document.getElementById('btnInquiryWrite');
    if (btnWrite) {
      btnWrite.addEventListener('click', () => {
        if (!authService.isLoggedIn()) {
          this.showToast('로그인한 회원만 문의글을 작성할 수 있습니다.');
          setTimeout(() => {
            window.location.href = './login.html';
          }, 1000);
          return;
        }
        this.navigate('write');
      });
    }

    // 5. 비공개 글 클릭 시 권한 없음 알림
    this.container.querySelectorAll('.inquiry-secret-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.showToast('🔒 비공개 글입니다. 작성자와 관리자만 확인할 수 있습니다.');
      });
    });

    // 6. 페이지네이션 클릭
    const btnPrev = document.getElementById('btnInquiryPrevPage');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderList();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    const btnNext = document.getElementById('btnInquiryNextPage');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil(this.filteredInquiries.length / ITEMS_PER_PAGE));
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderList();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    this.container.querySelectorAll('.notice-page-btn[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = Number(btn.getAttribute('data-page'));
        if (p && p !== this.currentPage) {
          this.currentPage = p;
          this.renderList();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  // ==========================================================================
  // 2. 상세 화면 (Detail View: 질문 + 답변)
  // ==========================================================================
  async renderDetail(id, { countView = true } = {}) {
    this.container.innerHTML = `
      <div class="notice-loading">
        <div class="notice-spinner"></div>
        <p>문의글을 불러오는 중입니다...</p>
      </div>
    `;

    let item = this.inquiries.find((p) => p.id === id);
    if (!item) {
      try {
        item = await inquiryService.getById(id);
      } catch (e) {
        console.error(e);
      }
    }

    if (!item) {
      this.container.innerHTML = `
        <div class="notice-detail">
          <p style="text-align: center; padding: 3rem; color: #888;">존재하지 않거나 삭제된 문의글입니다.</p>
          <div style="text-align: center; margin-top: 1rem;">
            <a href="#list" class="btn btn--secondary">목록으로 돌아가기</a>
          </div>
        </div>
      `;
      return;
    }

    const currentUser = authService.getCurrentUser();

    // ★ 비공개 글 검사: 작성자 본인 및 관리자만 조회 가능!
    if (!inquiryService.canViewDetail(item, currentUser)) {
      this.container.innerHTML = `
        <div class="notice-detail">
          <div class="inquiry-locked-card">
            <div class="inquiry-locked-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
            <h3 class="inquiry-locked-title">비공개 문의글입니다</h3>
            <p class="inquiry-locked-desc">
              이 글은 작성자 및 관리자만 확인할 수 있는 비밀글입니다.<br>
              본인이 작성한 글이라면 로그인 후 확인해 주시기 바랍니다.
            </p>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <a href="#list" class="btn btn--secondary">목록으로 돌아가기</a>
              ${
                !currentUser
                  ? `<a href="./login.html" class="btn btn--primary">로그인하기</a>`
                  : ''
              }
            </div>
          </div>
        </div>
      `;
      return;
    }

    // 조회수 증가
    if (countView) {
      item.views = (item.views || 0) + 1;
      inquiryService.incrementViews(item.id);
    }

    const catConf = INQUIRY_CATEGORIES[item.category] || INQUIRY_CATEGORIES.etc;
    const isAnswered = item.status === 'answered';
    const statusConf = isAnswered ? INQUIRY_STATUS.answered : INQUIRY_STATUS.waiting;
    const dateFormatted = this.formatDate(item.createdAt, { withTime: true });
    const viewsFormatted = (item.views || 0).toLocaleString();

    const canEdit = inquiryService.canEdit(item, currentUser);
    const canDelete = inquiryService.canDelete(item, currentUser);
    const isAdmin = inquiryService.canAnswer(currentUser);

    const html = `
      <article class="notice-detail" aria-labelledby="inquiryDetailTitle">
        <!-- 1. 질문글 헤더 -->
        <header class="notice-detail__header">
          <div class="notice-detail__meta-top">
            <span class="badge ${statusConf.badgeClass}">${statusConf.label}</span>
            <span class="badge ${catConf.badgeClass}">${catConf.label}</span>
            ${item.isSecret ? `<span class="inquiry-lock-badge">🔒 비공개글</span>` : ''}
          </div>
          <h2 class="notice-detail__title" id="inquiryDetailTitle">
            ${this.escapeHtml(item.title)}
          </h2>
          <div class="notice-detail__meta-bottom">
            <div class="notice-detail__author-wrap">
              <span class="notice-detail__author">${this.escapeHtml(item.author?.name || '익명')}</span>
              <span class="notice-detail__divider">·</span>
              <time class="notice-detail__date" datetime="${item.createdAt}">${dateFormatted}</time>
            </div>
            <div class="notice-detail__views">
              조회수 <span>${viewsFormatted}</span>
            </div>
          </div>
        </header>

        <!-- 2. 질문글 본문 -->
        <div class="notice-detail__content">
          ${item.content}
        </div>

        <!-- 3. 질문글 버튼 액션 바 -->
        <div class="notice-detail__actions">
          <div class="notice-detail__actions-left">
            <a href="#list" class="btn btn--secondary notice-detail__back-btn">
              목록으로
            </a>
          </div>
          <div class="notice-detail__actions-right">
            ${
              canEdit
                ? `<a href="#edit/${item.id}" class="btn btn--secondary btn--sm">수정</a>`
                : ''
            }
            ${
              canDelete
                ? `<button type="button" class="btn btn--danger btn--sm" id="btnDeleteInquiry">삭제</button>`
                : ''
            }
          </div>
        </div>

        <!-- 4. 관리자 답변 영역 (질문글 바로 아래) -->
        <section class="inquiry-answer-wrapper" aria-label="관리자 답변 영역">
          ${this.renderAnswerSectionHtml(item, isAdmin)}
        </section>
      </article>
    `;

    this.container.innerHTML = html;
    this.attachDetailEvents(item);
  }

  renderAnswerSectionHtml(item, isAdmin) {
    const answer = item.answer;

    // A. 이미 답변이 등록된 경우
    if (answer) {
      if (this.isEditingAnswer && isAdmin) {
        // 답변 수정 폼 렌더링
        return `
          <div class="inquiry-answer-form-card">
            <h3 class="inquiry-answer-form-title">
              <img src="./assets/images/nav_logo.svg" alt="" style="width: 24px; height: 24px;">
              관리자 답변 수정하기
            </h3>
            <textarea class="inquiry-answer-textarea" id="answerTextarea" placeholder="답변 내용을 작성해 주세요...">${this.escapeHtml(answer.content.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, ''))}</textarea>
            <div class="inquiry-answer-form-btns">
              <button type="button" class="btn btn--secondary btn--sm" id="btnCancelEditAnswer">취소</button>
              <button type="button" class="btn btn--primary btn--sm" id="btnSaveAnswer">답변 수정 완료</button>
            </div>
          </div>
        `;
      }

      const answeredDateFormatted = this.formatDate(answer.answeredAt, { withTime: true });

      return `
        <div class="inquiry-answer-card">
          <div class="inquiry-answer-header">
            <div class="inquiry-answer-profile">
              <div class="inquiry-answer-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <div class="inquiry-answer-name-wrap">
                <div class="inquiry-answer-name">
                  <span>${this.escapeHtml(answer.adminName || '듀오 고객센터')}</span>
                  <span class="inquiry-answer-badge-tag">공식 답변</span>
                </div>
                <time class="inquiry-answer-date" datetime="${answer.answeredAt}">${answeredDateFormatted}</time>
              </div>
            </div>

            ${
              isAdmin
                ? `<div class="inquiry-answer-actions">
                    <button type="button" class="btn btn--secondary btn--sm" id="btnEditAnswer">답변 수정</button>
                    <button type="button" class="btn btn--outline btn--sm" id="btnDeleteAnswer" style="color: #ef4444; border-color: #fca5a5;">답변 삭제</button>
                  </div>`
                : ''
            }
          </div>

          <div class="inquiry-answer-content">
            ${answer.content}
          </div>
        </div>
      `;
    }

    // B. 아직 답변이 없는 경우
    if (isAdmin) {
      // 관리자인 경우 답변 작성 폼 바로 노출
      return `
        <div class="inquiry-answer-form-card">
          <h3 class="inquiry-answer-form-title">
            <img src="./assets/images/nav_logo.svg" alt="" style="width: 24px; height: 24px;">
            관리자 답변 작성하기
          </h3>
          <textarea class="inquiry-answer-textarea" id="answerTextarea" placeholder="고객님의 질문에 대해 친절하고 정확한 답변을 작성해 주세요..."></textarea>
          <div class="inquiry-answer-form-btns">
            <button type="button" class="btn btn--primary" id="btnSaveAnswer">답변 등록하기</button>
          </div>
        </div>
      `;
    }

    // 일반 회원 / 비로그인인 경우 답변 대기 안내 노출
    return `
      <div class="inquiry-waiting-card">
        <div class="inquiry-waiting-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
          </svg>
        </div>
        <div class="inquiry-waiting-text">
          <h4>답변 준비 중입니다</h4>
          <p>고객센터 담당자가 문의 내용을 확인하고 있습니다. 영업일 기준 1~2일 이내에 성심성의껏 답변해 드리겠습니다.</p>
        </div>
      </div>
    `;
  }

  attachDetailEvents(item) {
    // 1. 문의글 삭제 버튼 (작성자 또는 관리자)
    const btnDelete = document.getElementById('btnDeleteInquiry');
    if (btnDelete) {
      btnDelete.addEventListener('click', async () => {
        if (!confirm('정말로 이 문의글을 삭제하시겠습니까? 삭제된 글은 복구할 수 없습니다.')) return;
        try {
          await inquiryService.delete(item.id);
          this.showToast('문의글이 삭제되었습니다.');
          await this.loadInquiries();
          this.navigate('list');
        } catch (err) {
          console.error(err);
          this.showToast(err.message || '삭제 중 오류가 발생했습니다.');
        }
      });
    }

    // 2. 답변 등록 / 수정 버튼
    const btnSaveAnswer = document.getElementById('btnSaveAnswer');
    if (btnSaveAnswer) {
      btnSaveAnswer.addEventListener('click', async () => {
        const textarea = document.getElementById('answerTextarea');
        const content = textarea ? textarea.value.trim() : '';

        if (!content) {
          this.showToast('답변 내용을 입력해 주세요.');
          if (textarea) textarea.focus();
          return;
        }

        try {
          btnSaveAnswer.disabled = true;
          // 줄바꿈 태그 변환
          const formattedContent = content
            .split('\n')
            .map((line) => `<p>${this.escapeHtml(line) || '&nbsp;'}</p>`)
            .join('');

          await inquiryService.saveAnswer(item.id, {
            content: formattedContent,
          });

          this.showToast('답변이 성공적으로 등록되었습니다.');
          this.isEditingAnswer = false;
          await this.loadInquiries();
          this.renderDetail(item.id, { countView: false });
        } catch (err) {
          console.error(err);
          this.showToast(err.message || '답변 등록 중 오류가 발생했습니다.');
        } finally {
          btnSaveAnswer.disabled = false;
        }
      });
    }

    // 3. 답변 수정 시작
    const btnEditAnswer = document.getElementById('btnEditAnswer');
    if (btnEditAnswer) {
      btnEditAnswer.addEventListener('click', () => {
        this.isEditingAnswer = true;
        this.renderDetail(item.id, { countView: false });
      });
    }

    // 4. 답변 수정 취소
    const btnCancelEditAnswer = document.getElementById('btnCancelEditAnswer');
    if (btnCancelEditAnswer) {
      btnCancelEditAnswer.addEventListener('click', () => {
        this.isEditingAnswer = false;
        this.renderDetail(item.id, { countView: false });
      });
    }

    // 5. 답변 삭제
    const btnDeleteAnswer = document.getElementById('btnDeleteAnswer');
    if (btnDeleteAnswer) {
      btnDeleteAnswer.addEventListener('click', async () => {
        if (!confirm('등록된 관리자 답변을 삭제하시겠습니까? (삭제 시 상태가 답변대기로 변경됩니다)')) return;
        try {
          await inquiryService.deleteAnswer(item.id);
          this.showToast('답변이 삭제되었습니다.');
          await this.loadInquiries();
          this.renderDetail(item.id, { countView: false });
        } catch (err) {
          console.error(err);
          this.showToast(err.message || '답변 삭제 중 오류가 발생했습니다.');
        }
      });
    }
  }

  // ==========================================================================
  // 3. 작성 화면 (Write View)
  // ==========================================================================
  renderWrite() {
    const html = `
      <section class="notice-form" aria-labelledby="inquiryWriteTitle">
        <h2 class="notice-form__title" id="inquiryWriteTitle">1:1 문의글 작성</h2>

        <form id="inquiryWriteForm" novalidate>
          <!-- 질문유형 5종 선택 (배송문의, 계정문의, 교환/환불, 시스템오류, 기타) -->
          <div class="notice-form__group">
            <label class="notice-form__label">
              질문유형 <span class="notice-form__required" aria-hidden="true">*</span>
            </label>
            <div class="inquiry-category-grid" role="radiogroup" aria-label="질문유형 선택">
              ${Object.values(INQUIRY_CATEGORIES)
                .map(
                  (cat, idx) => `
                <label class="inquiry-category-card ${idx === 0 ? 'is-selected' : ''}">
                  <input type="radio" name="inquiryCategory" value="${cat.key}" ${idx === 0 ? 'checked' : ''}>
                  <span class="inquiry-category-card__label">${cat.label}</span>
                </label>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- 비밀글(비공개) 설정 토글 -->
          <div class="notice-form__group">
            <label class="inquiry-secret-toggle">
              <input type="checkbox" id="inquirySecretCheck">
              <span class="inquiry-secret-toggle__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                비밀글로 등록 (비공개)
              </span>
              <span class="inquiry-secret-toggle__desc">체크 시 작성자 본인과 관리자만 열람할 수 있습니다.</span>
            </label>
          </div>

          <!-- 제목 입력 -->
          <div class="notice-form__group">
            <label for="inquiryTitleInput" class="notice-form__label">
              문의 제목 <span class="notice-form__required" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="inquiryTitleInput"
              class="notice-form__input"
              placeholder="문의 내용을 요약하여 작성해 주세요 (예: 배송지 주소 변경 요청)"
              maxlength="100"
              required
            >
          </div>

          <!-- 내용 입력 -->
          <div class="notice-form__group">
            <label for="inquiryContentInput" class="notice-form__label">
              문의 내용 <span class="notice-form__required" aria-hidden="true">*</span>
            </label>
            <textarea
              id="inquiryContentInput"
              class="inquiry-answer-textarea"
              style="min-height: 240px;"
              placeholder="구체적인 문의 내용을 작성해 주시면 더욱 빠르고 정확한 처리가 가능합니다. (주문번호, 발생 시간, 사용 기기 등)"
              required
            ></textarea>
          </div>

          <!-- 버튼 영역 -->
          <div class="notice-form__actions">
            <a href="#list" class="btn btn--secondary">취소</a>
            <button type="submit" class="btn btn--primary" id="btnSubmitInquiry">
              문의 등록하기
            </button>
          </div>
        </form>
      </section>
    `;

    this.container.innerHTML = html;
    this.attachFormEvents({ mode: 'write' });
  }

  // ==========================================================================
  // 4. 수정 화면 (Edit View)
  // ==========================================================================
  async renderEdit(id) {
    let item = this.inquiries.find((p) => p.id === id);
    if (!item) {
      try {
        item = await inquiryService.getById(id);
      } catch (e) {
        console.error(e);
      }
    }

    if (!item) {
      this.showToast('수정할 문의글을 찾을 수 없습니다.');
      this.navigate('list');
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!inquiryService.canEdit(item, currentUser)) {
      this.showToast('본인이 작성한 문의글만 수정할 수 있습니다.');
      this.navigate(`detail/${id}`);
      return;
    }

    // 본문 내용 텍스트 추출
    const plainContent = item.content.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '');

    const html = `
      <section class="notice-form" aria-labelledby="inquiryEditTitle">
        <h2 class="notice-form__title" id="inquiryEditTitle">1:1 문의글 수정</h2>

        <form id="inquiryEditForm" novalidate>
          <!-- 질문유형 5종 선택 -->
          <div class="notice-form__group">
            <label class="notice-form__label">
              질문유형 <span class="notice-form__required" aria-hidden="true">*</span>
            </label>
            <div class="inquiry-category-grid" role="radiogroup" aria-label="질문유형 선택">
              ${Object.values(INQUIRY_CATEGORIES)
                .map(
                  (cat) => `
                <label class="inquiry-category-card ${item.category === cat.key ? 'is-selected' : ''}">
                  <input type="radio" name="inquiryCategory" value="${cat.key}" ${item.category === cat.key ? 'checked' : ''}>
                  <span class="inquiry-category-card__label">${cat.label}</span>
                </label>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- 비밀글(비공개) 설정 토글 -->
          <div class="notice-form__group">
            <label class="inquiry-secret-toggle">
              <input type="checkbox" id="inquirySecretCheck" ${item.isSecret ? 'checked' : ''}>
              <span class="inquiry-secret-toggle__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                비밀글로 등록 (비공개)
              </span>
              <span class="inquiry-secret-toggle__desc">체크 시 작성자 본인과 관리자만 열람할 수 있습니다.</span>
            </label>
          </div>

          <!-- 제목 입력 -->
          <div class="notice-form__group">
            <label for="inquiryTitleInput" class="notice-form__label">
              문의 제목 <span class="notice-form__required" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="inquiryTitleInput"
              class="notice-form__input"
              value="${this.escapeHtml(item.title)}"
              maxlength="100"
              required
            >
          </div>

          <!-- 내용 입력 -->
          <div class="notice-form__group">
            <label for="inquiryContentInput" class="notice-form__label">
              문의 내용 <span class="notice-form__required" aria-hidden="true">*</span>
            </label>
            <textarea
              id="inquiryContentInput"
              class="inquiry-answer-textarea"
              style="min-height: 240px;"
              required
            >${this.escapeHtml(plainContent)}</textarea>
          </div>

          <!-- 버튼 영역 -->
          <div class="notice-form__actions">
            <a href="#detail/${item.id}" class="btn btn--secondary">취소</a>
            <button type="submit" class="btn btn--primary" id="btnSubmitInquiry">
              문의 수정 완료
            </button>
          </div>
        </form>
      </section>
    `;

    this.container.innerHTML = html;
    this.attachFormEvents({ mode: 'edit', itemId: item.id });
  }

  attachFormEvents({ mode = 'write', itemId = null } = {}) {
    // 1. 질문유형 라디오 카드 선택 스타일 동기화
    this.container.querySelectorAll('.inquiry-category-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.container.querySelectorAll('.inquiry-category-card').forEach((c) => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // 2. 폼 제출 처리
    const form = this.container.querySelector('form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedRadio = form.querySelector('input[name="inquiryCategory"]:checked');
        const category = selectedRadio ? selectedRadio.value : 'etc';

        const secretCheck = document.getElementById('inquirySecretCheck');
        const isSecret = Boolean(secretCheck && secretCheck.checked);

        const titleInput = document.getElementById('inquiryTitleInput');
        const title = titleInput ? titleInput.value.trim() : '';

        const contentInput = document.getElementById('inquiryContentInput');
        const rawContent = contentInput ? contentInput.value.trim() : '';

        if (!title) {
          this.showToast('문의 제목을 입력해 주세요.');
          if (titleInput) titleInput.focus();
          return;
        }

        if (!rawContent) {
          this.showToast('문의 내용을 입력해 주세요.');
          if (contentInput) contentInput.focus();
          return;
        }

        const formattedContent = rawContent
          .split('\n')
          .map((line) => `<p>${this.escapeHtml(line) || '&nbsp;'}</p>`)
          .join('');

        const submitBtn = document.getElementById('btnSubmitInquiry');
        if (submitBtn) submitBtn.disabled = true;

        try {
          if (mode === 'write') {
            const created = await inquiryService.create({
              category,
              isSecret,
              title,
              content: formattedContent,
            });
            this.showToast('문의글이 등록되었습니다.');
            await this.loadInquiries();
            this.navigate(`detail/${created.id}`);
          } else if (mode === 'edit' && itemId) {
            await inquiryService.update(itemId, {
              category,
              isSecret,
              title,
              content: formattedContent,
            });
            this.showToast('문의글이 수정되었습니다.');
            await this.loadInquiries();
            this.navigate(`detail/${itemId}`);
          }
        } catch (err) {
          console.error(err);
          this.showToast(err.message || '저장 중 오류가 발생했습니다.');
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }
  }

  // ==========================================================================
  // 유틸리티
  // ==========================================================================
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  formatDate(isoString, { withTime = false } = {}) {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      if (!withTime) {
        return `${year}.${month}.${date}`;
      }
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}.${month}.${date} ${hours}:${minutes}`;
    } catch (_) {
      return isoString;
    }
  }

  maskName(name) {
    if (!name) return '익명';
    if (name.length <= 1) return name;
    if (name.length === 2) return name[0] + '*';
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  }

  showToast(message) {
    let toast = document.getElementById('inquiryToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'inquiryToast';
      toast.className = 'notice-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('is-show');
    }, 3000);
  }
}

