/**
 * Public interface for Shiterate.
 *
 * @module index
 * @exports {Function} shiterate
 * @author Nathan Buchar <hello@nathanbuchar.com>
 * @license MIT
 */

'use strict';

const Shiterate = require('./lib/shiterate');

module.exports = function shiterate(items, fn, done) {
  new Shiterate(items, fn, done);
};
