'use strict';
const Promise = require('bluebird');

/**
 * Returns a throttled function with which only one call may be running at a time.
 * Repeat calls to function are added to a queue which will be executed one at a time.
 * Further calls wait for the previous to complete before executing.
 *
 * @param {Function} func - function to be throttled
 * @param {number} wait - millisec
 */
module.exports = function throttlePromise(func) {
  const queue = [];
  let executing = false;

  return function() {
    const promise = new Promise((resolve, reject) => {
      queue.push({ resolve, reject, arguments });
      if (!executing) {
        execute();
      }
    });

    return promise;
  };

  // Execute promises in queue one at a time
  function execute() {
    if (!queue.length) {
      executing = false;
      return;
    }

    executing = true;
    const task = queue.shift();
    const args = task.arguments;

    func(...args)
      .then(response => {
        task.resolve(response);
        if (queue.length) {
          return execute();
        }
        executing = false;
      }).catch(err => {
        executing = false;
        task.reject(err);
      });
  }
};
