/**
 * Match the footer reading order to the responsive visual columns.
 * @returns {() => void} Removes breakpoint listeners.
 */
export const initFooter = () => {
  const sitemapEl = document.querySelector("[data-js-footer-sitemap]");
  if (!sitemapEl) return () => {};
  const groupEls = new Map(
    [...sitemapEl.querySelectorAll("[data-js-footer-group]")].map((groupEl) => [
      groupEl.dataset.jsFooterGroup, groupEl,
    ]),
  );
  const tabletQuery = window.matchMedia("(min-width: 48rem)");
  const desktopQuery = window.matchMedia("(min-width: 67.5rem)");
  const controller = new AbortController();
  const layouts = {
    mobile: [["about", "products", "apps", "support", "legal", "social"]],
    tablet: [["about", "support"], ["products", "legal"], ["apps", "social"]],
    desktop: [["about"], ["products"], ["apps"], ["support"], ["legal", "social"]],
  };
  const renderColumns = () => {
    const layout = desktopQuery.matches ? "desktop" : tabletQuery.matches ? "tablet" : "mobile";
    const columns = layouts[layout].map((names) => {
      const columnEl = document.createElement("div");
      columnEl.className = "sitemap__column";
      for (const name of names) columnEl.append(groupEls.get(name));
      return columnEl;
    });
    sitemapEl.replaceChildren(...columns);
  };
  tabletQuery.addEventListener("change", renderColumns, { signal: controller.signal });
  desktopQuery.addEventListener("change", renderColumns, { signal: controller.signal });
  renderColumns();
  return () => controller.abort();
};
