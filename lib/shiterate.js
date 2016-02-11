/**
 * Shiterate module definition.
 *
 * @module shiterate
 * @exports {Function}
 * @author Nathan Buchar <hello@nathanbuchar.com>
 * @license MIT
 */

'use strict';

module.exports = function (array, iteratee, done) {

  /**
   * Validate that the "array" parameter is an array.
   *
   * @throws
   */
  if (!Array.isArray(array)) {
    throw new TypeError(
      '"array" must be an array. Got "' + typeof array + '"');
  }

  /**
   * Validate that the "iteratee" parameter is a function.
   *
   * @throws
   */
  if (typeof iteratee !== 'function') {
    throw new TypeError(
      '"iteratee" must be a function. Got "' + typeof iteratee + '"');
  }

  /**
   * Validate that the "done" parameter is a function, if it is defined.
   *
   * @throws
   */
  if (done && typeof done !== 'function') {
    throw new TypeError(
      '"done" must be a function. Got "' + typeof done + '"');
  }

  /**
   * Internal reference to the sliced array that we will be querying.
   *
   * @type {Array}
   * @private
   */
  let _sliced = array.slice(0);

  /**
   * Internal reference to the function invoked per iteration.
   *
   * @type {Function}
   * @private
   */
  let _iteratee = iteratee;

  /**
   * Internal reference to the function invoked when finished.
   *
   * @type {Function}
   * @private
   */
  let _done = done;

  /**
   * Initializes the shiterator. :poop:
   *
   * @see _iterate
   * @see _finish
   * @returns {Function}
   * @private
   */
  function _init() {
    if (_sliced.length) {
      return _iterate(0);
    } else {
      return _finish();
    }
  }

  /**
   * Invokes the given iteratee with the current array index, value, and the
   * "next" Object tailored to the current index.
   *
   * @see _step
   * @param {number} n
   * @returns {Function}
   * @private
   */
  function _iterate(n) {
    return _iteratee(_sliced[n], n, _step(n));
  }

  /**
   * Creates the "next" Object that is tailored to the current index.
   *
   * @see _next
   * @see _abort
   * @param {number} n
   * @returns {Object} next
   * @private
   */
  function _step(n) {
    let next;

    next = _next(n);
    next.abort = _abort(n);

    return next;
  }

  /**
   * Updates the value of the current item, then iterates to the next array item
   * or terminates if it's reached the end.
   *
   * @see _updateValue
   * @param {number} n
   * @returns {Function}
   * @private
   */
  function _next(n) {
    return _updateValue(n++, () => {
      if (n < array.length) {
        return _iterate(n);
      } else {
        return _finish();
      }
    });
  }

  /**
   * Updates the value of the current item, then terminates the iterator.
   *
   * @see _updateValue
   * @param {number} n
   * @returns {Function}
   * @private
   */
  function _abort(n) {
    return _updateValue(n++, () => {
      return _finish();
    });
  }

  /**
   * Updates the value of the array item at the given index.
   *
   * @param {number} n
   * @param {Function} fn
   * @returns {Function}
   * @private
   */
  function _updateValue(n, fn) {
    return newValue => {
      if (typeof newValue !== 'undefined') {
        _sliced[n] = newValue;
      }

      fn();
    };
  }

  /**
   * Final exit point for the iteration, whether it was terminated or not. Calls
   * the "done" callback if it was defined.
   *
   * @returns {Function} _done
   * @private
   */
  function _finish() {
    if (_done) {
      return _done(_sliced);
    }
  }

  _init();
};
