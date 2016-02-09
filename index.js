/**
 * @fileoverview TinyIterator definition.
 * @author Nathan Buchar
 */

'use strict';

/**
 * Iterates over an array. For each value in the array, we pass it and a
 * "done" callback function into the intermediate function (fn). Here, we can
 * run any synchronous or asynchronous code, then when we are finished we call
 * the "done" callback to move to the next item in the array.
 *
 * This essentially allows us to optionally execute asynchronous code
 * synchronously for every item in an array of an unknown length.
 *
 * @param {Array} arr - The array to iterate through.
 * @param {Function} fn - The intermediate function.
 * @param {Function} [done] - Called when all iterations have completed.
 */
function iterate (items, fn, done) {
  let aborted = false;

  /**
   * Abort handler. Updates the value and calls the done function.
   *
   * @param {number} i
   * @returns {Function}
   */
  function abort(i) {
    return function (newVal) {
      aborted = true;

      updateVal(i, newVal);
      done(items);
    }
  };

  /**
   * The `next` handler.
   *
   * @param {number} i
   * @returns {Function}
   */
  function next(i) {
    _next.abort = abort(i);

    function _next(newVal) {
      if (!aborted) {
        updateVal(i++, newVal);

        if (i < items.length) {
          iterator(i);
        } else if (done) {
          done(items);
        }
      }
    }

    return _next;
  };

  /**
   * Updates the value of an item in the array.
   *
   * @param {number} i
   * @param {mixed} newVal
   */
  function updateVal(i, newVal) {
    if (typeof newVal !== 'undefined') {
      items[i] = newVal;
    }
  }

  /**
   * The iterator definition.
   *
   * @param {number} i
   */
  function iterator(i) {
    fn(i, items[i], next(i));
  }

  iterator(0);
}

module.exports = iterate;
