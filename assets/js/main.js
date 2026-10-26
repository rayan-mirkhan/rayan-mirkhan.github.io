/*
 * Page behaviour: sticky header, mobile menu, scroll reveals, ticker, stat counters,
 * showreel facades, press-pass tilt, footer year.
 */
(function () {
  'use strict';

  /*
   * SHOWREEL VIDEOS
   * One entry per showreel card in index.html, in the same order (featured card first).
   * To publish a video, paste its YouTube ID, the part after "watch?v=" in
   * https://www.youtube.com/watch?v=dQw4w9WgXcQ  ->  id: 'dQw4w9WgXcQ'
   * An empty id keeps that card in its "Coming soon" state.
   */
  var VIDEOS = [
    { id: '' }, // Featured: News Anchor
    { id: '' }, // Program Presenter
    { id: '' }  // Panel & conference moderation
  ];

  var root = document.documentElement;
  var i18n = window.RM.i18n;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function formatNumber(n) {
    var locale = i18n.lang === 'ku' ? 'ar-IQ-u-nu-arab' : 'en';
    return new Intl.NumberFormat(locale, { useGrouping: false }).format(n);
  }

  /* ---------- Header: transparent -> solid after 40px ---------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var update = function () { header.classList.toggle('is-solid', window.scrollY > 40); };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Mobile menu: focus trap, Esc, scroll lock ---------- */
  function initMenu() {
    var btn = document.querySelector('.menu-btn');
    var menu = document.getElementById('menu');
    if (!btn || !menu) return;
    var closeBtn = menu.querySelector('.menu__close');

    function focusables() {
      return Array.prototype.slice.call(menu.querySelectorAll('a[href], button:not([disabled])'));
    }

    function onKeydown(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var items = focusables();
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function open() {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      root.classList.add('is-locked');
      document.addEventListener('keydown', onKeydown);
      closeBtn.focus();
    }

    function close(restoreFocus) {
      if (menu.hidden) return;
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      root.classList.remove('is-locked');
      document.removeEventListener('keydown', onKeydown);
      if (restoreFocus !== false) btn.focus();
    }

    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', function () { close(); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('.menu__link')) close(false);
    });
    // Leaving the mobile breakpoint with the menu open would leave the page scroll-locked.
    window.matchMedia('(min-width: 60em)').addEventListener('change', function (mq) {
      if (mq.matches) close(false);
    });
  }

  /* ---------- Scroll reveals ---------- */
  function initReveals() {
    var targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty('--i', i);
      });
    });

    if (!('IntersectionObserver' in window) || reducedMotion.matches) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Ticker: duplicate the list for a seamless loop ---------- */
  function initTicker() {
    var track = document.querySelector('.ticker__track');
    if (!track) return;
    var list = track.querySelector('.ticker__list');
    var clone = list.cloneNode(true);
    clone.classList.add('ticker__list--clone');
    track.appendChild(clone);
    track.classList.add('is-ready');
  }

  /* ---------- Stat counters (count once, in the active numeral system) ---------- */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    function render(el, value) { el.textContent = formatNumber(value); }

    function animate(el) {
      var target = Number(el.getAttribute('data-count'));
      el.setAttribute('data-counted', '');
      if (reducedMotion.matches) { render(el, target); return; }
      var duration = 1100;
      var start = performance.now();
      function frame(now) {
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        render(el, Math.round(eased * target));
        if (p < 1) requestAnimationFrame(frame);
      }
      render(el, 0);
      requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) return; // static numbers in the HTML stay correct

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });

    document.addEventListener('rm:langchange', function () {
      nums.forEach(function (el) { render(el, Number(el.getAttribute('data-count'))); });
    });
    // Page loaded in English: swap the Kurdish numerals in the HTML right away.
    if (i18n.lang === 'en') nums.forEach(function (el) { render(el, Number(el.getAttribute('data-count'))); });
  }

  /* ---------- Showreel facades (iframe only injected on click) ---------- */
  function initVideos() {
    document.querySelectorAll('[data-video]').forEach(function (card) {
      var video = VIDEOS[Number(card.getAttribute('data-video'))];
      if (!video || !/^[\w-]{11}$/.test(video.id)) return; // stays "Coming soon"

      var frame = card.querySelector('.video__frame');
      var title = card.querySelector('.video__title');
      var chip = card.querySelector('.chip');
      if (chip) chip.hidden = true;
      card.classList.add('has-video');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'video__btn';
      btn.style.backgroundImage = 'url("https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg")';
      btn.innerHTML = '<span class="video__play" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>';

      function label() { btn.setAttribute('aria-label', i18n.t('a11y.play') + ': ' + title.textContent); }
      label();
      document.addEventListener('rm:langchange', label);

      btn.addEventListener('click', function () {
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + video.id + '?autoplay=1&rel=0';
        iframe.title = title.textContent;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.replaceChildren(iframe);
        iframe.focus();
      });

      frame.replaceChildren(btn);
    });
  }

  /* ---------- Press-pass tilt (fine pointers only) ---------- */
  function initTilt() {
    var card = document.querySelector('[data-tilt]');
    if (!card || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var MAX_DEG = 6;

    card.addEventListener('pointermove', function (e) {
      if (reducedMotion.matches) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', (-y * MAX_DEG).toFixed(2) + 'deg');
      card.style.setProperty('--ry', (x * MAX_DEG).toFixed(2) + 'deg');
      card.classList.add('is-tilting');
    });
    card.addEventListener('pointerleave', function () {
      card.style.removeProperty('--rx');
      card.style.removeProperty('--ry');
      card.classList.remove('is-tilting');
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    var el = document.querySelector('[data-year]');
    if (!el) return;
    var render = function () { el.textContent = formatNumber(new Date().getFullYear()); };
    render();
    document.addEventListener('rm:langchange', render);
  }

  initHeader();
  initMenu();
  initTicker();
  initReveals();
  initCounters();
  initVideos();
  initTilt();
  initYear();
})();
