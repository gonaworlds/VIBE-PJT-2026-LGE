/**
 * 공통 헤더 로그인 상태 표시 (layout/site-layout.js 에서 initAuthHeader 호출)
 *
 * 마크업 규칙 (data-auth 속성)
 * - [data-auth="login"]   : 로그아웃 상태 → "로그인" (로그인 화면으로 이동)
 *                           로그인 상태   → "로그아웃" 버튼으로 변경
 * - [data-auth="signup"]  : 로그아웃 상태에서만 표시 (로그인 화면 하단 회원가입으로 이동)
 * - [data-auth="welcome"] : 로그인 상태에서만 표시 ("OOO님 환영합니다")
 */

import { authService } from './services/authService.js';

const LOGIN_PAGE = './login.html';

/** 로그인 후 돌아올 현재 페이지 (파일명 + 해시) */
function currentPagePath() {
  const file = window.location.pathname.split('/').pop() || 'index.html';
  return `${file}${window.location.hash || ''}`;
}

export function buildLoginUrl({ signup = false } = {}) {
  const redirect = encodeURIComponent(currentPagePath());
  return `${LOGIN_PAGE}?redirect=${redirect}${signup ? '#signup' : ''}`;
}

function render(user) {
  document.querySelectorAll('[data-auth="login"]').forEach((el) => {
    if (!el.dataset.loginLabel) el.dataset.loginLabel = el.textContent.trim();
    if (user) {
      el.textContent = '로그아웃';
      el.setAttribute('href', '#logout');
      el.setAttribute('role', 'button');
      el.classList.add('is-logout');
    } else {
      el.textContent = el.dataset.loginLabel;
      el.setAttribute('href', buildLoginUrl());
      el.removeAttribute('role');
      el.classList.remove('is-logout');
    }
    // 로그인 화면 자체의 헤더처럼 "로그아웃" 용도로만 쓰는 버튼
    el.hidden = !user && el.hasAttribute('data-auth-logout-only');
  });

  document.querySelectorAll('[data-auth="signup"]').forEach((el) => {
    el.hidden = Boolean(user);
    el.setAttribute('href', buildLoginUrl({ signup: true }));
  });

  document.querySelectorAll('[data-auth="welcome"]').forEach((el) => {
    el.hidden = !user;
    el.textContent = '';
    if (user) {
      const strong = document.createElement('strong');
      strong.textContent = user.name;
      const text = document.createElement('span');
      text.className = 'auth-welcome__text';
      text.textContent = '님 환영합니다';
      el.append(strong, text);
      if (user.role === 'admin') {
        const badge = document.createElement('span');
        badge.className = 'auth-welcome__badge';
        badge.textContent = '관리자';
        el.append(badge);
      }
    }
  });
}

let initialized = false;

/**
 * 헤더 로그인 상태 표시 시작 (layout/site-layout.js 가 헤더 렌더링 직후 호출)
 * 여러 번 호출해도 한 번만 동작합니다.
 */
export function initAuthHeader() {
  if (initialized) {
    render(authService.getCurrentUser());
    return;
  }
  initialized = true;
  render(authService.getCurrentUser());

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-auth="login"]');
    if (!el || !authService.isLoggedIn()) return;
    e.preventDefault();
    authService.signOut();
  });

  // 해시 이동 시 redirect 경로 갱신 (공지 상세 등에서 로그인 후 같은 화면으로 복귀)
  window.addEventListener('hashchange', () => render(authService.getCurrentUser()));
  authService.onChange(render);
  authService.verifySession();
}
