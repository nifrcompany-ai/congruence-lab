/**
 * 12 архетипов цифровой конгруэнтности + определение по профилю.
 */
(function (global) {
  'use strict';

  var U = global.CLUtils;

  var ARCHETYPES = [
    {
      id: 'navigator',
      name: 'Сбалансированный навигатор',
      description:
        'Вы умеете согласовывать внутреннее чувство «я», желаемый образ и онлайн-присутствие без резких разрывов.',
      strengths: ['Гибкость', 'Рефлексия', 'Устойчивость к социальному давлению'],
      weaknesses: ['Риск «середнячества» в самопрезентации', 'Усталость от постоянной калибровки'],
      tips: ['Фиксируйте микро-решения: где вы выбираете образ вместо опыта.', 'Чередуйте цифровые паузы и живые якоря.']
    },
    {
      id: 'strategist',
      name: 'Амбициозный стратег',
      description:
        'Сильный идеальный образ и цифровая самопрезентация; реальное «я» иногда отступает перед целями.',
      strengths: ['Целеустремлённость', 'Бренд-мышление', 'Структура'],
      weaknesses: ['Перегруз ролью', 'Страх «показать процесс»'],
      tips: ['Делитесь черновиками и неудачами — это снижает разрыв Real–Digital.', 'Сверяйте KPI с внутренними ценностями, не только с метриками.']
    },
    {
      id: 'explorer',
      name: 'Искренний исследователь',
      description:
        'Высокая аутентичность и рефлексия; в сети вы экспериментируете, иногда непредсказуемо для окружения.',
      strengths: ['Честность с собой', 'Любознательность', 'Глубина'],
      weaknesses: ['Нестабильная самопрезентация', 'Перегруз смыслом'],
      tips: ['Выберите 2–3 темы, где вы публичны стабильно.', 'Практикуйте короткие форматы — не обязательно всё объяснять сразу.']
    },
    {
      id: 'coordinator',
      name: 'Социальный координатор',
      description:
        'Вы сильны в связях и вовлечении; цифровой образ может усиливать «мы» в ущерб личным границам.',
      strengths: ['Эмпатия', 'Нетворкинг', 'Доверие группы'],
      weaknesses: ['Слияние с ожиданиями аудитории', 'Усталость от роли модератора'],
      tips: ['Планируйте «офлайн-якоря» без публикаций.', 'Раз в неделю — пост только для себя (черновик/закрытый канал).']
    },
    {
      id: 'thinker',
      name: 'Глубокий мыслитель',
      description:
        'Высокая рефлексия и автономия; цифровая идентичность может быть узкой или отложенной.',
      strengths: ['Аналитика', 'Независимость суждений', 'Долгая концентрация'],
      weaknesses: ['Мало внешней обратной связи', 'Задержка самопрезентации'],
      tips: ['Публикуйте одну мысль в неделю — как дневник поля.', 'Ищите 1–2 собеседника для честного диалога, не аудиторию.']
    },
    {
      id: 'nomad',
      name: 'Автономный номад',
      description:
        'Вы цените свободу и границы; цифровой след может быть фрагментарным намеренно.',
      strengths: ['Суверенитет', 'Защита приватности', 'Гибкость идентичности'],
      weaknesses: ['Ощущение «невидимости»', 'Сложность долгих нарративов'],
      tips: ['Явно маркируйте границы: что вы не обсуждаете онлайн.', 'Соберите «паспорт ролей» — какие маски допустимы и зачем.']
    },
    {
      id: 'visionary',
      name: 'Креативный визионер',
      description:
        'Сильный цифровой образ и идеалы; яркая подача может отойти от повседневного состояния.',
      strengths: ['Воображение', 'Сторителлинг', 'Вдохновение других'],
      weaknesses: ['Выгорание от образа', 'Сравнение с собственным «шоу»'],
      tips: ['Введите «режим черновика» без эстетики.', 'Сопоставляйте энергию поста с телесными сигналами.']
    },
    {
      id: 'warrior',
      name: 'Уязвимый воин',
      description:
        'Вы готовы показывать сложность; риск — перегруз откровенностью и реакцией среды.',
      strengths: ['Смелость', 'Подлинность переживания', 'Поддержка другим'],
      weaknesses: ['Ре-травматизация от комментариев', 'Смешение границ'],
      tips: ['Выбирайте контейнеры: где уязвимость безопасна.', 'Дебриф после публикации — 10 минут письменно.']
    },
    {
      id: 'leader',
      name: 'Харизматичный лидер',
      description:
        'Высокая самопрезентация и социальная энергия; следите, чтобы лидерство не вытесняло усталость.',
      strengths: ['Влияние', 'Ясность позиции', 'Мобилизация'],
      weaknesses: ['Зависимость от одобрения', 'Роль «всегда сильного»'],
      tips: ['Публично нормализуйте отдых и делегирование.', 'Один пост в месяц — «как есть», без урока.']
    },
    {
      id: 'listener',
      name: 'Эмпатичный слушатель',
      description:
        'Вы поддерживаете других; ваш цифровой образ может быть тише, чем внутренняя насыщенность.',
      strengths: ['Внимание к людям', 'Доверие', 'Тонкая настройка'],
      weaknesses: ['Недооценка собственного голоса', 'Накопление невысказанного'],
      tips: ['Мини-посты-наблюдения без советов.', 'Баланс: 1 реплика о себе на 3 реплики поддержки.']
    },
    {
      id: 'sage',
      name: 'Рефлексивный мудрец',
      description:
        'Сильная рефлексия и идеалы; цифровая идентичность может казаться «учёной» или отстранённой.',
      strengths: ['Мудрость', 'Долгая перспектива', 'Системность'],
      weaknesses: ['Дистанция от спонтанности', 'Мало «человеческого шума»'],
      tips: ['Короткие заметки из жизни, не только идеи.', 'Практики тела и эмоций, не только текста.']
    },
    {
      id: 'player',
      name: 'Игривый экспериментатор',
      description:
        'Любите пробовать маски и форматы; стабильность образа может быть ниже — это ресурс и риск.',
      strengths: ['Креатив', 'Адаптация', 'Юмор'],
      weaknesses: ['Размытость бренда', 'Усталость от переключений'],
      tips: ['Карта масок: какая роль на какой платформе.', 'Один якорный нарратив на квартал.']
    }
  ];

  /**
   * Оценка близости профиля к архетипу по вектору признаков (эвристика).
   */
  function scoreArchetype(profile, arch) {
    var R = profile.realSelf;
    var I = profile.idealSelf;
    var D = profile.digitalSelf;
    if (!U || !U.mean) return Math.random();
    var rMean = U.mean(R);
    var iMean = U.mean(I);
    var dMean = U.mean(D);
    var gapRI = Math.abs(rMean - iMean);
    var gapRD = Math.abs(rMean - dMean);
    var gapID = Math.abs(iMean - dMean);

    var authR = R[0];
    var presD = D[1];
    var autoR = R[2];
    var socD = D[3];
    var refR = R[4];
    var digD = D[5];

    var s = 0;
    switch (arch.id) {
      case 'navigator':
        s = 100 - (gapRD + gapID) * 0.4;
        break;
      case 'strategist':
        s = iMean + dMean - rMean * 0.3;
        break;
      case 'explorer':
        s = authR + refR + (100 - presD);
        break;
      case 'coordinator':
        s = socD + digD * 0.5 + U.mean([R[3], D[3]]);
        break;
      case 'thinker':
        s = refR + autoR - presD * 0.2;
        break;
      case 'nomad':
        s = autoR + (100 - digD) * 0.3;
        break;
      case 'visionary':
        s = digD + iMean + presD * 0.2;
        break;
      case 'warrior':
        s = authR + (100 - gapRD) * 0.2;
        break;
      case 'leader':
        s = presD + socD + iMean * 0.2;
        break;
      case 'listener':
        s = U.mean([R[3], R[0]]) + (100 - presD) * 0.2;
        break;
      case 'sage':
        s = refR + iMean + rMean * 0.1;
        break;
      case 'player':
        s = Math.abs(dMean - rMean) + presD * 0.3;
        break;
      default:
        s = 50;
    }
    return s;
  }

  function determineArchetype(profile) {
    var best = ARCHETYPES[0];
    var bestScore = -Infinity;
    for (var i = 0; i < ARCHETYPES.length; i++) {
      var sc = scoreArchetype(profile, ARCHETYPES[i]);
      if (sc > bestScore) {
        bestScore = sc;
        best = ARCHETYPES[i];
      }
    }
    return { archetype: best, score: bestScore, all: ARCHETYPES };
  }

  function topMismatch(profile) {
    var R = profile.realSelf;
    var I = profile.idealSelf;
    var D = profile.digitalSelf;
    var axes = global.CL_CONSTANTS.AXES;
    var list = [];
    for (var i = 0; i < R.length; i++) {
      list.push({
        axis: axes[i],
        axisIndex: i,
        gapRealDigital: Math.abs(R[i] - D[i]),
        gapIdealDigital: Math.abs(I[i] - D[i]),
        total: Math.abs(R[i] - D[i]) + Math.abs(I[i] - D[i])
      });
    }
    list.sort(function (a, b) {
      return b.total - a.total;
    });
    return list.slice(0, 3);
  }

  global.CLArchetypes = ARCHETYPES;
  global.CLDetermineArchetype = determineArchetype;
  global.CLTopMismatch = topMismatch;
})(typeof window !== 'undefined' ? window : this);
