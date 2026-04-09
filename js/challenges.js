(function (global) {
  'use strict';

  var SK = global.CL_CONSTANTS.STORAGE_KEYS;

  function load() {
    try {
      return JSON.parse(localStorage.getItem(SK.CHALLENGES) || '{}');
    } catch (e) {
      return {};
    }
  }

  function save(obj) {
    localStorage.setItem(SK.CHALLENGES, JSON.stringify(obj));
  }

  function init() {
    var data = global.CLChallengesData;
    if (!data) return;
    var st = load();
    st.doneIds = st.doneIds || [];
    var prog = document.getElementById('cl-ch-progress');
    var listEl = document.getElementById('cl-ch-list');

    function render() {
      var total = data.programs[1] ? data.programs[1].taskIds.length : 30;
      var done = st.doneIds.length;
      if (prog) {
        var i = prog.querySelector('i');
        if (i) i.style.width = Math.min(100, (done / total) * 100) + '%';
      }
      if (listEl) {
        listEl.innerHTML = data.tasks
          .slice(0, 35)
          .map(function (t) {
            var on = st.doneIds.indexOf(t.id) >= 0;
            return (
              '<label class="cl-card" style="display:block;margin-bottom:0.5rem;cursor:pointer">' +
              '<input type="checkbox" data-task="' +
              t.id +
              '" ' +
              (on ? 'checked' : '') +
              '> <strong>' +
              t.title +
              '</strong><br><small>' +
              t.description +
              '</small></label>'
            );
          })
          .join('');
        listEl.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
          cb.addEventListener('change', function () {
            var id = cb.getAttribute('data-task');
            var idx = st.doneIds.indexOf(id);
            if (cb.checked && idx < 0) st.doneIds.push(id);
            if (!cb.checked && idx >= 0) st.doneIds.splice(idx, 1);
            save(st);
            render();
            if (global.CLAchievements) global.CLAchievements.checkAll();
          });
        });
      }
    }

    render();

    document.getElementById('cl-ch-notify') &&
      document.getElementById('cl-ch-notify').addEventListener('click', function () {
        if (!('Notification' in global)) {
          if (global.CLNotify) global.CLNotify.toast('Браузер не поддерживает уведомления', 'warn');
          return;
        }
        Notification.requestPermission().then(function (p) {
          if (global.CLNotify) global.CLNotify.toast('Статус: ' + p, 'info');
        });
      });

    if (global.CLNotify) global.CLNotify.maybeRemindChallenges();
  }

  global.CLChallenges = { init: init, load: load, save: save };
})(typeof window !== 'undefined' ? window : this);
