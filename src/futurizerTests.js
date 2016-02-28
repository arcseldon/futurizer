// author arcseldon@icloud.com
'use strict';
/*eslint no-unused-expressions:0*/

const chai = require('chai'),
  expect = chai.expect,
  Q = require('q'),
  F = require('./futurizer'),
  future = F.futurizer,
  futureP = F.futurizerP,
  _ = () => {
    throw Error('Unexpected');
  },
  toExpect = (expected, done) => res => {
    expect(res).to.eql(expected);
    done();
  };

describe('futurizer and futurizerP', () => {

  it('should exercise failure test function', () => {
    expect(_).to.throw(Error, /Unexpected/);
  });

  it('should produce expected result using successful callback', done => {

    const helloAsync = (name, cb) => {
      setTimeout(() => {
        return cb(null, `Hello, ${name}`);
      }, 0);
    };

    const hello = future(helloAsync);

    hello('futurizer!!!!').fork(_, toExpect('Hello, futurizer!!!!', done));

  });

  it('should produce expected error using failed callback', done => {

    const helloAsync = (name, cb) => {
      setTimeout(() => {
        return cb(name);
      }, 0);
    };

    const hello = future(helloAsync);

    hello('Reaper').fork(toExpect('Reaper', done), _);

  });

  it('should produce expected result using successful promise', done => {

    const helloPromise = (name) => {
      return Q.fcall(() => {
        return `Hello, ${name}`;
      });
    };

    const hello = futureP(helloPromise);

    hello('futurizer!!!!').fork(_, toExpect('Hello, futurizer!!!!', done));

  });

  it('should produce expected error using failed promise', done => {

    const helloPromise = (name) => {
      return Q.fcall(() => {
        throw new Error(`${name}`);
      });
    };

    const hello = futureP(helloPromise);

    hello('Reaper').fork(toExpect(Error('Reaper'), done), _);

  });

});

