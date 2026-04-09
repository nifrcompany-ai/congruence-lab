/**
 * Локальная аналитика событий (без отправки на сервер).
 */
(function (global) {
  'use strict';

  var KEY = global.CL_CONSTANTS && global.CL_CONSTANTS.STORAGE_KEYS.ANALYTICS_EVENTS;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function save(arr) {
    try {
      localStorage.setItem(KEY, JSON.stringify(arr.slice(-500)));
    } catch (e) {}
  }

  function track(name, payload) {
    var list = load();
    list.push({
      t: Date.now(),
      name: name,
      payload: payload || {}
    });
    save(list);
  }

  function summary() {
    var list = load();
    var byName = {};
    for (var i = 0; i < list.length; i++) {
      var n = list[i].name;
      byName[n] = (byName[n] || 0) + 1;
    }
    return { total: list.length, byName: byName };
  }

  global.CLAnalytics = {
    track: track,
    summary: summary,
    load: load
  };
})(typeof window !== 'undefined' ? window : this);
