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

  const updateControls = () => {
    const maxScroll = viewportEl.scrollWidth - viewportEl.clientWidth;
    previousButtonEl.disabled = viewportEl.scrollLeft <= 0;
    nextButtonEl.disabled = viewportEl.scrollLeft >= maxScroll - 1;
  };

  const scrollByPage = (direction) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewportEl.scrollBy({
      left: viewportEl.clientWidth * SCROLL_PAGE_RATIO * direction,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  previousButtonEl.addEventListener("click", () => scrollByPage(-1), { signal });
  nextButtonEl.addEventListener("click", () => scrollByPage(1), { signal });
  viewportEl.addEventListener("scroll", updateControls, { passive: true, signal });
  window.addEventListener("resize", updateControls, { signal });

  updateControls();

  return () => controller.abort();
};

const destroyLanguageScroller = initLanguageScroller();

export { destroyLanguageScroller };
