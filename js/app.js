/**
 * Общая инициализация: тема, язык, навигация, PWA, i18n, утилиты UI.
 */
(function (global) {
  'use strict';

  var C = global.CL_CONSTANTS;
  var SK = C && C.STORAGE_KEYS;

  var FALLBACK_I18N = {
    ru: {
      nav_home: 'Главная',
      nav_diagnose: 'Диагностика',
      nav_research: 'Наука',
      nav_profile: 'Профиль',
      nav_coach: 'AI-Коуч',
      nav_journal: 'Дневник',
      nav_experiment: 'Эксперимент',
      nav_library: 'Библиотека',
      nav_team: 'Команда',
      nav_challenges: 'Челленджи',
      nav_achievements: 'Достижения',
      nav_settings: 'Настройки',
      privacy_note: 'Все данные хранятся только на вашем устройстве.',
      demo_coach: 'AI-Коуч работает в демо-режиме (шаблоны, без нейросети).'
    },
    en: {
      nav_home: 'Home',
      nav_diagnose: 'Diagnose',
      nav_research: 'Research',
      nav_profile: 'Profile',
      nav_coach: 'AI Coach',
      nav_journal: 'Journal',
      nav_experiment: 'Experiment',
      nav_library: 'Library',
      nav_team: 'Team',
      nav_challenges: 'Challenges',
      nav_achievements: 'Achievements',
      nav_settings: 'Settings',
      privacy_note: 'All data stays on your device only.',
      demo_coach: 'AI Coach is a DEMO (templates, not a neural net).'
    }
  };

  var i18n = FALLBACK_I18N.ru;
  var currentLang = 'ru';

  function loadSettings() {
    try {
      var raw = localStorage.getItem(SK.SETTINGS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveSettings(s) {
    localStorage.setItem(SK.SETTINGS, JSON.stringify(s));
  }

  function applyTheme(theme) {
    var t = theme || loadSettings().theme || 'dark';
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  }

  /** Масштаб: normal | comfort | compact (селектор в настройках). */
  function applyUiComfort() {
    var s = loadSettings();
    var scale = s.uiScale;
    if (!scale) {
      if (s.uiCompact === true) scale = 'compact';
      else scale = 'normal';
    }
    document.documentElement.classList.remove('cl-ui-comfort', 'cl-ui-compact');
    if (scale === 'comfort') document.documentElement.classList.add('cl-ui-comfort');
    else if (scale === 'compact') document.documentElement.classList.add('cl-ui-compact');
  }

  function setLang(lang, cb) {
    currentLang = lang === 'en' ? 'en' : 'ru';
    i18n = FALLBACK_I18N[currentLang] || FALLBACK_I18N.ru;
    if (global.location.protocol !== 'file:') {
      fetch('locales/' + currentLang + '.json')
        .then(function (r) {
          return r.json();
        })
        .then(function (j) {
          for (var k in j) {
            if (j.hasOwnProperty(k)) i18n[k] = j[k];
          }
          applyI18nToDom();
          if (cb) cb();
        })
        .catch(function () {
          applyI18nToDom();
          if (cb) cb();
        });
    } else {
      applyI18nToDom();
      if (cb) cb();
    }
  }

  function t(key) {
    return i18n[key] || FALLBACK_I18N.ru[key] || key;
  }

  function applyI18nToDom() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (t(k)) el.textContent = t(k);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(k));
    });
  }

  function initNav(active) {
    document.querySelectorAll('.cl-nav a[data-nav]').forEach(function (a) {
      var n = a.getAttribute('data-nav');
      if (n === active) {
        a.setAttribute('aria-current', 'page');
        a.classList.add('is-active');
      } else {
        a.removeAttribute('aria-current');
        a.classList.remove('is-active');
      }
    });
    var btn = document.querySelector('.cl-nav-toggle');
    var drawer = document.querySelector('.cl-nav-drawer');
    if (btn && drawer) {
      btn.addEventListener('click', function () {
        var open = drawer.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && global.location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  function triggerConfetti() {
    if (loadSettings().sound === true && global.CLApp && global.CLApp.playPing) {
      global.CLApp.playPing();
    }
    var canvas = document.getElementById('cl-confetti');
    if (!canvas) return;
    canvas.classList.add('is-on');
    setTimeout(function () {
      canvas.classList.remove('is-on');
    }, 2200);
  }

  function playPing() {
    try {
      var ctx = new (global.AudioContext || global.webkitAudioContext)();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  function initParticles() {
    var c = document.getElementById('cl-particles');
    if (!c || loadSettings().particles === false) return;
    var ctx = c.getContext('2d');
    var w, h, dots;
    function resize() {
      w = c.width = global.innerWidth;
      h = c.height = global.innerHeight;
      dots = [];
      for (var i = 0; i < 40; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2 + 0.5,
          vy: Math.random() * 0.3 + 0.05
        });
      }
    }
    resize();
    var deb =
      global.CLUtils && global.CLUtils.debounce
        ? global.CLUtils.debounce(resize, 200)
        : resize;
    global.addEventListener('resize', deb);
    function loop() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(67, 97, 238, 0.15)';
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.y -= d.vy;
        if (d.y < 0) d.y = h;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  function openModal(id) {
    var m = document.getElementById(id);
    if (m) {
      m.hidden = false;
      m.removeAttribute('hidden');
      m.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal(id) {
    var m = document.getElementById(id);
    if (m) {
      m.hidden = true;
      m.setAttribute('aria-hidden', 'true');
    }
  }

  function initModals() {
    if (document.body.dataset.clModalBound === '1') return;
    document.body.dataset.clModalBound = '1';
    document.body.addEventListener('click', function (e) {
      var el = e.target;
      if (!el || !el.closest) return;
      var closeBtn = el.closest('[data-modal-close]');
      if (closeBtn) {
        e.preventDefault();
        var cid = closeBtn.getAttribute('data-modal-close');
        if (cid) closeModal(cid);
        else {
          var mc = closeBtn.closest('.cl-modal');
          if (mc) {
            mc.hidden = true;
            mc.setAttribute('aria-hidden', 'true');
          }
        }
        return;
      }
      var openBtn = el.closest('[data-modal-open]');
      if (openBtn) {
        e.preventDefault();
        var oid = openBtn.getAttribute('data-modal-open');
        if (oid) openModal(oid);
        return;
      }
      if (el.classList && el.classList.contains('cl-modal')) {
        if (el.id) closeModal(el.id);
        else {
          el.hidden = true;
          el.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  function init(options) {
    var opts = options || {};
    var s = loadSettings();
    applyTheme(s.theme);
    applyUiComfort();
    setLang(s.lang || 'ru', function () {
      applyI18nToDom();
    });
    initNav(opts.active || '');
    registerServiceWorker();
    initModals();
    initParticles();
    document.body.classList.add('cl-ready');
    if (global.CLAnalytics) {
      global.CLAnalytics.track('page_view', { page: opts.active || 'unknown' });
    }
    try {
      var vc = parseInt(localStorage.getItem('cl_visit_count') || '0', 10) + 1;
      localStorage.setItem('cl_visit_count', String(vc));
    } catch (e) {}
    if (global.CLAchievements) global.CLAchievements.checkAll();
  }

  global.CLApp = {
    init: init,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    applyTheme: applyTheme,
    applyUiComfort: applyUiComfort,
    setLang: setLang,
    t: t,
    initNav: initNav,
    triggerConfetti: triggerConfetti,
    playPing: playPing,
    openModal: openModal,
    closeModal: closeModal,
    FALLBACK_I18N: FALLBACK_I18N
  };
})(typeof window !== 'undefined' ? window : this);
