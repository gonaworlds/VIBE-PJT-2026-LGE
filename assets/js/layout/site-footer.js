/**
 * 공통 하단 푸터 — 마크업 생성 + 반응형 열 배치
 * 표시 내용은 layout-data.js, 페이지 삽입은 site-layout.js 에서 관리합니다.
 */

import {
  ENGLISHTEST_FOOTER_COLUMNS,
  ENGLISHTEST_SNS,
  LINKS,
  LOGO,
  SITE_FOOTER_COLUMNS,
  SITE_FOOTER_GROUPS,
  SITE_LANGUAGES,
} from './layout-data.js';
import { escapeHtml } from './template-utils.js';

/* --------------------------------------------------------------------------
   variant: site (듀오링고 공통 그린 푸터)
   -------------------------------------------------------------------------- */
function renderSiteFooterItem(item) {
  if (typeof item === 'string') return `<li>${escapeHtml(item)}</li>`;
  return `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`;
}

function renderSiteFooter() {
  const groups = SITE_FOOTER_GROUPS.map(
    (group) => `
      <section class="sitemap__group" aria-labelledby="footer-${group.id}" data-js-footer-group="${group.id}">
        <h2 class="site-footer__heading" id="footer-${group.id}">${escapeHtml(group.title)}</h2>
        <ul class="sitemap__list">${group.items.map(renderSiteFooterItem).join('')}</ul>
      </section>
    `,
  ).join('');

  const languages = SITE_LANGUAGES.map(
    ({ lang, label, dir }) => `<li lang="${lang}"${dir ? ` dir="${dir}"` : ''}>${escapeHtml(label)}</li>`,
  ).join('');

  return `
    <footer class="site-footer">
      <div class="inner-box">
        <div class="part sitemap" aria-label="사이트맵" data-js-footer-sitemap>${groups}</div>
        <section class="part footer-site-language" aria-labelledby="footer-language-title">
          <h2 class="site-footer__heading footer-site-language__heading" id="footer-language-title">사이트 언어:</h2>
          <ul class="footer-site-language__list">${languages}</ul>
        </section>
      </div>
    </footer>
  `;
}

/**
 * 화면 폭(모바일 1열 / 태블릿 3열 / 데스크톱 5열)에 맞춰 사이트맵 그룹을 열로 재배치하여
 * 시각적 열 순서와 읽기 순서를 일치시킵니다.
 * @returns {() => void} 리스너 해제 함수
 */
function initSiteFooterColumns(root) {
  const sitemapEl = root.querySelector('[data-js-footer-sitemap]');
  if (!sitemapEl) return () => {};

  const groupEls = new Map(
    [...sitemapEl.querySelectorAll('[data-js-footer-group]')].map((el) => [el.dataset.jsFooterGroup, el]),
  );
  const tabletQuery = window.matchMedia('(min-width: 48rem)');
  const desktopQuery = window.matchMedia('(min-width: 67.5rem)');
  const controller = new AbortController();

  const renderColumns = () => {
    const layout = desktopQuery.matches ? 'desktop' : tabletQuery.matches ? 'tablet' : 'mobile';
    const columns = SITE_FOOTER_COLUMNS[layout].map((names) => {
      const columnEl = document.createElement('div');
      columnEl.className = 'sitemap__column';
      names.forEach((name) => groupEls.has(name) && columnEl.append(groupEls.get(name)));
      return columnEl;
    });
    sitemapEl.replaceChildren(...columns);
  };

  tabletQuery.addEventListener('change', renderColumns, { signal: controller.signal });
  desktopQuery.addEventListener('change', renderColumns, { signal: controller.signal });
  renderColumns();
  return () => controller.abort();
}

/* --------------------------------------------------------------------------
   variant: englishtest (Duolingo English Test 전용 푸터)
   -------------------------------------------------------------------------- */
function renderEnglishtestFooter() {
  const columns = ENGLISHTEST_FOOTER_COLUMNS.map(
    (col) => `
      <div class="englishtest-footer__col englishtest-footer__col--${col.id}">
        <h3 class="englishtest-footer__col-title">${escapeHtml(col.title)}</h3>
        <ul class="englishtest-footer__links">
          ${col.items.map((item) => `<li><a href="#">${escapeHtml(item)}</a></li>`).join('')}
        </ul>
      </div>
    `,
  ).join('');

  const sns = ENGLISHTEST_SNS.map(
    (s) => `
      <a href="${s.href}" target="_blank" rel="noopener noreferrer" class="englishtest-footer__sns-link" aria-label="${escapeHtml(s.label)}">
        <img src="./assets/images/englishtest/${s.icon}" alt="" aria-hidden="true">
      </a>
    `,
  ).join('');

  return `
    <footer class="englishtest-footer">
      <div class="englishtest-footer__mascot-wrap">
        <img src="./assets/images/englishtest/footer_char.svg" alt="Duolingo English Test 캐릭터" class="englishtest-footer__mascot">
      </div>
      <div class="englishtest-footer__wave" aria-hidden="true"></div>
      <div class="englishtest-footer__body">
        <div class="englishtest-footer__inner">
          <div class="englishtest-footer__content">
            <div class="englishtest-footer__brand">
              <a href="${LINKS.englishtest}" aria-label="Duolingo English Test 홈">
                <img src="${LOGO.englishtestWhite.src}" alt="${LOGO.englishtestWhite.alt}" class="englishtest-footer__logo">
              </a>
            </div>
            <nav class="englishtest-footer__categories" aria-label="English Test 사이트 링크">${columns}</nav>
          </div>
          <div class="englishtest-footer__bottom">
            <div class="englishtest-footer__lang" role="button" tabindex="0" aria-label="사이트 언어: 한국어">
              <img src="./assets/images/englishtest/ico_lang.svg" alt="" class="englishtest-footer__lang-icon" aria-hidden="true">
              <span class="englishtest-footer__lang-text">한국어</span>
            </div>
            <div class="englishtest-footer__sns" aria-label="공식 소셜 미디어">${sns}</div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

/* --------------------------------------------------------------------------
   공개 API
   -------------------------------------------------------------------------- */
const FOOTER_VARIANTS = {
  site: { render: renderSiteFooter, init: initSiteFooterColumns },
  englishtest: { render: renderEnglishtestFooter },
};

const pickVariant = (variant) => FOOTER_VARIANTS[variant] || FOOTER_VARIANTS.site;

export function renderFooter(variant) {
  return pickVariant(variant).render();
}

export function initFooter(variant, rootEl) {
  return pickVariant(variant).init?.(rootEl);
}
