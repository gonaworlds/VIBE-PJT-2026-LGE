/**
 * Fade the background while scrolling through the container, after entry.
 * @returns {() => void} Removes listeners, observers, and pending updates.
 */
export const initScrollBackground = () => {
  const containerEl = document.querySelector("[data-js-scroll-background]");
  if (!containerEl) return () => {};

  const controller = new AbortController();
  const { signal } = controller;
  let frameId = 0;
  let previousProgress = -1;

  const updateBackground = () => {
    frameId = 0;
    const viewportHeight = window.innerHeight;
    const { top, height } = containerEl.getBoundingClientRect();
    // Keep entry white; finish when the container's bottom reaches the viewport bottom.
    // Short sections still get a full viewport of gradual color change.
    const scrollDistance = Math.max(height - viewportHeight, viewportHeight);
    const progress = Math.min(1, Math.max(0, -top / scrollDistance));
    if (progress === previousProgress) return;
    containerEl.style.setProperty("--container-background-progress", String(progress));
    previousProgress = progress;
  };

  const scheduleUpdate = () => {
    if (!frameId) frameId = window.requestAnimationFrame(updateBackground);
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true, signal });
  window.addEventListener("resize", scheduleUpdate, { signal });
  window.addEventListener("pageshow", scheduleUpdate, { signal });
  window.addEventListener("load", scheduleUpdate, { once: true, signal });
  // Images and fonts above the section can move its start after initial layout.
  const observer = new ResizeObserver(scheduleUpdate);
  observer.observe(document.body);
  updateBackground();

  return () => {
    controller.abort();
    observer.disconnect();
    if (frameId) window.cancelAnimationFrame(frameId);
    containerEl.style.removeProperty("--container-background-progress");
  };
};
