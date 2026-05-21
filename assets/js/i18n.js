/* ================================================================
   i18n.js — Bilingual EN/ZH toggle for the whole site
   Each translatable element carries data-i18n-en / data-i18n-zh
   (and optionally data-i18n-attr-en / data-i18n-attr-zh = "attr:value").
   Choice is stored in localStorage so it persists across pages.
   ================================================================ */
(function () {
  'use strict';

  const KEY = 'pw-lang';
  const initial =
    localStorage.getItem(KEY) === 'zh' ? 'zh' : 'en';

  // Expose a tiny API for other scripts (research-modal, projects, bio-map)
  const listeners = [];
  const I18N = {
    lang: initial,
    onChange(fn) { listeners.push(fn); },
    set(lang) {
      lang = lang === 'zh' ? 'zh' : 'en';
      if (lang === I18N.lang) return;
      I18N.lang = lang;
      try { localStorage.setItem(KEY, lang); } catch (_) {}
      applyAll();
      listeners.forEach((fn) => { try { fn(lang); } catch (_) {} });
    },
    toggle() { I18N.set(I18N.lang === 'en' ? 'zh' : 'en'); },
    /* Build a localized string for ad-hoc use from an EN/ZH pair. */
    pick(enVal, zhVal) {
      return I18N.lang === 'zh' && zhVal != null ? zhVal : enVal;
    },
  };
  window.PW_I18N = I18N;

  /* Mark <html lang> so CSS / screen-readers can respond. */
  function applyHtmlLang() {
    document.documentElement.lang = I18N.lang === 'zh' ? 'zh-CN' : 'en';
  }

  /* Swap text content / attributes for every flagged element. */
  function applyAll() {
    applyHtmlLang();
    const lang = I18N.lang;

    document.querySelectorAll('[data-i18n-en], [data-i18n-zh]').forEach((el) => {
      const en = el.getAttribute('data-i18n-en');
      const zh = el.getAttribute('data-i18n-zh');
      const value = lang === 'zh' ? (zh != null ? zh : en) : (en != null ? en : zh);
      if (value == null) return;
      const useHtml = el.hasAttribute('data-i18n-html');
      // Reveal-animated elements need their split structure rebuilt.
      const isReveal = el.hasAttribute('data-reveal');
      if (useHtml) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
      if (isReveal && typeof window.PW_REVEAL_RESPLIT === 'function') {
        window.PW_REVEAL_RESPLIT(el);
      }
    });

    // Attribute translations: data-i18n-attr-en="placeholder:Search" pairs.
    document.querySelectorAll('[data-i18n-attr-en], [data-i18n-attr-zh]').forEach((el) => {
      const en = el.getAttribute('data-i18n-attr-en');
      const zh = el.getAttribute('data-i18n-attr-zh');
      const spec = lang === 'zh' ? (zh || en) : (en || zh);
      if (!spec) return;
      const idx = spec.indexOf(':');
      if (idx < 0) return;
      const name = spec.slice(0, idx).trim();
      const value = spec.slice(idx + 1);
      if (name) el.setAttribute(name, value);
    });

    // Update toggle button label if present.
    const btn = document.getElementById('pw-lang-toggle');
    if (btn) {
      btn.setAttribute('aria-label',
        lang === 'zh' ? '切换到英文' : 'Switch to Chinese');
      btn.querySelector('.pw-lang-current').textContent =
        lang === 'zh' ? '中' : 'EN';
      btn.querySelector('.pw-lang-other').textContent =
        lang === 'zh' ? 'EN' : '中';
    }
  }

  function buildButton() {
    if (document.getElementById('pw-lang-toggle')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'pw-lang-toggle';
    btn.className = 'pw-lang-toggle';
    btn.innerHTML =
      '<span class="pw-lang-current"></span>' +
      '<span class="pw-lang-sep" aria-hidden="true">/</span>' +
      '<span class="pw-lang-other"></span>';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      I18N.toggle();
    });
    document.body.appendChild(btn);
  }

  function setup() {
    buildButton();
    applyAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }

  /* Re-apply when other scripts inject content later in the same tick.
     Listening for a custom event keeps coupling loose. */
  document.addEventListener('pw-i18n-refresh', applyAll);
})();
