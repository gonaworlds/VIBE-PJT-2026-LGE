/**
 * 공통 상단 헤더 — 마크업 생성 + 헤더 고유 동작
 * 표시 내용은 layout-data.js, 페이지 삽입은 site-layout.js 에서 관리합니다.
 */

import { ENGLISHTEST_MENU, HEADER_CTAS, LINKS, LOGO } from './layout-data.js';
import { escapeHtml } from './template-utils.js';

/* --------------------------------------------------------------------------
   variant: landing (index 히어로 위 고정 내비게이션)
   compact 전환 동작은 main.js 의 initCompactHeaderNav 가 담당
   -------------------------------------------------------------------------- */
function renderLandingHeader() {
  return `
    <div class="inner-box" data-js-primary-nav>
      <div class="part part--between">
        <span class="site-header__brand">
          <img src="${LOGO.main.src}" alt="Duolingo">
        </span>
        <div class="site-header__controls">
          <details class="site-language">
            <summary class="site-language__summary" tabindex="0">
              사이트 언어: 한국어
              <span class="site-language__chevron" aria-hidden="true"></span>
            </summary>
            <p class="site-language__panel">현재 사이트 언어는 한국어예요.</p>
          </details>
          <a class="btn site-header__compact-cta" href="${LINKS.register}" aria-hidden="true" inert tabindex="-1">
            시작하기
          </a>
        </div>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   variant: service (공지사항 · 로그인 등)
   로그인 상태 표시는 auth-header.js 가 [data-auth] 요소를 갱신
   -------------------------------------------------------------------------- */
function renderServiceHeader({ loginLogoutOnly = false, cta = 'register' } = {}) {
  const ctaConf = HEADER_CTAS[cta] || HEADER_CTAS.register;
  const ctaTarget = ctaConf.external ? ' target="_blank" rel="noopener noreferrer"' : '';

  return `
    <header class="notice-header">
      <div class="notice-header__inner">
        <a href="${LINKS.home}" class="notice-header__brand" aria-label="듀오링고 홈으로 이동">
          <img src="${LOGO.main.src}" alt="${LOGO.main.alt}">
        </a>
        <div class="auth-header-actions">
          <span class="auth-welcome" data-auth="welcome" hidden></span>
          <a class="btn btn--outline btn--sm auth-header-btn" data-auth="login"${loginLogoutOnly ? ' data-auth-logout-only hidden' : ''} href="${LINKS.login}">로그인</a>
          <a class="btn btn--sm notice-header__cta auth-header-btn" href="${ctaConf.href}"${ctaTarget}>${escapeHtml(ctaConf.label)}</a>
        </div>
      </div>
    </header>
  `;
}

/* --------------------------------------------------------------------------
   variant: englishtest (드롭다운 메뉴 + 모바일 드로어)
   -------------------------------------------------------------------------- */
function renderEnglishtestHeader() {
  const dropdowns = ENGLISHTEST_MENU.map(
    (menu) => `
      <li class="nav__item">
        <button type="button" class="nav__link" aria-haspopup="true" aria-expanded="false">
          <span>${escapeHtml(menu.title)}</span>
          <img src="./assets/images/englishtest/ico_arrow.svg" alt="" class="nav__arrow-icon" aria-hidden="true">
        </button>
        <ul class="nav__dropdown" aria-label="${escapeHtml(menu.title)} 하위 메뉴">
          ${menu.items.map((item) => `<li><a href="#" class="nav__dropdown-item">${escapeHtml(item)}</a></li>`).join('')}
        </ul>
      </li>
    `,
  ).join('');

  const drawerSections = ENGLISHTEST_MENU.map(
    (menu) => `
      <div class="mobile-drawer__section">
        <h3 class="mobile-drawer__category">${escapeHtml(menu.title)}</h3>
        <ul class="mobile-drawer__list">
          ${menu.items.map((item) => `<li><a href="#" class="mobile-drawer__link">${escapeHtml(item)}</a></li>`).join('')}
        </ul>
      </div>
    `,
  ).join('');

  return `
    <header class="englishtest-header">
      <nav class="nav" aria-label="메인 내비게이션">
        <button type="button" class="nav__toggle" aria-label="모바일 메뉴 열기" aria-expanded="false" aria-controls="mobileDrawer">
          <span class="nav__toggle-bar"></span>
          <span class="nav__toggle-bar"></span>
          <span class="nav__toggle-bar"></span>
        </button>

        <a href="${LINKS.englishtest}" class="nav__brand" aria-label="Duolingo English Test 홈으로 이동">
          <img src="${LOGO.englishtest.src}" alt="${LOGO.englishtest.alt}" class="nav__logo-svg">
        </a>

        <ul class="nav__menu">${dropdowns}</ul>

        <div class="nav__actions">
          <span class="auth-welcome" data-auth="welcome" hidden></span>
          <a href="${LINKS.login}" class="btn btn--outline btn--text-accent btn--sm" data-auth="login">로그인하기</a>
          <a href="${LINKS.signup}" class="btn btn--sm" data-auth="signup">회원가입</a>
        </div>
      </nav>

      <div id="mobileDrawer" class="mobile-drawer" aria-hidden="true">
        <div class="mobile-drawer__inner">
          <p class="auth-welcome mobile-drawer__welcome" data-auth="welcome" hidden></p>
          <div class="mobile-drawer__actions">
            <a href="${LINKS.login}" class="btn btn--outline btn--text-accent btn--sm mobile-drawer__btn" data-auth="login">로그인하기</a>
            <a href="${LINKS.signup}" class="btn btn--sm mobile-drawer__btn" data-auth="signup">회원가입</a>
          </div>
          <div class="mobile-drawer__menu">${drawerSections}</div>
        </div>
      </div>
    </header>
  `;
}

/** 햄버거 메뉴 드로어: 열기/닫기, ESC, 데스크톱 전환 시 닫기, 링크 클릭 시 닫기 */
function initEnglishtestDrawer(root) {
  const toggleBtn = root.querySelector('.nav__toggle');
  const drawer = root.querySelector('#mobileDrawer');
  if (!toggleBtn || !drawer) return;

  const setOpen = (open) => {
    toggleBtn.classList.toggle('is-active', open);
    toggleBtn.setAttribute('aria-expanded', String(open));
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('drawer-locked', open);
  };
  const isOpen = () => drawer.classList.contains('is-open');

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!isOpen());
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && isOpen()) setOpen(false);
  });
  drawer.querySelectorAll('.mobile-drawer__link, .mobile-drawer__btn').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
}

/* --------------------------------------------------------------------------
   공개 API
   -------------------------------------------------------------------------- */
const HEADER_VARIANTS = {
  landing: { render: renderLandingHeader },
  service: { render: renderServiceHeader },
  englishtest: { render: renderEnglishtestHeader, init: initEnglishtestDrawer },
};

const pickVariant = (variant) => HEADER_VARIANTS[variant] || HEADER_VARIANTS.service;

export function renderHeader(variant, options) {
  return pickVariant(variant).render(options);
}

export function initHeader(variant, rootEl) {
  pickVariant(variant).init?.(rootEl);
}
