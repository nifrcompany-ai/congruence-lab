/**
 * Утилиты: debounce, нормализация, форматирование, виртуализация списков.
 */
(function (global) {
  'use strict';

  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  /** Likert 1–5 → 0–100 */
  function likertToPercent(v) {
    var x = Number(v);
    if (isNaN(x)) return 0;
    return clamp(((x - 1) / 4) * 100, 0, 100);
  }

  /** Среднее массива чисел */
  function mean(arr) {
    if (!arr || !arr.length) return 0;
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += Number(arr[i]) || 0;
    return s / arr.length;
  }

  function formatDate(d) {
    var date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function uid() {
    return 'cl_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  /**
   * Простая виртуализация: ренерит только видимый срез массива в container.
   * @param {Object} opts
   */
  function virtualList(opts) {
    var container = opts.container;
    var itemHeight = opts.itemHeight || 48;
    var overscan = opts.overscan || 4;
    var renderRow = opts.renderRow;
    var getCount = opts.getCount;
    var getItem = opts.getItem;

    function onScroll() {
      var scrollTop = container.scrollTop;
      var h = container.clientHeight;
      var total = getCount();
      var start = Math.floor(scrollTop / itemHeight) - overscan;
      var end = Math.ceil((scrollTop + h) / itemHeight) + overscan;
      start = clamp(start, 0, total);
      end = clamp(end, 0, total);
      var frag = document.createDocumentFragment();
      for (var i = start; i < end; i++) {
        var el = renderRow(getItem(i), i);
        el.style.position = 'absolute';
        el.style.top = i * itemHeight + 'px';
        el.style.left = '0';
        el.style.right = '0';
        frag.appendChild(el);
      }
      var inner = container.querySelector('.cl-virtual-inner');
      if (!inner) {
        inner = document.createElement('div');
        inner.className = 'cl-virtual-inner';
        inner.style.position = 'relative';
        container.appendChild(inner);
      }
      inner.style.height = total * itemHeight + 'px';
      inner.innerHTML = '';
      inner.appendChild(frag);
    }

    container.addEventListener('scroll', debounce(onScroll, 16));
    onScroll();
    return { refresh: onScroll };
  }

  /**
   * Профиль из ответов: суммирование по осям и модулям, нормализация 0–100.
   * @param {Array} answers [{ questionId, value, question }]
   */
  function calculateProfile(answers) {
    var C = global.CL_CONSTANTS;
    var n = C.AXIS_COUNT;
    var sumReal = new Array(n).fill(0);
    var cntReal = new Array(n).fill(0);
    var sumIdeal = new Array(n).fill(0);
    var cntIdeal = new Array(n).fill(0);
    var sumDigital = new Array(n).fill(0);
    var cntDigital = new Array(n).fill(0);

    function add(module, axisIndex, percent) {
      if (axisIndex < 0 || axisIndex >= n) return;
      if (module === 'real') {
        sumReal[axisIndex] += percent;
        cntReal[axisIndex]++;
      } else if (module === 'ideal') {
        sumIdeal[axisIndex] += percent;
        cntIdeal[axisIndex]++;
      } else if (module === 'digital') {
        sumDigital[axisIndex] += percent;
        cntDigital[axisIndex]++;
      }
    }

    for (var i = 0; i < answers.length; i++) {
      var a = answers[i];
      var q = a.question;
      if (!q) continue;
      var pct = likertToPercent(a.value);
      var mod = q.module;
      if (q.axisIndex !== undefined) add(mod, q.axisIndex, pct);
      if (q.axisIndices && q.axisIndices.length) {
        var w = 1 / q.axisIndices.length;
        for (var j = 0; j < q.axisIndices.length; j++) {
          add(mod, q.axisIndices[j], pct * w);
        }
      }
    }

    function finalize(sum, cnt) {
      var out = [];
      for (var k = 0; k < n; k++) {
        out[k] = cnt[k] ? clamp(sum[k] / cnt[k], 0, 100) : 50;
      }
      return out;
    }

    return {
      realSelf: finalize(sumReal, cntReal),
      idealSelf: finalize(sumIdeal, cntIdeal),
      digitalSelf: finalize(sumDigital, cntDigital)
    };
  }

  /**
   * DSCI: 100 - (|R-D| + |I-D|) / 2, где R,I,D — средние по осям.
   */
  function calculateDSCI(profile) {
    var R = mean(profile.realSelf);
    var I = mean(profile.idealSelf);
    var D = mean(profile.digitalSelf);
    var dsci = 100 - (Math.abs(R - D) + Math.abs(I - D)) / 2;
    return clamp(Math.round(dsci * 10) / 10, 0, 100);
  }

  global.CLUtils = {
    debounce: debounce,
    clamp: clamp,
    likertToPercent: likertToPercent,
    mean: mean,
    formatDate: formatDate,
    uid: uid,
    virtualList: virtualList,
    calculateProfile: calculateProfile,
    calculateDSCI: calculateDSCI
  };
})(typeof window !== 'undefined' ? window : this);
