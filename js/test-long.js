/**
 * Полный тест: cl_long_state + контрольные пары
 */
(function (global) {
  'use strict';

  var SK = global.CL_CONSTANTS.STORAGE_KEYS;
  var Q = global.CLQuestionsLong;

  function loadState() {
    try {
      var raw = localStorage.getItem(SK.LONG_STATE);
      return raw
        ? JSON.parse(raw)
        : { index: 0, answers: {} };
    } catch (e) {
      return { index: 0, answers: {} };
    }
  }

  function saveState(s) {
    localStorage.setItem(SK.LONG_STATE, JSON.stringify(s));
  }

  function render() {
    var s = loadState();
    var elQ = document.getElementById('cl-lq-text');
    var elProg = document.getElementById('cl-lq-progress');
    if (!Q || !Q.length || !elQ) return;
    if (s.index >= Q.length) {
      global.location.href = 'result-long.html';
      return;
    }
    var q = Q[s.index];
    elQ.textContent = q.text + (q.isControl ? ' (контроль согласованности)' : '');
    if (elProg) elProg.textContent = s.index + 1 + ' / ' + Q.length;
    var bar = document.querySelector('#cl-long-progress > i');
    if (bar) bar.style.width = ((s.index + 1) / Q.length) * 100 + '%';
    var form = document.getElementById('cl-long-form');
    if (form) {
      form.querySelectorAll('input[name="v"]').forEach(function (inp) {
        inp.checked = String(s.answers[q.id]) === inp.value;
      });
      var toFocus = form.querySelector('input[name="v"]:not(:checked)') || form.querySelector('input[name="v"]');
      if (toFocus) {
        setTimeout(function () {
          toFocus.focus();
        }, 50);
      }
    }
  }

  function next(value) {
    var s = loadState();
    var q = Q[s.index];
    if (!q) return;
    s.answers[q.id] = Number(value);
    s.index++;
    saveState(s);
    if (global.CLAnalytics) global.CLAnalytics.track('long_test_answer', { id: q.id });
    render();
  }

  function init() {
    var form = document.getElementById('cl-long-form');
    if (form) {
      form.addEventListener('change', function () {
        var c = form.querySelector('input[name="v"]:checked');
        if (c) next(c.value);
      });
    }
    document.getElementById('cl-long-reset') &&
      document.getElementById('cl-long-reset').addEventListener('click', function () {
        if (confirm('Сбросить полный тест?')) {
          localStorage.removeItem(SK.LONG_STATE);
          saveState({ index: 0, answers: {} });
          render();
        }
      });
    render();
  }

  global.CLTestLong = { init: init, loadState: loadState };
})(typeof window !== 'undefined' ? window : this);
