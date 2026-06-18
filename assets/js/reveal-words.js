/* ================================================================
   reveal-words.js — word-mask rise-from-below animation
   For any element marked with `data-reveal`, split its text into
   words wrapped in <span class="rt-word-mask"><span class="rt-word">…</span></span>
   with staggered animation-delay. CSS in design-system.css does the rest.

   Above-the-fold elements (data-reveal-immediate or visible at load)
   animate on DOM ready. Others wait until they scroll into view.
   ================================================================ */
(function () {
  'use strict';

  const STAGGER_MS = 60;
  const BASE_DELAY_MS = 80;

  function splitElement(el) {
    if (el.dataset.revealed === 'true') return;
    el.dataset.revealed = 'true';

    // Walk child nodes; preserve <br> and inline tags as-is.
    const frag = document.createDocumentFragment();
    let wordIdx = 0;
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.nodeValue.split(/(\s+)/);
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const mask = document.createElement('span');
          mask.className = 'rt-word-mask';
          const word = document.createElement('span');
          word.className = 'rt-word';
          word.style.animationDelay = (BASE_DELAY_MS + wordIdx * STAGGER_MS) + 'ms';
          word.textContent = part;
          mask.appendChild(word);
          frag.appendChild(mask);
          wordIdx++;
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Preserve <br>; treat other inline elements as opaque single units.
        frag.appendChild(node.cloneNode(true));
      }
    });

    el.innerHTML = '';
    el.appendChild(frag);
  }

  function init() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    // Above-fold (or no IO support): split immediately
    const supportsIO = 'IntersectionObserver' in window;
    if (!supportsIO) {
      targets.forEach(splitElement);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          splitElement(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    targets.forEach((t) => {
      const rect = t.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        splitElement(t);
      } else {
        io.observe(t);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Allow other scripts (i18n) to re-split a reveal element after its
     content has been swapped, so the rise-from-below animation replays. */
  window.PW_REVEAL_RESPLIT = function (el) {
    if (!el) return;
    el.dataset.revealed = '';
    splitElement(el);
  };
})();
