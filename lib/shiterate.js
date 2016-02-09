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

class Shiterate {

  /**
   * Creates the Shiterate instance.
   *
   * @param {Array} items - The array of items.
   * @param {Function} fn - The intermediate function.
   * @param {Function} [done] - The callback function.
   */
  constructor(items, fn, done) {

    /**
     * The array of items the user wishes to iterate through.
     *
     * @type {Array}
     * @default null
     * @private
     */
    this._items = null;

    /**
     * The intermediate function that all items will pass through.
     *
     * @type {Function}
     * @default null
     * @private
     */
    this._fn = null;

    /**
     * The callback function that will be called when all items have been
     * iterated through
     *
     * @type {Function}
     * @default null
     * @private
     */
    this._done = null;

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

    this._init(items, fn, done);
  }

  /**
   * Instantiates the Shiterate instance.
   *
   * @param {Array} items - The array of items.
   * @param {Function} fn - The intermediate function.
   * @param {Function} [done] - The callback function.
   * @private
   */
  _init(items, fn, done) {
    this._items = this._validateItemsParam(items);
    this._fn = this._validateFnParam(fn);
    this._done = this._validateDoneParam(done);

    // Start the iteration process, starting at index 0.
    if (this._items.length) {
      this._iterate(0);
    } else {
      this._finish();
    }
  }

  /**
   * Validates that the items param is an array.
   *
   * @param {Array} items
   * @returns {Array}
   * @throws
   */
  _validateItemsParam(items) {
    if (!Array.isArray(items)) {
      throw new TypeError(
        '"items" must be an array. Got "' + typeof items + '"');
    }

    // Return a clone.
    return items.slice(0);
  }

  /**
   * Validates that the fn param is a function.
   *
   * @param {Function} fn
   * @returns {Function} fn
   * @throws
   */
  _validateFnParam(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError(
        '"fn" must be a function. Got "' + typeof fn + '"');
    }

    return fn;
  }

  /**
   * Validates that the done param is a function, if it exists.
   *
   * @param {Function} done
   * @returns {Function} done
   * @throws
   */
  _validateDoneParam(done) {
    if (typeof done !== 'undefined') {
      if (typeof done !== 'function') {
        throw new TypeError(
          '"done" must be a function. Got "' + typeof done + '"');
      }

      return done;
    }

    return noop;
  }

  /**
   * Calls the intermediary function with the item at the current index. This
   * method is called recursively with incrementing indeces.
   *
   * @param {number} i
   * @private
   */
  _iterate(i) {
    this._fn(i, this._items[i], this._step(i));
  }

  /**
   * Wraps the public-facing next function. When the returned function is
   * called, we update the value of the current item, then iterate to the next
   * item if we haven't reached the end, otherwise call the finish method.
   *
   * @param {number} i
   * @returns {Function}
   * @private
   */
  _step(i) {
    let next = this._next(i);

    next.abort = this._abort(i);

    return next;
  }

  /**
   * Logic performed after calling "next". Updates the value of the current
   * item, then iterates to the next item or terminates.
   *
   * @param {number} i
   * @returns {Function}
   * @private
   */
  _next(i) {
    return newVal => {
      if (!this._isAborted) {
        this._updateVal(i++, newVal);

        if (i < this._items.length) {
          this._iterate(i);
        } else {
          this._finish();
        }
      }
    };
  }

  /**
   * Updates the value of the item and the given index.
   *
   * @param {number} i
   * @param {mixed} [newVal]
   * @private
   */
  _updateVal(i, newVal) {
    if (typeof newVal !== 'undefined') {
      this._items[i] = newVal;
    }
  }

  /**
   * Wraps the public-facing abort function. The returned function is called
   * when the user aborts the iteration.
   *
   * @param {number} i
   * @returns {Function}
   * @private
   */
  _abort(i) {
    return newVal => {
      this._isAborted = true;

      this._updateVal(i, newVal);
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
    this._done(this._items);
  }
}

module.exports = Shiterate;
