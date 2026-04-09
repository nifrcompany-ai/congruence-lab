/**
 * Интерактивные упражнения по осям (drag-drop на странице library / exercise UI).
 */
(function (global) {
  'use strict';
  var axes = ['authenticity', 'presentation', 'autonomy', 'social', 'reflection', 'digital'];
  var labels = {
    authenticity: 'Аутентичность',
    presentation: 'Самопрезентация',
    autonomy: 'Автономия',
    social: 'Социальная связь',
    reflection: 'Рефлексия',
    digital: 'Цифровая идентичность'
  };
  var list = [];
  var titles = [
    ['Сортировка мотивов', 'Перетащите карточки: «образ» vs «опыт»'],
    ['Тональности', 'Расставьте фразы от «защитной» к «открытой»'],
    ['Автономия', 'Отметьте, что вы выбираете сами в сети'],
    ['Связь', 'Приоритизируйте типы контакта'],
    ['Рефлексия', 'Упорядочьте шаги вечернего ретро'],
    ['Цифровой след', 'Ранжируйте платформы по «энергозатратам»']
  ];
  for (var i = 0; i < axes.length; i++) {
    var ax = axes[i];
    var t = titles[i];
    list.push({
      id: 'ex_' + ax,
      axis: ax,
      axisLabel: labels[ax],
      title: t[0],
      description: t[1],
      items: ['Вариант A', 'Вариант B', 'Вариант C', 'Вариант D'].map(function (x, j) {
        return { id: ax + '_' + j, text: x + ' (' + labels[ax] + ')' };
      })
    });
  }
  global.CLExercises = list;
})(typeof window !== 'undefined' ? window : this);
