(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supportsIO = 'IntersectionObserver' in window;

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  (function () {
    var heroImg = document.getElementById('heroImg');
    if (!heroImg) return;

    var markLoaded = function () {
      heroImg.classList.add('is-loaded');
      document.documentElement.setAttribute('data-hero', 'loaded');
    };

    var markError = function () {
      document.documentElement.setAttribute('data-hero', 'error');
    };

    if (heroImg.complete) {
      if (heroImg.naturalWidth > 0) markLoaded();
      else markError();
    } else {
      heroImg.addEventListener('load', markLoaded, { once: true });
      heroImg.addEventListener('error', markError, { once: true });
    }
  })();

  (function () {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var ticking = false;
    var lastState = null;

    var update = function () {
      var scrolled = window.scrollY > 24;
      if (scrolled !== lastState) {
        nav.classList.toggle('is-scrolled', scrolled);
        lastState = scrolled;
      }
      ticking = false;
    };

    var onScroll = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  })();

  (function () {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!supportsIO || prefersReducedMotion) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    items.forEach(function (el) { io.observe(el); });
  })();

  (function () {
    var video = document.getElementById('videoPlayer');
    if (!video) return;

    if (prefersReducedMotion) {
      video.pause();
      video.removeAttribute('autoplay');
      return;
    }

    if (!supportsIO) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var p = video.play();
            if (p && typeof p.catch === 'function') p.catch(function () {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    io.observe(video);
  })();

  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
    if (!links.length || !supportsIO) return;

    var sections = links
      .map(function (link) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return null;
        var el = document.querySelector(id);
        return el ? { el: el, link: link } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    var setActive = function (activeLink) {
      links.forEach(function (l) {
        l.classList.toggle('is-active', l === activeLink);
      });
    };

    var io = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (e) { return e.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });

        if (visible.length) {
          var match = sections.find(function (s) { return s.el === visible[0].target; });
          if (match) setActive(match.link);
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach(function (s) { io.observe(s.el); });
  })();

  (function () {
    var anchors = document.querySelectorAll('a[href^="#"]');
    if (!anchors.length) return;

    var headerOffset = function () {
      var nav = document.getElementById('nav');
      return (nav ? nav.offsetHeight : 80) + 12;
    };

    var smoothScrollTo = function (top) {
      if (prefersReducedMotion) {
        window.scrollTo(0, top);
        return;
      }
      window.scrollTo({ top: top, behavior: 'smooth' });
    };

    anchors.forEach(function (anchor) {
      anchor.addEventListener('click', function (event) {
        var href = anchor.getAttribute('href');

        if (!href || href === '#') {
          event.preventDefault();
          smoothScrollTo(0);
          return;
        }

        var target;
        try {
          target = document.querySelector(href);
        } catch (err) {
          return;
        }

        if (!target) return;

        event.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
        smoothScrollTo(Math.max(0, top));
      });
    });
  })();

  (function () {
    if (window.matchMedia('(hover: none)').matches) {
      document.documentElement.classList.add('is-touch');
    }
  })();
})();