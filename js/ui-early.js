/* Масштаб до первой отрисовки: по умолчанию обычный (не увеличенный) */
(function () {
  try {
    var r = localStorage.getItem('cl_settings');
    var s = r ? JSON.parse(r) : {};
    var scale = s.uiScale;
    if (!scale) {
      if (s.uiCompact === true) scale = 'compact';
      else scale = 'normal';
    }
    document.documentElement.classList.remove('cl-ui-comfort', 'cl-ui-compact');
    if (scale === 'comfort') document.documentElement.classList.add('cl-ui-comfort');
    else if (scale === 'compact') document.documentElement.classList.add('cl-ui-compact');
  } catch (e) {
    document.documentElement.classList.remove('cl-ui-comfort', 'cl-ui-compact');
  }
})();
