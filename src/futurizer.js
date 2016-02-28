// author arcseldon@icloud.com
'use strict';

const Future = require('data.task');

// futurizer :: CPS -> ( ...args -> Future )
const futurizer = fn => (...args) => {
  return new Future((rej, res) =>
    fn(...args, (err, result) => err ? rej(err) : res(result))
  );
};

// futurizerP :: Promise -> ( ...args -> Future )
const futurizerP = fn => (...args) => {
  return new Future((rej, res) =>
    fn(...args).then(res, rej)
  );
};

module.exports = {
  futurizer,
  futurizerP
};
