/**
 * Быстрый тест: 12 вопросов (Real / Ideal / Digital по 4).
 */
(function (global) {
  'use strict';

  var Q = [
    {
      id: 'sr1',
      module: 'real',
      axisIndex: 0,
      text: 'Насколько ваши публикации отражают то, что вы реально чувствуете?'
    },
    {
      id: 'sr2',
      module: 'real',
      axisIndex: 1,
      text: 'Когда вы онлайн, насколько вы контролируете образ, который показываете?'
    },
    {
      id: 'sr3',
      module: 'real',
      axisIndex: 2,
      text: 'Насколько ваше поведение в сети совпадает с внутренними ценностями?'
    },
    {
      id: 'sr4',
      module: 'real',
      axisIndex: 3,
      text: 'Насколько легко вам быть собой в комментариях и ответах?'
    },
    {
      id: 'si1',
      module: 'ideal',
      axisIndex: 4,
      text: 'Как сильно вы хотели бы глубже осмыслять свой цифровой след?'
    },
    {
      id: 'si2',
      module: 'ideal',
      axisIndex: 5,
      text: 'Насколько важно для вас, чтобы онлайн-образ отражал ваше развитие?'
    },
    {
      id: 'si3',
      module: 'ideal',
      axisIndex: 0,
      text: 'Насколько вы стремитесь к большей искренности в постах?'
    },
    {
      id: 'si4',
      module: 'ideal',
      axisIndex: 1,
      text: 'Насколько вы хотели бы, чтобы ваша самопрезентация была осознаннее?'
    },
    {
      id: 'sd1',
      module: 'digital',
      axisIndex: 2,
      text: 'Насколько ваш профиль в соцсетях отражает автономию ваших решений?'
    },
    {
      id: 'sd2',
      module: 'digital',
      axisIndex: 3,
      text: 'Насколько вы используете сеть для подлинного контакта, а не только для образа?'
    },
    {
      id: 'sd3',
      module: 'digital',
      axisIndex: 4,
      text: 'Насколько ваши посты отражают рефлексию, а не только реакцию трендам?'
    },
    {
      id: 'sd4',
      module: 'digital',
      axisIndex: 5,
      text: 'Насколько цифровая «роль» совпадает с тем, кем вы себя знаете офлайн?'
    }
  ];

  global.CLQuestionsShort = Q;
})(typeof window !== 'undefined' ? window : this);
