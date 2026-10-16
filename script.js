/* =========================================================
   FELIPE — FOTOGRAFÍA Y VIDEO
   ========================================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsIO = 'IntersectionObserver' in window;

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  (function initHeroImage() {
    const heroImg = document.getElementById('heroImg');
    if (!heroImg) return;

    const markLoaded = () => {
      heroImg.classList.add('is-loaded');
      document.documentElement.setAttribute('data-hero', 'loaded');
    };

    const markError = () => {
      document.documentElement.setAttribute('data-hero', 'error');
      console.warn(
        '[Hero] No se pudo cargar "recursos/fondo.webp". ' +
        'Verificá que el archivo exista dentro de la carpeta "recursos". ' +
        'Ruta intentada: ' + heroImg.src
      );
    };

    if (heroImg.complete) {
      heroImg.naturalWidth > 0 ? markLoaded() : markError();
    } else {
      heroImg.addEventListener('load', markLoaded, { once: true });
      heroImg.addEventListener('error', markError, { once: true });
    }
  })();

  (function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let ticking = false;
    let lastState = null;

    const update = () => {
      const scrolled = window.scrollY > 24;
      if (scrolled !== lastState) {
        nav.classList.toggle('is-scrolled', scrolled);
        lastState = scrolled;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  })();

  (function initReveals() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!supportsIO || prefersReducedMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    items.forEach((el) => io.observe(el));
  })();

  (function initVideo() {
    const video = document.getElementById('videoPlayer');
    if (!video) return;

    if (prefersReducedMotion) {
      video.pause();
      video.removeAttribute('autoplay');
      return;
    }

    if (!supportsIO) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
              playPromise.catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    io.observe(video);
  })();

  (function initScrollSpy() {
    const links = Array.from(document.querySelectorAll('[data-nav]'));
    if (!links.length || !supportsIO) return;

    const sections = links
      .map((link) => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return null;
        const el = document.querySelector(id);
        return el ? { el, link } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const setActive = (activeLink) => {
      links.forEach((l) => l.classList.toggle('is-active', l === activeLink));
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length) {
          const match = sections.find((s) => s.el === visible[0].target);
          if (match) setActive(match.link);
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((s) => io.observe(s.el));
  })();

  (function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (!anchors.length) return;

    const headerOffset = () => {
      const nav = document.getElementById('nav');
      return (nav ? nav.offsetHeight : 80) + 12;
    };

    anchors.forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const href = anchor.getAttribute('href');

        if (!href || href === '#') {
          event.preventDefault();
          smoothScrollTo(0);
          return;
        }

        let target;
        try {
          target = document.querySelector(href);
        } catch (_) {
          return;
        }

        if (!target) return;

        event.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
        smoothScrollTo(Math.max(0, top));
      });
    });

    function smoothScrollTo(top) {
      if (prefersReducedMotion) {
        window.scrollTo(0, top);
        return;
      }
      window.scrollTo({ top, behavior: 'smooth' });
    }
  })();

  (function initTouchClass() {
    if (window.matchMedia('(hover: none)').matches) {
      document.documentElement.classList.add('is-touch');
    }
  })();
})();