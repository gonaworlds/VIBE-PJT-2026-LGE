/**
 * 공통 레이아웃 진입점 — 모든 페이지가 이 모듈 하나로 헤더/푸터를 삽입합니다.
 *
 * 페이지 HTML 에는 자리표시자만 둡니다.
 *   <div data-site-header></div>   → PAGE_LAYOUTS[페이지].header 로 교체
 *   <div data-site-footer></div>   → PAGE_LAYOUTS[페이지].footer 로 교체
 *
 * 사용법: <head> 에서 다른 모듈보다 먼저
 *   <script type="module" src="./assets/js/layout/site-layout.js"></script>
 * 헤더/푸터 DOM 을 사용하는 페이지 모듈은 이 파일을 import 하면 렌더링 이후 실행이 보장됩니다.
 */

import { DEFAULT_LAYOUT, PAGE_LAYOUTS } from './layout-data.js';
import { initHeader, renderHeader } from './site-header.js';
import { initFooter, renderFooter } from './site-footer.js';
import { initAuthHeader } from '../auth-header.js';

function currentPageFile() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

/** 자리표시자를 템플릿 결과로 교체하고, 삽입된 첫 요소를 반환 */
function mount(placeholder, html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const root = template.content.firstElementChild;
  placeholder.replaceWith(template.content);
  return root;
}

function renderLayout() {
  const layout = { ...DEFAULT_LAYOUT, ...PAGE_LAYOUTS[currentPageFile()] };

  const headerSlot = document.querySelector('[data-site-header]');
  if (headerSlot) {
    const headerEl = mount(headerSlot, renderHeader(layout.header, layout.headerOptions));
    initHeader(layout.header, headerEl);
  }

  const footerSlot = document.querySelector('[data-site-footer]');
  if (footerSlot) {
    const footerEl = mount(footerSlot, renderFooter(layout.footer));
    initFooter(layout.footer, footerEl);
  }

  // 헤더의 [data-auth] 요소에 로그인 상태 반영
  initAuthHeader();
}

renderLayout();
