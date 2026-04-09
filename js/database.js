/**
 * IndexedDB: история тестов, дневник, чат коуча, эксперименты.
 */
(function (global) {
  'use strict';

  var C = global.CL_CONSTANTS;
  var dbPromise = null;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!C) {
        reject(new Error('CL_CONSTANTS missing'));
        return;
      }
      var req = indexedDB.open(C.DB_NAME, C.DB_VERSION);
      req.onerror = function () {
        reject(req.error);
      };
      req.onsuccess = function () {
        resolve(req.result);
      };
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(C.STORES.TEST_HISTORY)) {
          db.createObjectStore(C.STORES.TEST_HISTORY, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(C.STORES.JOURNAL)) {
          db.createObjectStore(C.STORES.JOURNAL, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(C.STORES.COACH_CHAT)) {
          db.createObjectStore(C.STORES.COACH_CHAT, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(C.STORES.EXPERIMENTS)) {
          db.createObjectStore(C.STORES.EXPERIMENTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(C.STORES.TEAM_MEMBERS)) {
          db.createObjectStore(C.STORES.TEAM_MEMBERS, { keyPath: 'id' });
        }
      };
    });
    return dbPromise;
  }

  function add(storeName, record) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, 'readwrite');
        var st = tx.objectStore(storeName);
        var req = st.add(record);
        req.onsuccess = function () {
          resolve(record.id);
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }

  function put(storeName, record) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(record);
        tx.oncomplete = function () {
          resolve(record.id);
        };
        tx.onerror = function () {
          reject(tx.error);
        };
      });
    });
  }

  function getAll(storeName) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, 'readonly');
        var req = tx.objectStore(storeName).getAll();
        req.onsuccess = function () {
          resolve(req.result || []);
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }

  function clearStore(storeName) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        tx.oncomplete = function () {
          resolve();
        };
        tx.onerror = function () {
          reject(tx.error);
        };
      });
    });
  }

  global.CLDatabase = {
    openDb: openDb,
    add: add,
    put: put,
    getAll: getAll,
    clearStore: clearStore
  };
})(typeof window !== 'undefined' ? window : this);
