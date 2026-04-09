/**
 * Экспорт JSON / CSV / PDF (+ опциональная анонимизация).
 */
(function (global) {
  'use strict';

  function anonymize(obj) {
    var s = JSON.stringify(obj);
    s = s.replace(/@[\w.-]+/g, '@[email]');
    s = s.replace(/\+?\d[\d\s\-]{8,}/g, '[phone]');
    return JSON.parse(s);
  }

  function downloadText(filename, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function toCSV(rows) {
    if (!rows.length) return '';
    var keys = Object.keys(rows[0]);
    var esc = function (v) {
      var s = v == null ? '' : String(v);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    return keys.join(',') + '\n' + rows.map(function (r) {
      return keys.map(function (k) {
        return esc(r[k]);
      }).join(',');
    }).join('\n');
  }

  function exportJSON(data, filename, options) {
    var out = options && options.anonymize ? anonymize(data) : data;
    downloadText(filename || 'congruence-lab-export.json', JSON.stringify(out, null, 2), 'application/json');
  }

  function exportCSV(rows, filename, options) {
    var out = options && options.anonymize ? anonymize(rows) : rows;
    downloadText(filename || 'congruence-lab-export.csv', toCSV(out), 'text/csv;charset=utf-8');
  }

  function exportPDF(title, lines, callback) {
    var PDF = global.jspdf && global.jspdf.jsPDF;
    if (!PDF) {
      if (callback) callback(new Error('jsPDF not loaded'));
      return;
    }
    var doc = new PDF();
    doc.setFontSize(14);
    doc.text(title, 14, 18);
    doc.setFontSize(10);
    var y = 28;
    for (var i = 0; i < lines.length; i++) {
      var parts = doc.splitTextToSize(String(lines[i]), 180);
      for (var j = 0; j < parts.length; j++) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(parts[j], 14, y);
        y += 6;
      }
    }
    doc.save('congruence-lab-report.pdf');
    if (callback) callback(null);
  }

  global.CLExport = {
    anonymize: anonymize,
    exportJSON: exportJSON,
    exportCSV: exportCSV,
    exportPDF: exportPDF,
    downloadText: downloadText
  };
})(typeof window !== 'undefined' ? window : this);
