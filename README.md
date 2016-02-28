futurizer
==========

[![build status](https://img.shields.io/travis/arcseldon/futurizer/master.svg?style=flat-square)](https://travis-ci.org/arcseldon/futurizer)
[![npm version](https://img.shields.io/npm/v/futurizer.svg?style=flat-square)](https://www.npmjs.com/package/futurizer)
[![codecov.io](https://codecov.io/github/arcseldon/futurizer/coverage.svg?branch=master)](https://codecov.io/github/arcseldon/futurizer?branch=master)

> Turn callback-style functions or promises into futures!!

This library is opinionated about its Future implementation. Internally, uses [Folktale data.task](https://github.com/folktale/data.task) for Future implementation.

For an unopinionated library, please see [futurize](https://github.com/stoeffel/futurize) which heavily inspired this
opinionated library.

Wanted reduced import boilerplate, and the most stable Future implementation available today out of the box.
That is the purpose of futurizer!!


### Futurize a callback-style function

Example 1
-----------

```js
'use strict';

const future = require('./futurizer').futurizer;

const helloAsync = (name, cb) => {
      setTimeout(() => {
        return cb(null, `Hello, ${name}`);
      }, 0);
    };

const hello = future(helloAsync);

hello('futurizer!!!!').fork(
   error => console.error(error)
 , data => console.log(data)
  //=> Hello, futurizer!!!!
);
```

Example 2
-----------

```js
const fs = require('fs'),
  future = require('./futurizer').futurizer;
  read = future(fs.readFile);

const decode = (buffer) => {
  return buffer.map(a => a.toString('utf-8'));
};

decode(read('README.md')).fork(
  error => console.error(error)
  , data => console.log(data)
);
```

### Futurize a promise

Example 1
-----------

```js

// use your favourite Promise implementation, example using Q
const Q = require('q'),
const futureP = require('./futurizer').futurizerP;

// promise returning function
const helloPromise = (name) => {
  return Q.fcall(() => {
    return `Hello, ${name}`;
  });
};

const hello = futureP(helloPromise);

hello('futurizer!!!!').fork(
   error => console.error(error)
 , data => console.log(data)
  //=> Hello, futurizer!!!!
);

```

## API

```hs
futurizer :: CPS -> ( ...args -> Future )
```

```hs
futurizerP :: Promise -> ( ...args -> Future )
```


## License

MIT © [arcseldon](http://arcseldon.surge.sh)
