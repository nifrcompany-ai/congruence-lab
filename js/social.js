/**
 * Групповая динамика: код группы, локальные «участники», агрегаты (без сервера).
 */
(function (global) {
  'use strict';

  var U = global.CLUtils;
  var C = global.CL_CONSTANTS;

  function codeKey(code) {
    return 'cl_team_' + String(code).toUpperCase();
  }

  function randomCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var len = C ? C.TEAM_CODE_LENGTH : 6;
    var s = '';
    for (var i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  function getGroup(code) {
    try {
      var raw = localStorage.getItem(codeKey(code));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveGroup(code, group) {
    localStorage.setItem(codeKey(code), JSON.stringify(group));
  }

  function createGroup(creatorLabel) {
    var code = randomCode();
    while (getGroup(code)) code = randomCode();
    var group = {
      code: code,
      created: Date.now(),
      creatorId: U ? U.uid() : 'creator',
      creatorLabel: creatorLabel || 'Создатель',
      members: []
    };
    saveGroup(code, group);
    localStorage.setItem(
      C.STORAGE_KEYS.TEAM_LOCAL,
      JSON.stringify({ role: 'creator', code: code })
    );
    return group;
  }

  /** Анонимный снимок профиля: только средние по осям и DSCI */
  function profileSnapshot(profile, label) {
    var dsci = U && profile ? U.calculateDSCI(profile) : 0;
    return {
      id: U ? U.uid() : 'm',
      label: label || 'Участник',
      added: Date.now(),
      realMean: U ? U.mean(profile.realSelf) : 0,
      idealMean: U ? U.mean(profile.idealSelf) : 0,
      digitalMean: U ? U.mean(profile.digitalSelf) : 0,
      dsci: dsci,
      axesReal: profile.realSelf,
      axesIdeal: profile.idealSelf,
      axesDigital: profile.digitalSelf
    };
  }

  function joinGroup(code, profile, label) {
    var g = getGroup(code);
    if (!g) return { ok: false, error: 'Группа не найдена' };
    var snap = profileSnapshot(profile, label);
    g.members.push(snap);
    saveGroup(code, g);
    localStorage.setItem(
      C.STORAGE_KEYS.TEAM_LOCAL,
      JSON.stringify({ role: 'member', code: code })
    );
    return { ok: true, group: g };
  }

  function addDemoPeers(code, count) {
    var g = getGroup(code);
    if (!g) return g;
    for (var i = 0; i < (count || 3); i++) {
      var p = {
        realSelf: [50, 55, 60, 52, 58, 54].map(function (x) {
          return global.CLUtils.clamp(x + Math.round((Math.random() - 0.5) * 20), 0, 100);
        }),
        idealSelf: [70, 72, 68, 75, 80, 77].map(function (x) {
          return global.CLUtils.clamp(x + Math.round((Math.random() - 0.5) * 15), 0, 100);
        }),
        digitalSelf: [60, 78, 55, 70, 62, 80].map(function (x) {
          return global.CLUtils.clamp(x + Math.round((Math.random() - 0.5) * 18), 0, 100);
        })
      };
      g.members.push(profileSnapshot(p, 'Аноним ' + (i + 1)));
    }
    saveGroup(code, g);
    return g;
  }

  function aggregateRadar(group) {
    if (!group || !group.members.length) return null;
    var n = C.AXIS_COUNT;
    var sumR = new Array(n).fill(0);
    var sumI = new Array(n).fill(0);
    var sumD = new Array(n).fill(0);
    for (var i = 0; i < group.members.length; i++) {
      var m = group.members[i];
      for (var a = 0; a < n; a++) {
        sumR[a] += m.axesReal[a] || 0;
        sumI[a] += m.axesIdeal[a] || 0;
        sumD[a] += m.axesDigital[a] || 0;
      }
    }
    var k = group.members.length;
    return {
      real: sumR.map(function (x) {
        return Math.round(x / k);
      }),
      ideal: sumI.map(function (x) {
        return Math.round(x / k);
      }),
      digital: sumD.map(function (x) {
        return Math.round(x / k);
      }),
      avgDSCI: Math.round(
        group.members.reduce(function (s, m) {
          return s + m.dsci;
        }, 0) / k
      )
    };
  }

  function exportGroupAnalytics(code) {
    var g = getGroup(code);
    if (!g) return null;
    return {
      code: g.code,
      created: g.created,
      memberCount: g.members.length,
      aggregate: aggregateRadar(g),
      trendNote: 'Локальный снимок; тренды условны без долгой истории на сервере.'
    };
  }

  global.CLSocial = {
    createGroup: createGroup,
    joinGroup: joinGroup,
    getGroup: getGroup,
    aggregateRadar: aggregateRadar,
    exportGroupAnalytics: exportGroupAnalytics,
    addDemoPeers: addDemoPeers,
    profileSnapshot: profileSnapshot
  };
})(typeof window !== 'undefined' ? window : this);
