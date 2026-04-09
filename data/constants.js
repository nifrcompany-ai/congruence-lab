/**
 * Congruence Lab — глобальные константы осей, ключей хранилища и настроек.
 */
(function (global) {
  'use strict';

  var AXES = [
    { id: 'authenticity', ru: 'Аутентичность', en: 'Authenticity' },
    { id: 'presentation', ru: 'Самопрезентация', en: 'Self-presentation' },
    { id: 'autonomy', ru: 'Автономия', en: 'Autonomy' },
    { id: 'social', ru: 'Социальная связь', en: 'Social connection' },
    { id: 'reflection', ru: 'Рефлексия', en: 'Reflection' },
    { id: 'digital', ru: 'Цифровая идентичность', en: 'Digital identity' }
  ];

  var STORAGE_KEYS = {
    SETTINGS: 'cl_settings',
    SHORT_STATE: 'cl_short_state',
    LONG_STATE: 'cl_long_state',
    PROFILE_META: 'cl_profile_meta',
    ACHIEVEMENTS: 'cl_achievements',
    CHALLENGES: 'cl_challenges_progress',
    TEAM_LOCAL: 'cl_team_local',
    CRYPTO_NOTE: 'cl_crypto_demo_note',
    ANALYTICS_EVENTS: 'cl_analytics_events'
  };

  var DB_NAME = 'CongruenceLabDB';
  var DB_VERSION = 1;
  var STORES = {
    TEST_HISTORY: 'testHistory',
    JOURNAL: 'journal',
    COACH_CHAT: 'coachChat',
    EXPERIMENTS: 'experiments',
    TEAM_MEMBERS: 'teamMembers'
  };

  global.CL_CONSTANTS = {
    AXES: AXES,
    AXIS_COUNT: AXES.length,
    STORAGE_KEYS: STORAGE_KEYS,
    DB_NAME: DB_NAME,
    DB_VERSION: DB_VERSION,
    STORES: STORES,
    COACH_MAX_MESSAGES: 100,
    JOURNAL_HEATMAP_DAYS: 30,
    TEAM_CODE_LENGTH: 6
  };
})(typeof window !== 'undefined' ? window : this);
