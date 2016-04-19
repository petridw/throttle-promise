'use strict';
const expect = require('chai').expect;
const throttlePromise = require('../');
const Promise = require('bluebird');

describe('throttlePromise', () => {
  it('executes task', () => {
    let called = false;
    const func = throttlePromise(() => new Promise((resolve) => {
      called = true;
      resolve();
    }));
    return func().then(() => {
      expect(called).to.be.true;
    });
  });

  it('executes all added tasks', () => {
    const obj = {};
    const func = throttlePromise((key) => new Promise((resolve) => {
      obj[key] = true;
      resolve();
    }));
    const promises = [];
    for (let i = 0; i < 10; i ++) {
      promises.push(func(i));
    }
    return Promise.all(promises)
      .then(() => {
        for (let i = 0; i < 10; i ++) {
          expect(obj[i]).to.be.true;
        }
      });
  });

  it('executes queued promises in correct order', () => {
    const arr = [];
    const func = throttlePromise((key, delay) => new Promise((resolve) => {
      setTimeout(() => {
        arr.push(key);
        resolve();
      }, delay);
    }));
    const promises = [];
    for (let i = 0; i < 10; i ++) {
      promises.push(func(i, 50 - (i * 5)));
    }
    return Promise.all(promises)
      .then(() => {
        for (let i = 0; i < 10; i ++) {
          expect(arr[i]).to.equal(i);
        }
      });
  });
});
