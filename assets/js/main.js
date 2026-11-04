import { initFooter } from "./footer.js";
import { initScrollBackground } from "./scroll-background.js";

const SCROLL_PAGE_RATIO = 0.75;

/**
 * Connects the language list's horizontal scroll controls.
 * @returns {() => void} Removes the registered event listeners.
 */
const initLanguageScroller = () => {
  const listEl = document.querySelector("[data-js-language-list]");
  const viewportEl = document.querySelector("[data-js-language-viewport]");
  const previousButtonEl = document.querySelector("[data-js-language-prev]");
  const nextButtonEl = document.querySelector("[data-js-language-next]");

  if (!listEl || !viewportEl || !previousButtonEl || !nextButtonEl) {
    throw new Error("Language scroller controls are missing from the page.");
  }

  const controller = new AbortController();
  const { signal } = controller;

  const scrollByPage = (direction) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewportEl.scrollBy({
      left: viewportEl.clientWidth * SCROLL_PAGE_RATIO * direction,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  previousButtonEl.addEventListener("click", () => scrollByPage(-1), { signal });
  nextButtonEl.addEventListener("click", () => scrollByPage(1), { signal });

  return () => controller.abort();
};

const initCompactHeaderNav = () => {
  const primaryNavEl = document.querySelector("[data-js-primary-nav]");
  const languageDetailsEl = primaryNavEl?.querySelector(".site-language");
  const languageSummaryEl = primaryNavEl?.querySelector(".site-language__summary");
  const compactCtaEl = primaryNavEl?.querySelector(".site-header__compact-cta");
  const loginButtonEl = document.querySelector(".landing-hero__actions .btn--outline");
  const benefitEl = document.querySelector(".benefit");
  const englishTestEl = document.querySelector(".englishtest");

  if (
    !primaryNavEl ||
    !languageDetailsEl ||
    !languageSummaryEl ||
    !compactCtaEl ||
    !loginButtonEl ||
    !benefitEl ||
    !englishTestEl
  ) {
    throw new Error("Compact navigation elements are missing from the page.");
  }

  const controller = new AbortController();
  const { signal } = controller;
  let animationFrame = 0;
  let instantSwitchFrame = 0;
  let previousScrollY = window.scrollY;
  let previouslyPassedLoginButton = false;

  const updateVisibility = () => {
    animationFrame = 0;
    const currentScrollY = window.scrollY;
    const loginButtonBottom = loginButtonEl.getBoundingClientRect().bottom + window.scrollY;
    const benefitBottom = benefitEl.getBoundingClientRect().bottom + window.scrollY;
    const englishTestTop = englishTestEl.getBoundingClientRect().top + window.scrollY;
    const englishTestBottom = englishTestEl.getBoundingClientRect().bottom + window.scrollY;
    const hasPassedLoginButton = window.scrollY >= loginButtonBottom;
    const hasPassedBenefit = window.scrollY >= benefitBottom;
    const isInBenefit = hasPassedLoginButton && !hasPassedBenefit;
    const isInEnglishTest = window.scrollY + 1 >= englishTestTop && window.scrollY < englishTestBottom;
    const isCompactNavVisible = isInBenefit || isInEnglishTest;
    const isReturningToPrimaryNav =
      currentScrollY < previousScrollY && previouslyPassedLoginButton && !hasPassedLoginButton;

    if (isReturningToPrimaryNav) {
      primaryNavEl.classList.add("is-instant-switch");
      if (instantSwitchFrame) {
        window.cancelAnimationFrame(instantSwitchFrame);
      }
      instantSwitchFrame = window.requestAnimationFrame(() => {
        primaryNavEl.classList.remove("is-instant-switch");
        instantSwitchFrame = 0;
      });
    }

    primaryNavEl.classList.toggle("is-scrolled", window.scrollY > 0);
    primaryNavEl.classList.toggle("is-compact", isCompactNavVisible);
    primaryNavEl.classList.toggle("is-hidden", hasPassedLoginButton && !isCompactNavVisible);
    primaryNavEl.setAttribute("aria-hidden", String(hasPassedLoginButton && !isCompactNavVisible));
    primaryNavEl.inert = hasPassedLoginButton && !isCompactNavVisible;
    languageDetailsEl.setAttribute("aria-hidden", String(isCompactNavVisible));
    languageDetailsEl.inert = isCompactNavVisible;
    languageSummaryEl.tabIndex = isCompactNavVisible ? -1 : 0;
    compactCtaEl.setAttribute("aria-hidden", String(!isCompactNavVisible));
    compactCtaEl.inert = !isCompactNavVisible;
    compactCtaEl.tabIndex = isCompactNavVisible ? 0 : -1;
    previousScrollY = currentScrollY;
    previouslyPassedLoginButton = hasPassedLoginButton;
  };

  const scheduleUpdate = () => {
    if (animationFrame) {
      return;
    }
    animationFrame = window.requestAnimationFrame(updateVisibility);
  };

  const setInitialVisibility = () => {
    updateVisibility();
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true, signal });
  window.addEventListener("resize", scheduleUpdate, { signal });
  window.addEventListener("load", setInitialVisibility, { once: true, signal });
  updateVisibility();

  return () => {
    controller.abort();
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }
    if (instantSwitchFrame) {
      window.cancelAnimationFrame(instantSwitchFrame);
    }
  };
};

const destroyLanguageScroller = initLanguageScroller();
const destroyCompactHeaderNav = initCompactHeaderNav();
const destroyFooter = initFooter();
const destroyScrollBackground = initScrollBackground();

export { destroyCompactHeaderNav, destroyLanguageScroller, destroyFooter, destroyScrollBackground };
