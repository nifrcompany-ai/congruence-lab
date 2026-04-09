(function (global) {
  'use strict';

  var STORE = global.CL_CONSTANTS.STORES.JOURNAL;
  var DAYS = global.CL_CONSTANTS.JOURNAL_HEATMAP_DAYS;

  function cacheList(list) {
    try {
      localStorage.setItem('cl_journal_cache', JSON.stringify(list.slice(-60)));
    } catch (e) {}
  }

  function loadAll(cb) {
    global.CLDatabase.getAll(STORE).then(function (rows) {
      rows.sort(function (a, b) {
        return b.at - a.at;
      });
      cacheList(rows);
      cb(rows);
    }).catch(function () {
      cb([]);
    });
  }

  function saveEntry(entry, cb) {
    global.CLDatabase.put(STORE, entry).then(function () {
      loadAll(cb || function () {});
    }).catch(function () {});
  }

  function renderHeatmap(entries) {
    var el = document.getElementById('cl-journal-heat');
    if (!el) return;
    var byDay = {};
    for (var i = 0; i < entries.length; i++) {
      var d = new Date(entries[i].at).toDateString();
      byDay[d] = Math.max(byDay[d] || 0, entries[i].authenticity || 0);
    }
    var cells = '';
    for (var j = DAYS - 1; j >= 0; j--) {
      var dt = new Date();
      dt.setDate(dt.getDate() - j);
      var key = dt.toDateString();
      var v = byDay[key] || 0;
      var cls = 'cl-heat-cell';
      if (v >= 8) cls += ' v4';
      else if (v >= 6) cls += ' v3';
      else if (v >= 4) cls += ' v2';
      else if (v >= 2) cls += ' v1';
      cells += '<div class="' + cls + '" title="' + key + '"></div>';
    }
    el.innerHTML = cells;
  }

  function renderChart(entries) {
    var ctx = document.getElementById('cl-journal-chart');
    if (!ctx || !global.Chart) return;
    var pts = entries
      .slice()
      .reverse()
      .slice(-30)
      .map(function (e) {
        return e.dsci != null ? e.dsci : e.authenticity * 10;
      });
    if (pts.length < 2) pts = [50, 52, 48, 55, 53];
    new global.Chart(ctx, {
      type: 'line',
      data: {
        labels: pts.map(function (_, i) {
          return String(i + 1);
        }),
        datasets: [
          {
            label: 'Аутентичность / DSCI (условно)',
            data: pts,
            borderColor: '#4361ee',
            tension: 0.3
          }
        ]
      },
      options: { scales: { y: { min: 0, max: 100 } } }
    });
  }

  function init() {
    var form = document.getElementById('cl-journal-form');
    loadAll(function (entries) {
      renderHeatmap(entries);
      renderChart(entries);
      var corr = document.getElementById('cl-journal-corr');
      if (corr) {
        corr.textContent =
          'Корреляция (эвристика): чем выше отметка аутентичности в день активных постов, тем ниже самокритика в комментарии — отслеживайте тренд 30 дней.';
      }
    });

    form &&
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var auth = Number(document.getElementById('j-auth') && document.getElementById('j-auth').value);
        var emo = document.getElementById('j-emo') && document.getElementById('j-emo').value;
        var note = document.getElementById('j-note') && document.getElementById('j-note').value;
        var entry = {
          id: global.CLUtils.uid(),
          at: Date.now(),
          authenticity: auth,
          emotion: emo,
          note: note,
          postsHeavy: document.getElementById('j-posts') && document.getElementById('j-posts').checked,
          dsci: auth * 10
        };
        saveEntry(entry, function (list) {
          renderHeatmap(list);
          if (global.CLNotify) global.CLNotify.toast('Запись сохранена локально', 'success');
          if (global.CLAchievements) global.CLAchievements.checkAll();
          form.reset();
        });
      });

    document.getElementById('cl-journal-export-json') &&
      document.getElementById('cl-journal-export-json').addEventListener('click', function () {
        loadAll(function (rows) {
          global.CLExport.exportJSON({ journal: rows }, 'journal.json', { anonymize: true });
          if (global.CLAchievements) {
            var st = global.CLAchievements.load();
            st.exported = true;
            global.CLAchievements.save(st);
            global.CLAchievements.checkAll();
          }
        });
      });
    document.getElementById('cl-journal-export-csv') &&
      document.getElementById('cl-journal-export-csv').addEventListener('click', function () {
        loadAll(function (rows) {
          global.CLExport.exportCSV(
            rows.map(function (r) {
              return {
                date: new Date(r.at).toISOString(),
                authenticity: r.authenticity,
                emotion: r.emotion,
                note: r.note
              };
            }),
            'journal.csv',
            { anonymize: true }
          );
        });
      });
    document.getElementById('cl-journal-export-png') &&
      document.getElementById('cl-journal-export-png').addEventListener('click', function () {
        var el = document.getElementById('cl-journal-heat');
        if (!el || typeof html2canvas === 'undefined') return;
        html2canvas(el).then(function (canvas) {
          var a = document.createElement('a');
          a.href = canvas.toDataURL('image/png');
          a.download = 'journal-heatmap.png';
          a.click();
        });
      });
    document.getElementById('cl-journal-export-pdf') &&
      document.getElementById('cl-journal-export-pdf').addEventListener('click', function () {
        loadAll(function (rows) {
          var lines = ['Отчёт дневника (анонимизированный)', 'Записей: ' + rows.length];
          rows.slice(0, 40).forEach(function (r) {
            lines.push(new Date(r.at).toLocaleString() + ' | ' + r.authenticity + ' | ' + r.emotion);
          });
          global.CLExport.exportPDF('Congruence Lab — дневник', lines);
        });
      });
  }

  global.CLJournal = { init: init, loadAll: loadAll };
})(typeof window !== 'undefined' ? window : this);
