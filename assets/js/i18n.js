/*
 * Language switching: Kurdish (ku-Arab, RTL, default) <-> English (en, LTR).
 * Other scripts can listen for the `rm:langchange` event on document (detail: { lang }).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'rm-lang';
  var FADE_MS = 180;
  var LANGS = {
    ku: { htmlLang: 'ku-Arab', dir: 'rtl', cv: 'assets/cv/rayan-mirkhan-cv-ku.pdf' },
    en: { htmlLang: 'en', dir: 'ltr', cv: 'assets/cv/rayan-mirkhan-cv-en.pdf' }
  };

  var root = document.documentElement;
  var dict = window.RM.translations;
  var current = root.lang === 'en' ? 'en' : 'ku';

  function t(key, lang) {
    var table = dict[lang || current];
    return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : null;
  }

  function translateText(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n'), lang);
      if (value !== null) el.textContent = value;
    });
  }

  // data-i18n-attr="aria-label:key,alt:key2"
  function translateAttrs(lang) {
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var parts = pair.split(':');
        var value = t(parts[1].trim(), lang);
        if (value !== null) el.setAttribute(parts[0].trim(), value);
      });
    });
  }

  function syncToggle(lang) {
    document.querySelectorAll('.lang-toggle__opt').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === lang;
      btn.setAttribute('aria-checked', String(active));
      btn.tabIndex = active ? 0 : -1;
    });
  }

  function apply(lang) {
    var cfg = LANGS[lang];
    current = lang;
    root.lang = cfg.htmlLang;
    root.dir = cfg.dir;
    translateText(lang);
    translateAttrs(lang);
    document.querySelectorAll('[data-cv-link]').forEach(function (a) { a.setAttribute('href', cfg.cv); });
    syncToggle(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage blocked: choice just isn't remembered */ }
    document.dispatchEvent(new CustomEvent('rm:langchange', { detail: { lang: lang } }));
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function switchTo(lang) {
    if (lang === current || !LANGS[lang]) return;
    var main = document.getElementById('main');
    if (!main || prefersReducedMotion()) { apply(lang); return; }
    main.classList.add('is-switching');
    setTimeout(function () {
      apply(lang);
      main.classList.remove('is-switching');
    }, FADE_MS);
  }

  function initToggle() {
    var group = document.querySelector('.lang-toggle');
    if (!group) return;
    var options = Array.prototype.slice.call(group.querySelectorAll('.lang-toggle__opt'));

    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.lang-toggle__opt');
      if (btn) switchTo(btn.getAttribute('data-lang'));
    });

    // Radio-group keyboard pattern: arrows move selection and focus.
    group.addEventListener('keydown', function (e) {
      var keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
      if (keys.indexOf(e.key) === -1) return;
      e.preventDefault();
      var idx = options.indexOf(document.activeElement);
      var next = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : (idx + 1) % options.length;
      options[next].focus();
      switchTo(options[next].getAttribute('data-lang'));
    });
  }

  window.RM.i18n = {
    t: t,
    get lang() { return current; },
    switchTo: switchTo
  };

  initToggle();
  if (current === 'en') apply('en');
  else syncToggle('ku');
  root.classList.remove('i18n-pending');
})();
