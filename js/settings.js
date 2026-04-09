(function (global) {
  'use strict';

  function init() {
    var s = global.CLApp.loadSettings();
    var th = document.getElementById('set-theme');
    var lng = document.getElementById('set-lang');
    var nt = document.getElementById('set-notify');
    var snd = document.getElementById('set-sound');
    var part = document.getElementById('set-particles');
    var uisc = document.getElementById('set-ui-scale');
    if (th) th.value = s.theme || 'dark';
    if (lng) lng.value = s.lang || 'ru';
    if (nt) nt.checked = s.notifications !== false;
    if (snd) snd.checked = s.sound === true;
    if (part) part.checked = s.particles !== false;
    if (uisc) {
      var sc = s.uiScale;
      if (!sc) sc = s.uiCompact === true ? 'compact' : 'normal';
      uisc.value = sc;
    }

    function persist() {
      var uiScale = uisc && uisc.value ? uisc.value : 'normal';
      var next = {
        theme: th && th.value,
        lang: lng && lng.value,
        notifications: nt ? nt.checked : true,
        sound: snd ? snd.checked : false,
        particles: part ? part.checked : true,
        uiScale: uiScale,
        uiCompact: uiScale === 'compact',
        uiComfort: uiScale === 'comfort'
      };
      global.CLApp.saveSettings(next);
      global.CLApp.applyTheme(next.theme);
      global.CLApp.applyUiComfort();
      global.CLApp.setLang(next.lang);
      if (global.CLAchievements) {
        var st = global.CLAchievements.load();
        st.settingsSaved = true;
        global.CLAchievements.save(st);
        global.CLAchievements.checkAll();
      }
      if (global.CLNotify) global.CLNotify.toast('Сохранено', 'success');
    }

    document.getElementById('set-save') && document.getElementById('set-save').addEventListener('click', persist);

    document.getElementById('set-export-all') &&
      document.getElementById('set-export-all').addEventListener('click', function () {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
          keys.push(localStorage.key(i));
        }
        var obj = {};
        keys.forEach(function (k) {
          if (k.indexOf('cl_') === 0) obj[k] = localStorage.getItem(k);
        });
        global.CLExport.exportJSON(obj, 'congruence-lab-full.json');
      });

    document.getElementById('set-import') &&
      document.getElementById('set-import').addEventListener('click', function () {
        var ta = document.getElementById('set-import-text');
        if (!ta || !ta.value.trim()) return;
        try {
          var obj = JSON.parse(ta.value);
          for (var k in obj) {
            if (obj.hasOwnProperty(k) && k.indexOf('cl_') === 0) {
              localStorage.setItem(k, typeof obj[k] === 'string' ? obj[k] : JSON.stringify(obj[k]));
            }
          }
          if (global.CLNotify) global.CLNotify.toast('Импорт выполнен', 'success');
          global.location.reload();
        } catch (e) {
          if (global.CLNotify) global.CLNotify.toast('Ошибка JSON', 'warn');
        }
      });

    document.getElementById('set-clear') &&
      document.getElementById('set-clear').addEventListener('click', function () {
        if (!confirm('Удалить все локальные данные Congruence Lab?')) return;
        var toRemove = [];
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k.indexOf('cl_') === 0) toRemove.push(k);
        }
        toRemove.forEach(function (k) {
          localStorage.removeItem(k);
        });
        indexedDB.deleteDatabase(global.CL_CONSTANTS.DB_NAME);
        if (global.CLNotify) global.CLNotify.toast('Данные очищены', 'info');
        global.location.href = 'index.html';
      });
  }

  global.CLSettings = { init: init };
})(typeof window !== 'undefined' ? window : this);
