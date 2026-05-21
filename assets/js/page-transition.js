/* ================================================================
   page-transition.js — Soft fade-out + curtain reveal
   Leaving:  current page fades out (no overlay).
   Entering: a bg-coloured curtain covers the viewport, then wipes
             away while body content fades in.
   Vanilla JS, no framework.
   ================================================================ */
(function () {
  'use strict';

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FLAG = 'pw-transitioning';
  const LEAVE_MS = 520;     // current page fade-out
  const REVEAL_MS = 900;    // curtain wipe + content fade-in

  const isEntering = sessionStorage.getItem(FLAG) === '1';
  if (isEntering) {
    sessionStorage.removeItem(FLAG);
    // Hide content immediately so the curtain reveal doesn't flash.
    document.documentElement.classList.add('pw-entering');
  }

  function buildCurtain() {
    const curtain = document.createElement('div');
    curtain.className = 'pw-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(curtain);
    return curtain;
  }

  function runEnter(curtain) {
    void curtain.offsetHeight;
    requestAnimationFrame(() => {
      curtain.classList.add('is-lifting');
      document.documentElement.classList.remove('pw-entering');
      document.documentElement.classList.add('pw-entered');
    });

    setTimeout(() => {
      curtain.remove();
      document.documentElement.classList.remove('pw-entered');
    }, REVEAL_MS + 200);
  }

  function isInternalNav(a, e) {
    if (e.defaultPrevented) return false;
    if (e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (!a || !a.getAttribute) return false;
    const href = a.getAttribute('href');
    if (!href) return false;
    if (a.target && a.target !== '' && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:')
    )
      return false;

    let url;
    try {
      url = new URL(href, location.href);
    } catch (_) {
      return false;
    }
    if (url.origin !== location.origin) return false;
    if (
      url.pathname === location.pathname &&
      url.search === location.search &&
      url.hash !== ''
    )
      return false;
    return url;
  }

  function bindLinks() {
    document.addEventListener(
      'click',
      function (e) {
        const a = e.target && e.target.closest ? e.target.closest('a') : null;
        const url = a && isInternalNav(a, e);
        if (!url) return;

        e.preventDefault();
        sessionStorage.setItem(FLAG, '1');

        if (prefersReduced) {
          window.location.href = url.href;
          return;
        }

        document.documentElement.classList.add('pw-leaving');
        setTimeout(() => {
          window.location.href = url.href;
        }, LEAVE_MS);
      },
      false
    );
  }

  function setup() {
    if (prefersReduced) {
      if (isEntering) document.documentElement.classList.remove('pw-entering');
      bindLinks();
      return;
    }

    if (isEntering) {
      const curtain = buildCurtain();
      runEnter(curtain);
    }

    bindLinks();

    window.addEventListener('pageshow', function (ev) {
      if (ev.persisted) {
        document.documentElement.classList.remove(
          'pw-entering',
          'pw-entered',
          'pw-leaving'
        );
        const c = document.querySelector('.pw-curtain');
        if (c) c.remove();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
