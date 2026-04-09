/**
 * DEMO AI-коуч: задержка, шаблоны, анализ поста, история в IndexedDB.
 */
(function (global) {
  'use strict';

  var STORE = global.CL_CONSTANTS.STORES.COACH_CHAT;
  var MAX = global.CL_CONSTANTS.COACH_MAX_MESSAGES;

  var axesKeys = [
    'authenticity',
    'presentation',
    'autonomy',
    'social',
    'reflection',
    'digital'
  ];

  function findReply(text) {
    var t = text.toLowerCase();
    var tpl = global.CLCoachTemplates || [];
    var best = null;
    for (var i = 0; i < tpl.length; i++) {
      var item = tpl[i];
      for (var k = 0; k < item.keywords.length; k++) {
        if (t.indexOf(item.keywords[k].toLowerCase()) >= 0) {
          best = item.response;
          break;
        }
      }
      if (best) break;
    }
    if (!best) {
      best =
        'Я слышу вас. В DEMO-режиме я отвечаю по шаблонам. Уточните одно слово: усталость, страх, лента, границы, маска или тест?';
    }
    return '[DEMO] ' + best;
  }

  function analyzePost(text) {
    var t = text.toLowerCase();
    var scores = [50, 50, 50, 50, 50, 50];
    var rules = [
      { keys: ['честн', 'устал', 'боюсь', 'пережив'], axis: 0, d: 12 },
      { keys: ['успех', 'результат', 'кейс', 'эксперт'], axis: 1, d: 10 },
      { keys: ['хочу', 'выбираю', 'сам решаю'], axis: 2, d: 10 },
      { keys: ['друзья', 'команда', 'мы вместе', 'спасибо всем'], axis: 3, d: 10 },
      { keys: ['думаю', 'рефлекс', 'смысл', 'заметил'], axis: 4, d: 10 },
      { keys: ['сторис', 'лента', 'пост', 'подписчик'], axis: 5, d: 8 }
    ];
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      for (var j = 0; j < r.keys.length; j++) {
        if (t.indexOf(r.keys[j]) >= 0) scores[r.axis] = global.CLUtils.clamp(scores[r.axis] + r.d, 0, 100);
      }
    }
    var prof = null;
    try {
      var sr = localStorage.getItem(global.CL_CONSTANTS.STORAGE_KEYS.SHORT_STATE);
      if (sr) {
        /* optional compare */
      }
    } catch (e) {}
    return {
      axes: axesKeys.map(function (id, idx) {
        return { id: id, score: scores[idx], label: global.CL_CONSTANTS.AXES[idx].ru };
      }),
      note:
        'NLP-эмуляция по ключевым словам (DEMO). Для настоящего анализа нужна модель и этический контур.',
      profileHint: prof
    };
  }

  function persistMessages(list) {
    var id = 'coach_thread_v1';
    global.CLDatabase.put(STORE, { id: id, messages: list.slice(-MAX), at: Date.now() }).catch(function () {});
  }

  function loadMessages(cb) {
    global.CLDatabase.openDb().then(function () {
      return global.CLDatabase.getAll(STORE);
    }).then(function (rows) {
      var thread = rows.find(function (r) {
        return r.id === 'coach_thread_v1';
      });
      cb(thread && thread.messages ? thread.messages : []);
    }).catch(function () {
      cb([]);
    });
  }

  function appendBubble(container, role, text) {
    var d = document.createElement('div');
    d.className = 'cl-msg cl-msg--' + (role === 'user' ? 'user' : 'bot');
    d.textContent = text;
    container.appendChild(d);
    container.scrollTop = container.scrollHeight;
  }

  function init() {
    var chat = document.getElementById('cl-coach-chat');
    var input = document.getElementById('cl-coach-input');
    var send = document.getElementById('cl-coach-send');
    var tipEl = document.getElementById('cl-daily-tip');
    var tips = global.CLCoachDailyTips || [];
    if (tipEl && tips.length) {
      tipEl.textContent = tips[Math.floor(Math.random() * tips.length)];
    }

    var msgs = [];
    loadMessages(function (loaded) {
      msgs = loaded;
      if (chat) {
        chat.innerHTML = '';
        for (var i = 0; i < msgs.length; i++) {
          appendBubble(chat, msgs[i].role, msgs[i].text);
        }
      }
      if (input) {
        setTimeout(function () {
          input.focus();
        }, 100);
      }
    });

    function sendUser() {
      if (!input || !chat) return;
      var v = input.value.trim();
      if (!v) return;
      input.value = '';
      msgs.push({ role: 'user', text: v, t: Date.now() });
      appendBubble(chat, 'user', v);
      persistMessages(msgs);
      if (global.CLAchievements) global.CLAchievements.bump('coachMsgs', 1);

      var delay = 800 + Math.floor(Math.random() * 700);
      var typing = document.createElement('div');
      typing.className = 'cl-msg cl-msg--bot anim-pulse';
      typing.textContent = '…';
      chat.appendChild(typing);
      setTimeout(function () {
        typing.remove();
        var reply = findReply(v);
        msgs.push({ role: 'bot', text: reply, t: Date.now() });
        appendBubble(chat, 'bot', reply);
        persistMessages(msgs);
      }, delay);
    }

    send && send.addEventListener('click', sendUser);
    input &&
      input.addEventListener(
        'keydown',
        function (e) {
          if (e.key !== 'Enter') return;
          if (e.shiftKey) return;
          e.preventDefault();
          sendUser();
        }
      );

    var pa = document.getElementById('cl-post-analyze');
    pa &&
      pa.addEventListener('click', function () {
        var ta = document.getElementById('cl-post-text');
        if (!ta) return;
        var res = analyzePost(ta.value || '');
        var out = document.getElementById('cl-post-result');
        if (out) {
          out.innerHTML =
            '<p>' +
            res.note +
            '</p><ul>' +
            res.axes
              .map(function (a) {
                return '<li>' + a.label + ': ' + a.score + '</li>';
              })
              .join('') +
            '</ul>';
        }
      });
  }

  global.CLCoach = { init: init, findReply: findReply, analyzePost: analyzePost };
})(typeof window !== 'undefined' ? window : this);
