/**
 * Демо-данные для предпросмотра графиков (опциональный импорт).
 */
(function (global) {
  'use strict';
  global.CLDemoData = {
    journalSample: function () {
      var out = [];
      for (var i = 0; i < 30; i++) {
        out.push({
          id: 'demo_j_' + i,
          date: Date.now() - i * 86400000,
          authenticity: 4 + (i % 4),
          emotion: ['спокойствие', 'радость', 'тревога', 'усталость', 'вдохновение', 'грусть'][i % 6],
          note: 'Демо-запись ' + (i + 1)
        });
      }
      return out;
    },
    profileScores: {
      realSelf: [72, 65, 70, 68, 75, 62],
      idealSelf: [85, 78, 82, 80, 88, 79],
      digitalSelf: [68, 82, 60, 75, 66, 85]
    }
  };
})(typeof window !== 'undefined' ? window : this);
