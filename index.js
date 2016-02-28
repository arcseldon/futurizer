// author arcseldon@icloud.com
'use strict';

var Future = require('data.task');

// futurizer :: CPS -> ( ...args -> Future )
var futurizer = function futurizer(fn) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Future(function (rej, res) {
      return fn.apply(undefined, args.concat([function (err, result) {
        return err ? rej(err) : res(result);
      }]));
    });
  };
};

// futurizerP :: Promise -> ( ...args -> Future )
var futurizerP = function futurizerP(fn) {
  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return new Future(function (rej, res) {
      return fn.apply(undefined, args).then(res, rej);
    });
  };
};

module.exports = {
  futurizer: futurizer,
  futurizerP: futurizerP
};
