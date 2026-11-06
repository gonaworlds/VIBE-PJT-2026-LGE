/**
 * Duolingo English Test Page JavaScript
 * - Hamburger mobile/tablet drawer toggle
 * - Keyboard accessibility (ESC to close)
 * - Scroll lock when drawer is active
 */

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.nav__toggle');
  const drawer = document.getElementById('mobileDrawer');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    toggleBtn.classList.add('is-active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-locked');
  }

  function closeDrawer() {
    toggleBtn.classList.remove('is-active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-locked');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  // Close on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // Close when window resized to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // Close when clicking a drawer link
  drawer.querySelectorAll('.mobile-drawer__link, .mobile-drawer__btn').forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });
});

