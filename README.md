futurizer
==========

[![build status](https://img.shields.io/travis/arcseldon/futurizer/master.svg?style=flat-square)](https://travis-ci.org/arcseldon/futurizer)
[![npm version](https://img.shields.io/npm/v/futurizer.svg?style=flat-square)](https://www.npmjs.com/package/futurizer)
[![Coverage Status](https://coveralls.io/repos/github/arcseldon/futurizer/badge.svg?branch=master)](https://coveralls.io/github/arcseldon/futurizer?branch=master)

> Turn callback-style functions or promises into futures!!

This library is opinionated about its Future implementation. Internally, it uses [Folktale data.task](https://github.com/folktale/data.task).

For an unopinionated library, please see [futurize](https://github.com/stoeffel/futurize) which is an excellent library, supports any
 compatible implementation of Future, and HEAVILY inspired this library.

Benefits of being opinionated are that this library ensures you are using a proven, production grade Future implementation, and makes
import / require statements a breeze.

Please see simple examples below demonstrating usage. Futures are pure - for a great introduction, watch this [video](https://vimeo.com/106008027?ref=tw-share)

Once you see the convenience and power of Futures it will redefine how you approach asynchronous functional programming (in JavaScript) for many situations.

This library integrates really nicely with functional libraries that are fantasy land compatible and dispatch functor, applicative functor, and monadic APIs

There is a summary of the essentials at the end of this readme if these concepts are new to you.


### Futurize a callback-style function

#### Example 1
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

#### Example 2
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

#### Example 1
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


## Frequently Asked Questions


#### Why should I bother? I like async with callbacks and promises..

Futures are alot like bluebird promises, and have the same ideas as promises, but nothing happens
until you call fork!

If you defer calling fork, then you can add more functional pipelining simply by mapping over further behaviour.
Also, because they use standardized functor, applicative functor and monadic functions, they can be seamlessly
 composed with functional libraries that understand those APIs. For instance, [folktale](https://github.com/folktale), [sanctuary](https://github.com/plaid/sanctuary) and of course [ramda](http://ramdajs.com/0.19.1/index.html) all
  work really well together.


So use Futures only if you wish to make pure systems that are extendible, and founded on solid principles from mathematics / category theory.

Let me present more examples to give you better sense of usage scenarios:

```js

const futureLast = compose(map(first), map(reverse), Future.of);
futureLast([3,2,1]).fork(errFn, console.log)
//=> 1


new Future(function (rej, res) {
  // async here
});


//+ getJSON :: (JSON -> b) -> (Error -> c) -> String -> Object -> void
const getJSON = curry(function (res, rej, url, params) {
  $.getJSON(url, params, res).fail(rej);
});


//+ getJSON :: String -> Object -> Future(Error, JSON)
const getJSON = curry(function (url, params) {
  return new Future(function (rej, res) {
    $.getJSON(url, params, res).fail(rej);
  });
});


//+posts :: Object -> Future(Error, [Post])
const posts = compose(map(sortBy('date')), getJSON('/posts'))

posts({}).fork(logError, renderView)

//+ fiveLines :: String -> String
const fiveLines = compose(join('\n'), take(5), split('\n'))

//+ previewFile :: String -> Future(Error, String)
const previewFile = compose(map(append('...')), map(fiveLines), readFile)

previewFile('story.epub').fork(logError, printLines)

```

#### Control Flow

What about control flow (running several Future returning functions in a pipeline) and error handling?

Well, `chain` can help here where the functions are promise returning.

See the functor, monaod survival guide at the end of this readme for further info.

Lets look at a couple of examples:

#### Successful chain

```js
const R = require('ramda'),
  chain = R.chain,
  compose = R.compose,
  Task = require('data.task');

//+ findUser :: Number -> Future(User)
const findUser = id => {
  console.log(`findUser invoked with ${id}`);
  return Task.of({id: id, name: 'harry'});
};

//+ getFriends :: User -> Future([User])
const getFriends = user => {
  console.log(`getFriends invoked with ${JSON.stringify(user)}`);
  return Task.of([{id: 2, name: 'bob'}, {id: 3, name: 'tracy'}]);
};

//+ renderTemplate :: [User] -> Future(String)
const renderTemplate = users => {
  console.log(`renderTemplate invoked with ${JSON.stringify(users)}`);
  return Task.of(JSON.stringify(users));
};

```

And we can call these functions as follows:

```js
 //+ friendPage :: Number -> Future(String)
const friendPage = compose(chain(renderTemplate), chain(getFriends), findUser);

const errFn = err => console.error(err);
const successFn = data => {
  console.log(data);
  expect(data).to.eql('[{"id":2,"name":"bob"},{"id":3,"name":"tracy"}]')
};

friendPage(1).fork(errFn, successFn);

//=> findUser invoked with 1
//=> getFriends invoked with {"id":1,"name":"harry"}
//=> renderTemplate invoked with [{"id":2,"name":"bob"},{"id":3,"name":"tracy"}]
//=> [{"id":2,"name":"bob"},{"id":3,"name":"tracy"}]

```

As you can see, first we called findUser, then passed the result of that into getFriends, and finally passed the result
of that into renderTemplate to get our final result by forking our returned Future. And all of this happened inside Future returning functions!

#### What about errors?

In the above scenario, lets say we have an error in one of our functions as follows:

```js
//+ getFriends :: User -> Future([User])
const getFriendsError = user => {
  console.log(`getFriends invoked with ${JSON.stringify(user)}`);
  return Task.of([]).rejected("Something went wrong");
};
```

Then we carry out the same calls as before:

```js
//+ friendPage :: Number -> Future(String)
const friendPage = compose(chain(renderTemplate), chain(getFriendsError), findUser);

const errFn = err => {
  console.error(err);
  expect(err).to.eql('Something went wrong');
};

const successFn = data => {
  expect(false).to.eql(true);
  console.log(data);
};

friendPage(1).fork(errFn, successFn);

//=> findUser invoked with 1
//=> getFriends invoked with {"id":1,"name":"harry"}
//=> Something went wrong

```

Notice how the error gets propagated to the fork, and subsequent functions in the chain pipeline are not executed.
Pretty cool hey!


#### What about Parallel execution?

If you are looking for something like [Q.all](https://github.com/kriskowal/q#combination) then this is easily achieved by
leveraging the Ramda traverse function.

```js
traverse(Future.of, getPost, [{id: 1}, {id: 2}]);
//=> Future([Post, Post])
```

This works something like Q.all but this one is much more general, much more principled.
Because mapping array and Future same, we can commute future and array are two different
functors and we commute them (flip the order).

What does this buy us? Well now we have one future and an array of reuslts, it is easy to know when the future has
completed and can process the results. Contrast that with an array of Futures!


#### Functor, Applicative Functor, and Monad Survival Guide

Here is a sort of survival guide to getting started with functional programming and alegbraic data types.

Future is an algebraic data type, and hence it is instructive to understand the principles upon which it is based
in order to better understand this library and how best to use it.

Here we use Ramda and Ramda-Fantasy - really illustrates simple usage of `map`, `ap`, and `chain` as they can be used with `Maybe`.

So here are the essentials to know (this focuses on usage of existing Monads in the ramda-fantasy package with ramda, and therefore does not indicate what rules need to be followed to roll your own monads etc):


```js

const chai = require('chai'),
  expect = chai.expect,
  R = require('ramda'),
  map = R.map,
  lift = R.lift,
  identity = R.identity,
  chain = R.chain,
  unnest = R.unnest,
  RF = require('ramda-fantasy'),
  Maybe = RF.Maybe,
  add = R.add;

describe('various uses of map, ap, and chain', () => {

  // functors are for things that can be mapped over
  // implement .map()
  // point free ramda equivalent is map

  // applicative functors are enhanced functors - they
  // allow us to apply normal functions between applicative values
  // implement .ap()
  // point free ramda equivalent is lift

  // monads are enhanced applicative functors which add the ability
  // for applicative values to be fed into normal functions
  // implement .chain()
  // point free ramda equivalents are unnest and chain


  // So every monad is an applicative functor, and every applicative functor
  // is a functor.

  // lets see chained and point free ways of invoking these in action


  describe('map, ap, chain equivalence', () => {

    it('should be possible to map over a Maybe applying an inc function', () => {

      const inc = add(1);

      // map point-free with ramda:
      expect(map(inc, Maybe(1))).to.eql(Maybe(2));
      // or:
      expect(Maybe(1).map(inc)).to.eql(Maybe(2));

      const addA = lift(add);

      // equivalent to using ap point-free with ramda:
      expect(addA(Maybe(1), Maybe(1))).to.eql(Maybe(2));
      // or:
      expect(Maybe(inc).ap(Maybe(1))).to.eql(Maybe(2));


      const incM = function (x) {
        return Maybe(inc(x));
      };

      // equivalent to using chain point-free with ramda:
      expect(chain(incM, Maybe(1))).to.eql(Maybe(2));
      // or:
      expect(Maybe(1).chain(incM)).to.eql(Maybe(2));

    });

  });

  describe('unnest / chain for unnesting', () => {

    it('should deal with unnesting using unnest and chain identity', () => {

      const nestedOne = Maybe(Maybe(1));

      // point free using ramda:
      expect(unnest(nestedOne)).to.eql(Maybe(1));

      // alternative point free using ramda:
      expect(chain(identity, nestedOne)).to.eql(Maybe(1));

      // explicitly
      expect(nestedOne.chain(identity)).to.eql(Maybe(1));

    });

  });


  describe('ap', () => {

    it('should work with ap - just pass a standard a -> b function, and ap' +
      'will handle the map process for you', () => {

      const add2 = add(2);

      // explicitly
      expect(Maybe(add2).ap(Maybe(2))).to.eql(Maybe(4));

      // equivalent to writing your own function, something like this:
      const customAdd2 = function (x) {
        return x + 2;
      };

      expect(Maybe(customAdd2).ap(Maybe(2))).to.eql(Maybe(4));

      // point free using ramda:
      expect(lift(add)(Maybe(2), Maybe(2))).to.eql(Maybe(4));

    });

  });


  describe('chain', () => {

    it('should result in Nothing when chaining with Nothing', () => {
      const Nothing = Maybe.Nothing(null);
      const Just = Maybe.Just('a');
      expect(Nothing.chain(Just)).to.eql(Nothing);
    });

    it('should add another maybe', () => {
      const addMaybe3 = function (x) {
        return map(add(x), Maybe(3));
      };
      expect(Maybe(2).chain(addMaybe3)).to.eql(Maybe(5));
    });

  });

});

```

Please feel free to contact me directly if you have any questions. Otherwise, please visit [Ramda](http://ramdajs.com/0.19.1/index.html) and join the ramda community on Gitter there too. There is always at least a handful of people there who are more than happy to discuss this subject!


## License

MIT © [arcseldon](http://arcseldon.surge.sh)
