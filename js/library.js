(function (global) {
  'use strict';

  function tabs() {
    document.querySelectorAll('.cl-tabs [data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-tab');
        document.querySelectorAll('.cl-tabs [data-tab]').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        document.querySelectorAll('.cl-tab-panel').forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('id') === id);
        });
        if (global.CLAchievements) {
          global.CLAchievements.bump('libraryOpens', 1);
          global.CLAchievements.checkAll();
        }
        if (id === 'tab-archetypes' && global.CLAchievements) {
          var st = global.CLAchievements.load();
          st.archetypesOpened = true;
          global.CLAchievements.save(st);
          global.CLAchievements.unlock('know_self');
        }
      });
    });
  }

  function fillArchetypes() {
    var el = document.getElementById('cl-lib-archetypes');
    if (!el || !global.CLArchetypes) return;
    el.innerHTML = global.CLArchetypes.map(function (a) {
      return (
        '<div class="cl-acc-item"><button type="button" class="cl-acc-head">' +
        a.name +
        ' <i class="fas fa-chevron-down"></i></button><div class="cl-acc-body"><p>' +
        a.description +
        '</p><p><strong>Сильные:</strong> ' +
        a.strengths.join(', ') +
        '</p><p><strong>Риски:</strong> ' +
        a.weaknesses.join(', ') +
        '</p><p><strong>Советы:</strong> ' +
        a.tips.join(' ') +
        '</p></div></div>'
      );
    }).join('');
    el.querySelectorAll('.cl-acc-head').forEach(function (h) {
      h.addEventListener('click', function () {
        h.parentElement.classList.toggle('is-open');
      });
    });
  }

  function fillPractices() {
    var el = document.getElementById('cl-lib-practices');
    if (!el || !global.CLPractices) return;
    var list = global.CLPractices;
    var container = el.querySelector('.cl-virtual') || el;
    if (!el.querySelector('.cl-virtual')) {
      var wrap = document.createElement('div');
      wrap.className = 'cl-virtual';
      wrap.id = 'cl-virt-practices';
      el.appendChild(wrap);
      container = wrap;
    }
    global.CLUtils.virtualList({
      container: container,
      itemHeight: 76,
      getCount: function () {
        return list.length;
      },
      getItem: function (i) {
        return list[i];
      },
      renderRow: function (item) {
        var d = document.createElement('div');
        d.className = 'cl-virtual-row';
        d.innerHTML =
          '<strong>' +
          item.title +
          '</strong> <span class="mono">' +
          item.axisLabel +
          '</span><br><small>' +
          item.description +
          '</small>';
        return d;
      }
    });
  }

  function fillArticles() {
    var el = document.getElementById('cl-lib-articles');
    if (!el || !global.CLArticles) return;
    var arts = global.CLArticles;
    el.innerHTML = arts
      .map(function (a) {
        return (
          '<article class="cl-card" style="margin-bottom:0.75rem"><h3>' +
          a.title +
          '</h3><p>' +
          a.excerpt +
          '</p><blockquote>' +
          a.quote +
          '</blockquote><small class="mono">' +
          a.readMin +
          ' мин · ' +
          a.tags.join(', ') +
          '</small></article>'
        );
      })
      .join('');
  }

  function fillBooks() {
    var el = document.getElementById('cl-lib-books');
    if (!el || !global.CLBooks) return;
    el.innerHTML = global.CLBooks.map(function (b) {
      return (
        '<div class="cl-card" style="margin-bottom:0.5rem"><strong>' +
        b.title +
        '</strong> — ' +
        b.author +
        ' <span class="mono">(' +
        b.year +
        ')</span><br><small>' +
        b.topic +
        '</small></div>'
      );
    }).join('');
  }

  function markExerciseProgress() {
    if (!global.CLAchievements) return;
    var st = global.CLAchievements.load();
    var first = !st.exercise;
    st.exercise = true;
    global.CLAchievements.save(st);
    global.CLAchievements.checkAll();
    if (first && global.CLNotify) global.CLNotify.toast('Упражнение засчитано — откройте «Ачивки»', 'success');
  }

  function wireSortable(box) {
    var dragging = null;

    function reorderByPointer(e) {
      if (!dragging) return;
      e.preventDefault();
      var rows = [].slice.call(box.querySelectorAll('.cl-drag-row:not(.dragging)'));
      var next = null;
      for (var i = 0; i < rows.length; i++) {
        var rect = rows[i].getBoundingClientRect();
        var mid = rect.top + rect.height / 2;
        if (e.clientY < mid) {
          next = rows[i];
          break;
        }
      }
      if (next == null) box.appendChild(dragging);
      else box.insertBefore(dragging, next);
    }

    box.addEventListener('dragstart', function (e) {
      var t = e.target.closest('.cl-drag-row');
      if (!t || !box.contains(t)) return;
      if (e.target.closest('button')) {
        e.preventDefault();
        return;
      }
      dragging = t;
      t.classList.add('dragging');
      try {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'move');
      } catch (err) {}
    });

    box.addEventListener('dragend', function () {
      if (dragging) {
        dragging.classList.remove('dragging');
        dragging = null;
      }
    });

    box.addEventListener('dragover', function (e) {
      if (!dragging) return;
      reorderByPointer(e);
    });

    box.addEventListener('drop', function (e) {
      e.preventDefault();
      markExerciseProgress();
    });

    box.addEventListener('dragenter', function (e) {
      if (dragging) e.preventDefault();
    });

    box.querySelectorAll('.cl-row-up').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var row = btn.closest('.cl-drag-row');
        if (!row) return;
        var prev = row.previousElementSibling;
        if (prev) box.insertBefore(row, prev);
        markExerciseProgress();
      });
    });
    box.querySelectorAll('.cl-row-down').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var row = btn.closest('.cl-drag-row');
        if (!row) return;
        var next = row.nextElementSibling;
        if (next) box.insertBefore(next, row);
        markExerciseProgress();
      });
    });
  }

  function fillExercises() {
    var el = document.getElementById('cl-lib-exercises');
    if (!el || !global.CLExercises) return;
    el.innerHTML =
      '<p class="cl-ex-hint cl-card glass">Перетащите строки за ручку ⋮⋮ или нажимайте «Вверх» / «Вниз». Любое изменение порядка засчитывается.</p>' +
      global.CLExercises.map(function (ex) {
        return (
          '<div class="cl-card cl-ex-card" style="margin-bottom:1rem"><h3>' +
          ex.title +
          '</h3><p>' +
          ex.description +
          '</p><div class="cl-sort-zone" id="drag-' +
          ex.id +
          '" role="list"></div></div>'
        );
      }).join('');
    global.CLExercises.forEach(function (ex) {
      var box = document.getElementById('drag-' + ex.id);
      if (!box) return;
      ex.items.forEach(function (it) {
        var wrap = document.createElement('div');
        wrap.className = 'cl-drag-row';
        wrap.setAttribute('role', 'listitem');
        wrap.draggable = true;
        wrap.innerHTML =
          '<span class="cl-drag-grip" aria-hidden="true" title="Перетащить">⋮⋮</span>' +
          '<div class="cl-drag-text" tabindex="0">' +
          it.text +
          '</div>' +
          '<div class="cl-drag-tools">' +
          '<button type="button" class="cl-icon-btn cl-row-up" aria-label="Переместить вверх">↑</button>' +
          '<button type="button" class="cl-icon-btn cl-row-down" aria-label="Переместить вниз">↓</button>' +
          '</div>';
        box.appendChild(wrap);
      });
      wireSortable(box);
    });
  }

  function fillMeditations() {
    var el = document.getElementById('cl-lib-meditations');
    if (!el || !global.CLMeditations) return;
    el.innerHTML = global.CLMeditations.map(function (m) {
      return (
        '<div class="cl-card" style="margin-bottom:0.75rem"><h3>' +
        m.title +
        '</h3><p>' +
        m.note +
        '</p><p class="mono">' +
        Math.floor(m.durationSec / 60) +
        ' мин</p><button type="button" class="grad-btn cl-med-start" data-sec="' +
        m.durationSec +
        '">Таймер</button></div>'
      );
    }).join('');
    el.querySelectorAll('.cl-med-start').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sec = Number(btn.getAttribute('data-sec'));
        var end = Date.now() + sec * 1000;
        btn.disabled = true;
        var tick = function () {
          var left = Math.max(0, Math.floor((end - Date.now()) / 1000));
          btn.textContent = left + ' сек';
          if (left <= 0) {
            btn.disabled = false;
            btn.textContent = 'Готово';
            if (global.CLAchievements) {
              var st = global.CLAchievements.load();
              st.meditation = true;
              global.CLAchievements.save(st);
              global.CLAchievements.checkAll();
            }
            return;
          }
          requestAnimationFrame(function () {
            setTimeout(tick, 500);
          });
        };
        tick();
      });
    });
  }

  function init() {
    tabs();
    fillArchetypes();
    fillPractices();
    fillArticles();
    fillBooks();
    fillExercises();
    fillMeditations();
  }

  global.CLLibrary = { init: init };
})(typeof window !== 'undefined' ? window : this);
