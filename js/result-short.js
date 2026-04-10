(function (global) {
  'use strict';

  var SK = global.CL_CONSTANTS.STORAGE_KEYS;
  var U = global.CLUtils;
  var Q = global.CLQuestionsShort;

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

  function init() {
    var raw = localStorage.getItem(SK.SHORT_STATE);
    if (!raw) {
      global.location.href = 'test-short.html';
      return;
    }
    var state = JSON.parse(raw);
    if (!state || state.index < Q.length) {
      global.location.href = 'test-short.html';
      return;
    }
    var answers = buildAnswers(state);
    if (!answers) {
      global.location.href = 'test-short.html';
      return;
    }
    var profile = U.calculateProfile(answers);
    var dsci = U.calculateDSCI(profile);
    var arch = global.CLDetermineArchetype(profile);

    document.getElementById('cl-rs-dsci').textContent = String(dsci);
    document.getElementById('cl-rs-arch').textContent = arch.archetype.name;

    var ctx = document.getElementById('cl-chart-short');
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
              backgroundColor: 'rgba(72,149,239,0.2)'
            },
            {
              label: 'Digital',
              data: profile.digitalSelf,
              borderColor: '#f72585',
              backgroundColor: 'rgba(247,37,133,0.15)'
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

    var rec = document.getElementById('cl-rs-rec');
    if (rec) {
      rec.innerHTML =
        '<p>' +
        arch.archetype.tips.join('</p><p>') +
        '</p><p class="mono">DSCI: ' +
        dsci +
        '</p>';
    }

    if (global.CLDatabase && global.CLDatabase.add) {
      global.CLDatabase.add(global.CL_CONSTANTS.STORES.TEST_HISTORY, {
        id: U.uid(),
        type: 'short',
        at: Date.now(),
        profile: profile,
        dsci: dsci,
        archetypeId: arch.archetype.id
      }).catch(function () {});
    }
    if (global.CLAchievements) global.CLAchievements.checkAll();

    var retryBtn = document.getElementById('cl-rs-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        if (confirm('Начать быстрый тест заново?')) {
          localStorage.removeItem(SK.SHORT_STATE);
          localStorage.removeItem(SK.SHORT_PROFILE);
          global.location.href = 'test-short.html';
        }
      });
    }
  }

  global.CLResultShort = { init: init };
})(typeof window !== 'undefined' ? window : this);
