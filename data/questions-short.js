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
      text: 'Мои публикации отражают то, что я реально чувствую.'
    },
    {
      id: 'sr2',
      module: 'real',
      axisIndex: 1,
      text: 'Когда я онлайн, я контролирую образ, который показываю.'
    },
    {
      id: 'sr3',
      module: 'real',
      axisIndex: 2,
      text: 'Моё поведение в сети совпадает с моими внутренними ценностями.'
    },
    {
      id: 'sr4',
      module: 'real',
      axisIndex: 3,
      text: 'Мне легко быть собой в комментариях и ответах.'
    },
    {
      id: 'si1',
      module: 'ideal',
      axisIndex: 4,
      text: 'Я хочу глубже осмыслять свой цифровой след.'
    },
    {
      id: 'si2',
      module: 'ideal',
      axisIndex: 5,
      text: 'Для меня важно, чтобы мой онлайн-образ отражал моё развитие.'
    },
    {
      id: 'si3',
      module: 'ideal',
      axisIndex: 0,
      text: 'Я стремлюсь к большей искренности в своих постах.'
    },
    {
      id: 'si4',
      module: 'ideal',
      axisIndex: 1,
      text: 'Я хочу, чтобы моя самопрезентация была осознаннее.'
    },
    {
      id: 'sd1',
      module: 'digital',
      axisIndex: 2,
      text: 'Мой профиль в соцсетях отражает автономию моих решений.'
    },
    {
      id: 'sd2',
      module: 'digital',
      axisIndex: 3,
      text: 'Я использую сеть для подлинного контакта, а не только для формирования образа.'
    },
    {
      id: 'sd3',
      module: 'digital',
      axisIndex: 4,
      text: 'Мои посты отражают мою рефлексию, а не только реакцию на тренды.'
    },
    {
      id: 'sd4',
      module: 'digital',
      axisIndex: 5,
      text: 'Моя цифровая роль совпадает с тем, кем я себя знаю офлайн.'
    }
  ];

  global.CLQuestionsShort = Q;
})(typeof window !== 'undefined' ? window : this);
