/**
 * Достижения и уровни 1–10 (локально).
 */
(function (global) {
  'use strict';

  var SK = global.CL_CONSTANTS.STORAGE_KEYS;

  var DEFS = [
    { id: 'first_step', cat: 'research', title: 'Первый шаг', desc: 'Завершите быстрый тест.' },
    { id: 'deep', cat: 'research', title: 'Глубокий анализ', desc: 'Завершите полный тест.' },
    { id: 'know_self', cat: 'research', title: 'Самопознание', desc: 'Откройте страницу архетипов в библиотеке.' },
    { id: 'day1', cat: 'transform', title: 'День 1', desc: 'Отметьте первый день челленджа.' },
    { id: 'week', cat: 'transform', title: 'Неделя осознанности', desc: '7 отметок в челлендже.' },
    { id: 'month30', cat: 'transform', title: '30 дней', desc: '20+ отметок в челлендже.' },
    { id: 'mask_master', cat: 'social', title: 'Мастер масок', desc: 'Сгенерируйте посты для 6 масок.' },
    { id: 'opinion', cat: 'social', title: 'Лидер мнений', desc: 'Проведите A/B эксперимент масок.' },
    { id: 'coach1', cat: 'ai', title: 'Диалог с AI', desc: '10 сообщений в коуче (DEMO).' },
    { id: 'coach_sage', cat: 'ai', title: 'Мудрец', desc: '50 сообщений в коуче (DEMO).' },
    { id: 'journal7', cat: 'research', title: 'Неделя дневника', desc: '7 записей дневника.' },
    { id: 'journal30', cat: 'research', title: 'Месяц дневника', desc: '20 записей дневника.' },
    { id: 'library', cat: 'research', title: 'Читатель', desc: 'Откройте 5 материалов библиотеки.' },
    { id: 'team', cat: 'social', title: 'В команде', desc: 'Создайте или вступите в группу.' },
    { id: 'export', cat: 'research', title: 'Архивист', desc: 'Экспортируйте данные (JSON/CSV/PDF).' },
    { id: 'settings', cat: 'research', title: 'Настройщик', desc: 'Сохраните настройки темы/языка.' },
    { id: 'meditation', cat: 'transform', title: 'Пауза', desc: 'Запустите таймер медитации.' },
    { id: 'exercise', cat: 'transform', title: 'Практик', desc: 'Завершите drag-drop упражнение.' },
    { id: 'privacy', cat: 'research', title: 'Приватность', desc: 'Прочитайте модалку о данных на главной.' },
    { id: 'pwa', cat: 'research', title: 'На экран', desc: 'Откройте приложение дважды (сессии).' },
    { id: 'dsci_high', cat: 'research', title: 'Высокий DSCI', desc: 'DSCI ≥ 75 в любом тесте.' },
    { id: 'congruence', cat: 'research', title: 'Конгруэнтность+', desc: 'Полный тест без флагов согласованности.' }
  ];

  function load() {
    try {
      var raw = localStorage.getItem(SK.ACHIEVEMENTS);
      return raw ? JSON.parse(raw) : { unlocked: {}, coachMsgs: 0, maskCount: 0, libraryOpens: 0, sessions: 0 };
    } catch (e) {
      return { unlocked: {}, coachMsgs: 0, maskCount: 0, libraryOpens: 0, sessions: 0 };
    }
  }

  function save(st) {
    localStorage.setItem(SK.ACHIEVEMENTS, JSON.stringify(st));
  }

  function titleFor(id) {
    for (var i = 0; i < DEFS.length; i++) {
      if (DEFS[i].id === id) return DEFS[i].title;
    }
    return id;
  }

  function unlock(id) {
    var st = load();
    if (st.unlocked[id]) return false;
    st.unlocked[id] = Date.now();
    save(st);
    if (global.CLNotify) global.CLNotify.toast('Достижение: «' + titleFor(id) + '»', 'success');
    if (global.CLApp) global.CLApp.triggerConfetti();
    return true;
  }

  function levelFromActivity(st) {
    var n = Object.keys(st.unlocked || {}).length;
    return global.CLUtils.clamp(1 + Math.floor(n / 2), 1, 10);
  }

  function checkAll() {
    var shortRaw = localStorage.getItem(SK.SHORT_STATE);
    var longRaw = localStorage.getItem(SK.LONG_STATE);
    var Qshort = global.CLQuestionsShort;
    var Qlong = global.CLQuestionsLong;
    if (shortRaw && Qshort && Qshort.length) {
      var sh = JSON.parse(shortRaw);
      if (sh.index >= Qshort.length) unlock('first_step');
    }
    if (longRaw && Qlong && Qlong.length) {
      var lo = JSON.parse(longRaw);
      if (lo.index >= Qlong.length) {
        unlock('deep');
        var byId = lo.answers || {};
        var cons = global.CLLongConsistency && global.CLLongConsistency(byId);
        if (cons && cons.ok) unlock('congruence');
      }
    }
    try {
      var ch = JSON.parse(localStorage.getItem(SK.CHALLENGES) || '{}');
      var done = (ch.doneIds && ch.doneIds.length) || 0;
      if (done >= 1) unlock('day1');
      if (done >= 7) unlock('week');
      if (done >= 20) unlock('month30');
      if (ch.abTests >= 1) unlock('opinion');
    } catch (e) {}

    /* Всегда читаем актуальное состояние — нельзя сохранять старый снимок в конце (он затирал бы unlock). */
    var st = load();
    if (st.coachMsgs >= 10) unlock('coach1');
    if (st.coachMsgs >= 50) unlock('coach_sage');
    if (st.maskCount >= 6) unlock('mask_master');
    if (st.libraryOpens >= 5) unlock('library');
    try {
      var tm = JSON.parse(localStorage.getItem(SK.TEAM_LOCAL) || '{}');
      if (tm.code) unlock('team');
    } catch (e) {}
    if (st.exported) unlock('export');
    if (st.settingsSaved) unlock('settings');
    if (st.meditation) unlock('meditation');
    if (st.exercise) unlock('exercise');
    if (st.privacyModal) unlock('privacy');
    var visits = parseInt(localStorage.getItem('cl_visit_count') || '0', 10);
    if (visits >= 2) unlock('pwa');

    try {
      var hist = JSON.parse(localStorage.getItem('cl_journal_cache') || '[]');
      if (hist.length >= 7) unlock('journal7');
      if (hist.length >= 20) unlock('journal30');
    } catch (e) {}

    if (shortRaw || longRaw) {
      try {
        var answers = [];
        var Qs = global.CLQuestionsShort;
        var s = JSON.parse(shortRaw || '{}');
        if (s.answers && Qs && Qs.length) {
          for (var i = 0; i < Qs.length; i++) {
            var q = Qs[i];
            if (s.answers[q.id] != null) answers.push({ value: s.answers[q.id], question: q });
          }
          if (answers.length === Qs.length) {
            var p = global.CLUtils.calculateProfile(answers);
            if (global.CLUtils.calculateDSCI(p) >= 75) unlock('dsci_high');
          }
        }
      } catch (e) {}
    }
  }

  function renderList(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var st = load();
    var lvl = levelFromActivity(st);
    document.getElementById('cl-ach-level') && (document.getElementById('cl-ach-level').textContent = String(lvl));
    el.innerHTML = DEFS.map(function (d) {
      var on = !!st.unlocked[d.id];
      return (
        '<div class="cl-card ' +
        (on ? 'anim-fadeInUp' : '') +
        '" style="opacity:' +
        (on ? 1 : 0.45) +
        '">' +
        '<span class="cl-badge ' +
        (on ? 'unlocked' : '') +
        '"><i class="fas fa-trophy"></i> ' +
        d.title +
        '</span>' +
        '<p>' +
        d.desc +
        '</p><small class="mono">' +
        d.cat +
        '</small></div>'
      );
    }).join('');
  }

  function bump(key, n) {
    var st = load();
    st[key] = (st[key] || 0) + (n || 1);
    save(st);
    checkAll();
  }

  global.CLAchievements = {
    DEFS: DEFS,
    load: load,
    save: save,
    unlock: unlock,
    titleFor: titleFor,
    checkAll: checkAll,
    renderList: renderList,
    bump: bump,
    levelFromActivity: levelFromActivity
  };
})(typeof window !== 'undefined' ? window : this);
