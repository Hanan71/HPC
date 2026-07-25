/**
 * HPC Intilaqa — i18n Engine
 * ─────────────────────────────────────────────────────────────────────────
 * • Loads AR / EN translations from js/i18n/{lang}.json
 * • Reads / writes user preference to localStorage ('hpc-lang')
 * • Swaps Bootstrap RTL ↔ LTR stylesheet
 * • Sets <html lang dir> automatically
 * • Translates every [data-i18n] (textContent) and [data-i18n-html] (innerHTML)
 * • Exposes window.t(key), window.applyLang(lang), window.toggleLang()
 */
(function () {
  'use strict';

  const LS_KEY        = 'hpc-lang';
  const DEFAULT_LANG  = 'ar';
  const BOOTSTRAP_RTL = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css';
  const BOOTSTRAP_LTR = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';

  // ── State ─────────────────────────────────────────────────────────────────
  let currentLang = localStorage.getItem(LS_KEY) || DEFAULT_LANG;
  let translations = {};          // populated after fetch resolves
  let domReady     = false;

  // Apply dir/lang to <html> immediately — before DOMContentLoaded — so the
  // browser lays out the page in the correct direction from the very first paint.
  document.documentElement.lang = currentLang;
  document.documentElement.dir  = currentLang === 'ar' ? 'rtl' : 'ltr';

  // ── Load JSON files ───────────────────────────────────────────────────────
  const base = (function () {
    // Resolve the path to js/i18n/ relative to i18n.js itself
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src || '';
      if (src.includes('i18n.js')) {
        return src.replace(/i18n\.js.*$/, 'i18n/');
      }
    }
    return 'js/i18n/';
  })();

  Promise.all([
    fetch(base + 'ar.json').then(r => r.json()),
    fetch(base + 'en.json').then(r => r.json()),
  ])
    .then(([ar, en]) => {
      translations = { ar, en };
      // If DOM is already ready, apply now; otherwise the DOMContentLoaded
      // listener below will call applyLang once the DOM is ready.
      if (domReady) applyLang(currentLang);
    })
    .catch(err => {
      console.error('[i18n] Failed to load translation files:', err);
      // Reveal body even if translations fail — don't leave users with a blank page
      document.body && (document.body.style.visibility = '');
    });

  // ── Helpers ───────────────────────────────────────────────────────────────
  function t(key) {
    const dict = (translations[currentLang] || translations[DEFAULT_LANG] || {});
    return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
  }

  function applyLang(lang) {
    if (!translations[lang]) return; // translations not loaded yet

    currentLang = lang;
    localStorage.setItem(LS_KEY, lang);

    // 1. <html> attributes
    const html = document.documentElement;
    html.lang = lang;
    html.dir  = lang === 'ar' ? 'rtl' : 'ltr';

    // 2. Bootstrap stylesheet (RTL ↔ LTR)
    const bsLink = document.getElementById('bootstrap-css');
    if (bsLink) bsLink.href = lang === 'ar' ? BOOTSTRAP_RTL : BOOTSTRAP_LTR;

    // 3. Plain-text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });

    // 4. innerHTML nodes (contain sub-tags like <br>, <i>, <small>)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });

    // 5. <title>
    const pgKey = document.body && document.body.dataset.i18nPageTitle;
    if (pgKey) document.title = t(pgKey);

    // 6. Toggle-button label
    const lbl = document.querySelector('#lang-toggle .lang-label');
    if (lbl) lbl.textContent = t('toggle_label');

    // 7. Reveal body (in case it was hidden to prevent FOUC)
    if (document.body) document.body.style.visibility = '';
  }

  function toggleLang() {
    applyLang(currentLang === 'ar' ? 'en' : 'ar');
  }

  // ── DOM ready ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    domReady = true;
    // Apply if translations are already loaded; otherwise the fetch .then() will
    applyLang(currentLang);
  });

  // ── Exports ───────────────────────────────────────────────────────────────
  window.t          = t;
  window.applyLang  = applyLang;
  window.toggleLang = toggleLang;
})();
