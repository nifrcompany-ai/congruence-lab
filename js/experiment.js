(function (global) {
  'use strict';

  var STORE = global.CL_CONSTANTS.STORES.EXPERIMENTS;

  function genPost(mask) {
    var p = (mask.prompts && mask.prompts[Math.floor(Math.random() * mask.prompts.length)]) || 'Пост';
    return '[' + mask.name + '] ' + p + ' #congruence_lab #маска';
  }

  function simulateReactions() {
    return {
      likes: Math.floor(20 + Math.random() * 180),
      comments: Math.floor(0 + Math.random() * 24),
      engagement: Math.floor(40 + Math.random() * 55)
    };
  }

  function saveExperiment(rec) {
    return global.CLDatabase.put(STORE, rec);
  }

  function init() {
    var masks = global.CLMasks || [];
    var sel = document.getElementById('cl-mask-select');
    var out = document.getElementById('cl-mask-output');
    var gen = document.getElementById('cl-mask-gen');
    var abA = document.getElementById('cl-ab-a');
    var abB = document.getElementById('cl-ab-b');
    var runAb = document.getElementById('cl-ab-run');
    var hist = document.getElementById('cl-exp-hist');

    if (sel) {
      sel.innerHTML = masks
        .map(function (m) {
          return '<option value="' + m.id + '">' + m.name + '</option>';
        })
        .join('');
    }

    gen &&
      gen.addEventListener('click', function () {
        var m = masks.find(function (x) {
          return x.id === sel.value;
        });
        if (!m) return;
        var text = genPost(m);
        out.textContent = text;
        var rec = {
          id: global.CLUtils.uid(),
          at: Date.now(),
          type: 'generate',
          maskId: m.id,
          text: text,
          reactions: simulateReactions()
        };
        saveExperiment(rec);
        if (global.CLAchievements) {
          global.CLAchievements.bump('maskCount', 1);
          global.CLAchievements.checkAll();
        }
        loadHist();
      });

    runAb &&
      runAb.addEventListener('click', function () {
        var ma = masks[abA && abA.value ? Number(abA.value) : 0];
        var mb = masks[abB && abB.value ? Number(abB.value) : 1];
        if (!ma || !mb) return;
        var ta = genPost(ma);
        var tb = genPost(mb);
        var ra = simulateReactions();
        var rb = simulateReactions();
        document.getElementById('cl-ab-result').innerHTML =
          '<div class="cl-grid cl-grid-2"><div class="cl-card"><h4>' +
          ma.name +
          '</h4><p>' +
          ta +
          '</p><p class="mono">Лайки ' +
          ra.likes +
          ', ER~' +
          ra.engagement +
          '%</p></div><div class="cl-card"><h4>' +
          mb.name +
          '</h4><p>' +
          tb +
          '</p><p class="mono">Лайки ' +
          rb.likes +
          ', ER~' +
          rb.engagement +
          '%</p></div></div>';
        var rec = {
          id: global.CLUtils.uid(),
          at: Date.now(),
          type: 'ab',
          a: ma.id,
          b: mb.id,
          ra: ra,
          rb: rb
        };
        saveExperiment(rec);
        try {
          var ch = JSON.parse(localStorage.getItem(global.CL_CONSTANTS.STORAGE_KEYS.CHALLENGES) || '{}');
          ch.abTests = (ch.abTests || 0) + 1;
          localStorage.setItem(global.CL_CONSTANTS.STORAGE_KEYS.CHALLENGES, JSON.stringify(ch));
        } catch (e) {}
        if (global.CLAchievements) global.CLAchievements.checkAll();
        loadHist();
      });

    function loadHist() {
      global.CLDatabase.getAll(STORE).then(function (rows) {
        rows.sort(function (a, b) {
          return b.at - a.at;
        });
        if (hist) {
          hist.innerHTML = rows
            .slice(0, 12)
            .map(function (r) {
              return '<li class="mono">' + new Date(r.at).toLocaleString() + ' — ' + r.type + '</li>';
            })
            .join('');
        }
      });
    }
    loadHist();

    if (abA && masks.length) {
      abA.innerHTML = masks.map(function (m, i) {
        return '<option value="' + i + '">' + m.name + '</option>';
      }).join('');
      if (abB) abB.innerHTML = abA.innerHTML;
    }
  }

  global.CLExperiment = { init: init };
})(typeof window !== 'undefined' ? window : this);
