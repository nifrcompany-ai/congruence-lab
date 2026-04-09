/**
 * Демонстрационное XOR-«шифрование» для локального экспорта.
 * Не использовать для реальной защиты данных.
 */
(function (global) {
  'use strict';

  var NOTE =
    'Демо-XOR: это не криптостойкое шифрование. Для исследовательского прототипа только.';

  function utf8ToBytes(str) {
    return new TextEncoder().encode(str);
  }

  function bytesToUtf8(bytes) {
    return new TextDecoder().decode(bytes);
  }

  function xorBytes(data, keyBytes) {
    var out = new Uint8Array(data.length);
    for (var i = 0; i < data.length; i++) {
      out[i] = data[i] ^ keyBytes[i % keyBytes.length];
    }
    return out;
  }

  /** @param {string} plaintext @param {string} passphrase */
  function encryptDemo(plaintext, passphrase) {
    var data = utf8ToBytes(plaintext);
    var key = utf8ToBytes(passphrase || 'congruence-lab-demo');
    var x = xorBytes(data, key);
    var bin = '';
    for (var i = 0; i < x.length; i++) bin += String.fromCharCode(x[i]);
    return btoa(bin);
  }

  function decryptDemo(b64, passphrase) {
    try {
      var bin = atob(b64);
      var data = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
      var key = utf8ToBytes(passphrase || 'congruence-lab-demo');
      return bytesToUtf8(xorBytes(data, key));
    } catch (e) {
      return '';
    }
  }

  global.CLCrypto = {
    NOTE: NOTE,
    encryptDemo: encryptDemo,
    decryptDemo: decryptDemo
  };
})(typeof window !== 'undefined' ? window : this);
