(function (global) {
  'use strict';

  var SK = global.CL_CONSTANTS.STORAGE_KEYS;
  var U = global.CLUtils;
  var Q = global.CLQuestionsLong;

  function buildAnswers(state) {
    var list = [];
    for (var i = 0; i < Q.length; i++) {
      var q = Q[i];
      var v = state.answers[q.id];
      if (v == null) return null;
      list.push({ questionId: q.id, value: v, question: q });
    }
    return list;
  }

  function plan7(topMismatch) {
    var days = [];
    for (var d = 1; d <= 7; d++) {
      var ax = topMismatch[(d - 1) % topMismatch.length];
      days.push({
        day: d,
        focus: ax.axis.ru,
        action:
          'День ' +
          d +
          ': микропрактика по оси «' +
          ax.axis.ru +
          '» — заметьте один момент, где цифровой образ расходится с переживанием, и опишите его в дневнике.'
      });
    }
    return days;
  }

  function animateDsci(target) {
    var el = document.getElementById('cl-rl-dsci');
    if (!el) return;
    var cur = 0;
    var step = Math.max(1, Math.round(target / 40));
    var id = setInterval(function () {
      cur += step;
      if (cur >= target) {
        cur = target;
        clearInterval(id);
      }
      el.textContent = String(cur);
    }, 28);
  }

  function init() {
    var raw = localStorage.getItem(SK.LONG_STATE);
    if (!raw) {
      global.location.href = 'test-long.html';
      return;
    }
    var state = JSON.parse(raw);
    if (!state || state.index < Q.length) {
      global.location.href = 'test-long.html';
      return;
    }
    var answers = buildAnswers(state);
    if (!answers) {
      global.location.href = 'test-long.html';
      return;
    }
    var byId = {};
    for (var i = 0; i < answers.length; i++) {
      byId[answers[i].questionId] = answers[i].value;
    }
    var cons = global.CLLongConsistency ? global.CLLongConsistency(byId) : { ok: true, score: 100 };

    var profile = U.calculateProfile(answers);
    var dsci = U.calculateDSCI(profile);
    var arch = global.CLDetermineArchetype(profile);
    var top = global.CLTopMismatch(profile);

    animateDsci(Math.round(dsci));
    document.getElementById('cl-rl-arch').textContent = arch.archetype.name;
    document.getElementById('cl-rl-arch-desc').textContent = arch.archetype.description;
    document.getElementById('cl-rl-cons').textContent =
      'Согласованность ответов: ' +
      (cons.ok ? 'высокая' : 'есть расхождения') +
      ' (' +
      (cons.score != null ? cons.score : '—') +
      '/100)';

    var mm = document.getElementById('cl-rl-mismatch');
    if (mm) {
      mm.innerHTML = top
        .map(function (x) {
          return (
            '<li><strong>' +
            x.axis.ru +
            '</strong>: |Real−Digital|=' +
            x.gapRealDigital.toFixed(0) +
            ', |Ideal−Digital|=' +
            x.gapIdealDigital.toFixed(0) +
            '</li>'
          );
        })
        .join('');
    }

    var pl = document.getElementById('cl-rl-plan');
    if (pl) {
      var days = plan7(top);
      pl.innerHTML = days
        .map(function (d) {
          return '<li><strong>' + d.focus + '</strong> — ' + d.action + '</li>';
        })
        .join('');
    }

    var ctx = document.getElementById('cl-chart-long');
    if (ctx && global.Chart) {
      var axes = global.CL_CONSTANTS.AXES.map(function (a) {
        return a.ru;
      });
      new global.Chart(ctx, {
        type: 'radar',
        data: {
          labels: axes,
          datasets: [
            {
              label: 'Real',
              data: profile.realSelf,
              borderColor: '#4895ef',
              backgroundColor: 'rgba(72,149,239,0.15)'
            },
            {
              label: 'Ideal',
              data: profile.idealSelf,
              borderColor: '#06d6a0',
              backgroundColor: 'rgba(6,214,160,0.12)'
            },
            {
              label: 'Digital',
              data: profile.digitalSelf,
              borderColor: '#f72585',
              backgroundColor: 'rgba(247,37,133,0.12)'
            }
          ]
        },
        options: {
          scales: {
            r: { min: 0, max: 100 }
          }
        }
      });
    }

    if (global.CLDatabase && global.CLDatabase.add) {
      global.CLDatabase.add(global.CL_CONSTANTS.STORES.TEST_HISTORY, {
        id: U.uid(),
        type: 'long',
        at: Date.now(),
        profile: profile,
        dsci: dsci,
        archetypeId: arch.archetype.id,
        consistency: cons
      }).catch(function () {});
    }
    if (global.CLAchievements) global.CLAchievements.checkAll();
  }

  global.CLResultLong = { init: init };
})(typeof window !== 'undefined' ? window : this);
