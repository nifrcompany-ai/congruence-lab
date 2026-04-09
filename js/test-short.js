/**
 * Быстрый тест: состояние localStorage cl_short_state
 */
(function (global) {
  'use strict';

  var SK = global.CL_CONSTANTS.STORAGE_KEYS;
  var Q = global.CLQuestionsShort;

  function loadState() {
    try {
      var raw = localStorage.getItem(SK.SHORT_STATE);
      return raw
        ? JSON.parse(raw)
        : { index: 0, answers: {} };
    } catch (e) {
      return { index: 0, answers: {} };
    }
  }

  function saveState(s) {
    localStorage.setItem(SK.SHORT_STATE, JSON.stringify(s));
  }

  function render() {
    var s = loadState();
    var elQ = document.getElementById('cl-q-text');
    var elProg = document.getElementById('cl-q-progress');
    var form = document.getElementById('cl-short-form');
    if (!Q || !Q.length || !elQ) return;
    if (s.index >= Q.length) {
      global.location.href = 'result-short.html';
      return;
    }
    var q = Q[s.index];
    elQ.textContent = q.text;
    if (elProg) {
      elProg.textContent = s.index + 1 + ' / ' + Q.length;
      var bar = document.querySelector('#cl-short-progress > i');
      if (bar) bar.style.width = ((s.index + 1) / Q.length) * 100 + '%';
    }
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
    if (global.CLAnalytics) global.CLAnalytics.track('short_test_answer', { id: q.id });
    render();
  }

  function init() {
    var form = document.getElementById('cl-short-form');
    if (form) {
      form.addEventListener('change', function () {
        var c = form.querySelector('input[name="v"]:checked');
        if (c) next(c.value);
      });
    }
    document.getElementById('cl-short-reset') &&
      document.getElementById('cl-short-reset').addEventListener('click', function () {
        if (confirm('Начать тест заново?')) {
          localStorage.removeItem(SK.SHORT_STATE);
          saveState({ index: 0, answers: {} });
          render();
        }
      });
    render();
  }

  global.CLTestShort = { init: init, loadState: loadState, saveState: saveState };
})(typeof window !== 'undefined' ? window : this);
