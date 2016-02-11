/**
 * Shiterate module definition.
 *
 * @module shiterate
 * @exports {Class} Shiterate
 * @author Nathan Buchar <hello@nathanbuchar.com>
 * @license MIT
 */

'use strict';

/**
 * Performs no operation. Dummy function.
 */
function noop() {}

/**
 * Represents a Shiterator.
 */
class Shiterate {

  /**
   * Creates the Shiterate instance.
   *
   * @param {Array} array - The array to query.
   * @param {Function} iteratee - The function invoked per iteration.
   * @param {Function} [done] - The function invoked when finished.
   */
  constructor(array, iteratee, done) {

    /**
     * Internal reference to the array to query.
     *
     * @type {Array}
     * @private
     */
    this._array = array.slice(0);

    /**
     * Internal reference to the function invoked per iteration.
     *
     * @type {Function}
     * @private
     */
    this._iteratee = iteratee;

    /**
     * Internal reference to the function invoked when finished.
     *
     * @type {Function}
     * @private
     */
    this._done = done || noop;

    /**
     * Whether or not we have aborted the iterator. This helps ensure that we
     * don't continue to iterate if the user has implemented the "next" method
     * incorrectly. For example, if they write a next.abort() without returning
     * followed by a next(). No good.
     *
     * @type {boolean}
     * @default false
     * @private
     */
    this._isAborted = false;

    this._init();
  }

  /**
   * Instantiates the Shiterate instance.
   *
   * @private
   */
  _init() {
    this._validateArray();
    this._validateIteratee();
    this._validateDone();

    // Start the iteration process, starting at index 0.
    if (this._array.length) {
      this._iterate(0);
    } else {
      this._finish();
    }
  }

  /**
   * Validates that the "array" param is valid.
   *
   * @throws
   * @private
   */
  _validateArray() {
    if (!Array.isArray(this._array)) {
      throw new TypeError(
        '"array" must be an array. Got "' + typeof this._array + '"');
    }
  }

  /**
   * Validates that the "iteratee" parameter is valid.
   *
   * @throws
   * @private
   */
  _validateIteratee() {
    if (typeof this._iteratee !== 'function') {
      throw new TypeError(
        '"iteratee" must be a function. Got "' + typeof this._iteratee + '"');
    }
  }

  /**
   * Validates that the "done" param is valid, if defined.
   *
   * @throws
   * @private
   */
  _validateDone() {
    if (typeof this._done !== 'undefined') {
      if (typeof this._done !== 'function') {
        throw new TypeError(
          '"done" must be a function. Got "' + typeof this._done + '"');
      }
    }
  }

  /**
   * Invokes the iteratee and passes the index, value, and "next" callback.
   *
   * @param {number} n
   * @private
   */
  _iterate(n) {
    this._iteratee(this._array[n], n, this._step(n));
  }

  /**
   * Creates the public-facing next callback tailored to the current index.
   *
   * @param {number} n
   * @returns {Function}
   * @private
   */
  _step(n) {
    let next = this._next(n);

    next.abort = this._abort(n);

    return next;
  }

  /**
   * The returned function is called when "next" is invoked. Changes the value
   * of the current item, then iterates to the next array item or terminates if
   * it's reached the end.
   *
   * @param {number} n
   * @returns {Function}
   * @private
   */
  _next(n) {
    return newValue => {
      if (!this._isAborted) {
        this._updateVal(n++, newValue);

        if (n < this._array.length) {
          this._iterate(n);
        } else {
          this._finish();
        }
      }
    };
  }

  /**
   * Updates the value of the item and the given index.
   *
   * @param {number} n
   * @param {mixed} [newValue]
   * @private
   */
  _updateVal(n, newValue) {
    if (typeof newValue !== 'undefined') {
      this._array[n] = newValue;
    }
  }

  /**
   * Wraps the public-facing abort function. The returned function is called
   * when the user aborts the iteration.
   *
   * @param {number} n
   * @returns {Function}
   * @private
   */
  _abort(n) {
    return newValue => {
      this._isAborted = true;

      this._updateVal(n, newValue);
      this._finish();
    };
  }

  /**
   * Called when the iteration has finished naturally or was aborted. Calls
   * the done method.
   *
   * @private
   */
  _finish() {
    this._done(this._array);
  }
}

module.exports = Shiterate;
