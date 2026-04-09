(function (global) {
  'use strict';

  function renderGroup(g) {
    var box = document.getElementById('cl-team-view');
    if (!box || !g) return;
    var agg = global.CLSocial.aggregateRadar(g);
    box.innerHTML =
      '<p class="mono">Код: ' +
      g.code +
      ' · участников: ' +
      g.members.length +
      '</p><p>Средний DSCI (анонимно): ' +
      (agg ? agg.avgDSCI : '—') +
      '</p>';
    var ctx = document.getElementById('cl-team-chart');
    if (ctx && global.Chart && agg) {
      new global.Chart(ctx, {
        type: 'radar',
        data: {
          labels: global.CL_CONSTANTS.AXES.map(function (a) {
            return a.ru;
          }),
          datasets: [
            { label: 'Среднее Real', data: agg.real, borderColor: '#4895ef' },
            { label: 'Среднее Ideal', data: agg.ideal, borderColor: '#06d6a0' },
            { label: 'Среднее Digital', data: agg.digital, borderColor: '#f72585' }
          ]
        },
        options: { scales: { r: { min: 0, max: 100 } } }
      });
    }
  }

  function currentProfileFromStorage() {
    var def = {
      realSelf: [60, 60, 60, 60, 60, 60],
      idealSelf: [70, 70, 70, 70, 70, 70],
      digitalSelf: [65, 65, 65, 65, 65, 65]
    };
    try {
      var raw = localStorage.getItem(global.CL_CONSTANTS.STORAGE_KEYS.LONG_STATE);
      if (!raw) return def;
      var st = JSON.parse(raw);
      if (st.index < (global.CLQuestionsLong && global.CLQuestionsLong.length)) return def;
      var answers = [];
      for (var i = 0; i < global.CLQuestionsLong.length; i++) {
        var q = global.CLQuestionsLong[i];
        if (st.answers[q.id] == null) return def;
        answers.push({ questionId: q.id, value: st.answers[q.id], question: q });
      }
      return global.CLUtils.calculateProfile(answers);
    } catch (e) {
      return def;
    }
  }

  function init() {
    document.getElementById('cl-team-create') &&
      document.getElementById('cl-team-create').addEventListener('click', function () {
        var g = global.CLSocial.createGroup('Создатель');
        global.CLSocial.joinGroup(g.code, currentProfileFromStorage(), 'Вы');
        if (global.CLNotify) global.CLNotify.toast('Группа ' + g.code, 'success');
        renderGroup(global.CLSocial.getGroup(g.code));
        if (global.CLAchievements) global.CLAchievements.checkAll();
      });

    document.getElementById('cl-team-join') &&
      document.getElementById('cl-team-join').addEventListener('click', function () {
        var code = (document.getElementById('cl-team-code') && document.getElementById('cl-team-code').value) || '';
        code = code.trim().toUpperCase();
        var res = global.CLSocial.joinGroup(code, currentProfileFromStorage(), 'Участник');
        if (!res.ok) {
          if (global.CLNotify) global.CLNotify.toast(res.error, 'warn');
          return;
        }
        renderGroup(res.group);
        if (global.CLAchievements) global.CLAchievements.checkAll();
      });

    document.getElementById('cl-team-demo-peers') &&
      document.getElementById('cl-team-demo-peers').addEventListener('click', function () {
        var code = (document.getElementById('cl-team-code') && document.getElementById('cl-team-code').value) || '';
        code = code.trim().toUpperCase();
        if (!code) {
          if (global.CLNotify) global.CLNotify.toast('Введите код группы', 'warn');
          return;
        }
        global.CLSocial.addDemoPeers(code, 3);
        renderGroup(global.CLSocial.getGroup(code));
      });

    document.getElementById('cl-team-export') &&
      document.getElementById('cl-team-export').addEventListener('click', function () {
        var raw = localStorage.getItem(global.CL_CONSTANTS.STORAGE_KEYS.TEAM_LOCAL);
        if (!raw) return;
        var tm = JSON.parse(raw);
        if (tm.role !== 'creator') {
          if (global.CLNotify) global.CLNotify.toast('Только создатель может экспортировать', 'warn');
          return;
        }
        var data = global.CLSocial.exportGroupAnalytics(tm.code);
        global.CLExport.exportJSON(data, 'team-analytics.json');
      });

    try {
      var tm = JSON.parse(localStorage.getItem(global.CL_CONSTANTS.STORAGE_KEYS.TEAM_LOCAL) || '{}');
      if (tm.code) renderGroup(global.CLSocial.getGroup(tm.code));
    } catch (e) {}
  }

  global.CLTeam = { init: init };
})(typeof window !== 'undefined' ? window : this);
