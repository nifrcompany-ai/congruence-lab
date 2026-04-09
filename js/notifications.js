/**
 * Toast и напоминания (локальные, без push-сервера).
 */
(function (global) {
  'use strict';

  function getSettings() {
    try {
      var raw = localStorage.getItem(global.CL_CONSTANTS.STORAGE_KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function toast(message, type) {
    var container = document.getElementById('cl-toast-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cl-toast-root';
      container.className = 'cl-toast-root';
      document.body.appendChild(container);
    }
    var el = document.createElement('div');
    el.className = 'cl-toast cl-toast--' + (type || 'info');
    el.setAttribute('role', 'status');
    el.textContent = message;
    container.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add('cl-toast--show');
    });
    setTimeout(function () {
      el.classList.remove('cl-toast--show');
      setTimeout(function () {
        el.remove();
      }, 300);
    }, 3800);
  }

  function maybeRemindChallenges() {
    var s = getSettings();
    if (s.notifications === false) return;
    if (!('Notification' in global) || Notification.permission !== 'granted') return;
    try {
      var last = localStorage.getItem('cl_last_challenge_reminder');
      var day = new Date().toDateString();
      if (last === day) return;
      new Notification('Congruence Lab', {
        body: 'Не забудьте отметить прогресс в челленджах.'
      });
      localStorage.setItem('cl_last_challenge_reminder', day);
    } catch (e) {}
  }

  global.CLNotify = {
    toast: toast,
    maybeRemindChallenges: maybeRemindChallenges
  };
})(typeof window !== 'undefined' ? window : this);
