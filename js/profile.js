(function (global) {
  'use strict';

  function init() {
    if (global.CLAchievements) {
      global.CLAchievements.checkAll();
      var lvl0 = document.getElementById('cl-prof-level');
      if (lvl0) {
        lvl0.textContent = String(global.CLAchievements.levelFromActivity(global.CLAchievements.load()));
      }
    }
    var histEl = document.getElementById('cl-prof-history');
    global.CLDatabase.getAll(global.CL_CONSTANTS.STORES.TEST_HISTORY).then(function (rows) {
      rows.sort(function (a, b) {
        return b.at - a.at;
      });
      if (histEl) {
        histEl.innerHTML = rows
          .slice(0, 15)
          .map(function (r) {
            return (
              '<li>' +
              new Date(r.at).toLocaleString() +
              ' — ' +
              r.type +
              ', DSCI ' +
              r.dsci +
              '</li>'
            );
          })
          .join('');
      }
      var ctx = document.getElementById('cl-prof-chart');
      if (ctx && global.Chart && rows.length) {
        new global.Chart(ctx, {
          type: 'line',
          data: {
            labels: rows
              .slice()
              .reverse()
              .map(function (r) {
                return new Date(r.at).toLocaleDateString();
              }),
            datasets: [
              {
                label: 'DSCI',
                data: rows
                  .slice()
                  .reverse()
                  .map(function (r) {
                    return r.dsci;
                  }),
                borderColor: '#4361ee'
              }
            ]
          },
          options: { scales: { y: { min: 0, max: 100 } } }
        });
      }
      var lvlEl = document.getElementById('cl-prof-level');
      if (lvlEl && global.CLAchievements) {
        lvlEl.textContent = String(global.CLAchievements.levelFromActivity(global.CLAchievements.load()));
      }
    });

    document.getElementById('cl-prof-export') &&
      document.getElementById('cl-prof-export').addEventListener('click', function () {
        var pack = {
          settings: JSON.parse(localStorage.getItem(global.CL_CONSTANTS.STORAGE_KEYS.SETTINGS) || '{}'),
          short: localStorage.getItem(global.CL_CONSTANTS.STORAGE_KEYS.SHORT_STATE),
          long: localStorage.getItem(global.CL_CONSTANTS.STORAGE_KEYS.LONG_STATE),
          achievements: localStorage.getItem(global.CL_CONSTANTS.STORAGE_KEYS.ACHIEVEMENTS)
        };
        global.CLExport.exportJSON(pack, 'profile-export.json', { anonymize: true });
        if (global.CLAchievements) {
          var st = global.CLAchievements.load();
          st.exported = true;
          global.CLAchievements.save(st);
          global.CLAchievements.checkAll();
        }
      });

  }

  global.CLProfile = { init: init };
})(typeof window !== 'undefined' ? window : this);
