/**
 * @fileoverview Mocha test specs for Shiterate.
 * @author Nathan Buchar
 */

/* global it, describe, before, after, beforeEach, afterEach */

'use strict';

const chai = require('chai');

const shiterate = require('../');

/**
 * Chai assertion shorthands.
 */
let expect = chai.expect;
let should = chai.should();

describe('shiterate', () => {

  describe('inteface', () => {

    it('should not throw if "done" is not defined', () => {
      try {
        shiterate([0, 1, 2], (value, n, next) => {
          return next();
        });
      } catch (err) {
        should.not.exist(err);
      }
    });

    it('should not throw if "array" is empty', done => {
      try {
        shiterate([], (value, n, next) => {
          return next();
        }, values => {
          should.exist(values);
          expect(values.length).to.equal(0);
          done();
        });
      } catch (err) {
        should.not.exist(err);
      }
    });

    it('should throw if "array" is not an array', () => {
      try {
        shiterate('not an array', (value, n, next) => {
          return next();
        });
      } catch (err) {
        should.exist(err);

        expect(err.toString()).to.contain('"array" must be an array.');
      }
    });

    it('should throw if "iteratee" is not a function', () => {
      try {
        shiterate([0, 1, 2], 'not a function');
      } catch (err) {
        should.exist(err);

        expect(err.toString()).to.contain('"iteratee" must be a function.');
      }
    });

    it('should throw if "done" exists and is not a function', () => {
      try {
        shiterate([0, 1, 2], (value, n, next) => {
          return next();
        }, 'not a function');
      } catch (err) {
        should.exist(err);

        expect(err.toString()).to.contain('"done" must be a function.');
      }
    });

    it('should allow for nested shiterations', done => {
      let iValues = ['a', 'b', 'c'];
      let jValues = ['x', 'y', 'z'];

      shiterate(iValues, (iValue, iN, iNext) => {
        shiterate(jValues, (jValue, jN, jNext) => {
          return jNext(iValue + jValue);
        }, jValuesDone => {
          // Expect [(a|b|c)x, (a|b|c)x, (a|b|c)x]
          for (var x = 0; x < jValuesDone.length; x++) {
            expect(jValuesDone[x]).to.equal(iValues[iN] + jValues[x]);
          }

          return iNext();
        });
      }, iValuesDone => {
        // Expect [a, b, c]
        for (var x = 0; x < iValuesDone.length; x++) {
          expect(iValuesDone[x]).to.equal(iValues[x]);
        }

        done();
      });
    });
  });

  describe('next', () => {

    it('should step to the next iteration', done => {
      let step = 0;

      shiterate([0, 1, 2], (value, n, next) => {
        step++;
        return next();
      }, () => {
        expect(step).to.equal(3);
        done();
      });
    });

    it('should wait for "next" before stepping to the next iteration', done => {
      let step = 0;

      shiterate([0, 1, 2], (value, n, next) => {
        step++;

        setTimeout(() => {
          expect(step).to.equal(n + 1);
          return next();
        }, 100);
      }, () => {
        done();
      });
    });

    it('should update the value of the current item', done => {
      let arr = [0, 1, 2];

      shiterate(arr, (value, n, next) => {
        return next(value + 1);
      }, values => {
        should.exist(values);

        expect(values).to.have.length(3);
        expect(values[0]).to.equal(0 + 1);
        expect(values[1]).to.equal(1 + 1);
        expect(values[2]).to.equal(2 + 1);
        done();
      });
    });

    it('should slices the orginal array', done => {
      let arr = [0, 1, 2];

      shiterate(arr, (value, n, next) => {
        return next(value + 1);
      }, values => {
        should.exist(values);

        expect(values).to.have.length(3);
        expect(values[0]).to.not.equal(arr[0]);
        expect(values[1]).to.not.equal(arr[1]);
        expect(values[2]).to.not.equal(arr[2]);
        done();
      });
    });

    it('should allow for continued execution if "next" is outside of asynchronous code', done => {
      let step = 0;
      let count = 0;

      shiterate([0, 1, 2], (value, n, next) => {
        step++;

        setTimeout(() => {
          count++;

          // Step should equal 3 in all cases because this function body will
          // always run after all steps have been iterated.
          expect(step).to.equal(3);

          if (count === 3) {
            done();
          }
        }, 100);

        return next();
      }, () => {
        expect(step).to.equal(3);
        expect(count).to.equal(0);
      });
    });

    it('should allow for continued execution if "next" is not returned', done => {
      let step = 0;
      let count = 0;

      shiterate([0, 1, 2], (value, n, next) => {
        step++;

        // Note that "next" is not returned.
        next();

        setTimeout(() => {
          count++;

          // Step should equal 3 in all cases because this function body will
          // always run after all steps have been iterated.
          expect(step).to.equal(3);

          if (count === 3) {
            done();
          }
        }, 100);
      }, () => {
        expect(step).to.equal(3);
        expect(count).to.equal(0);
      });
    });
  });

  describe('abort', () => {

    it('should immediately abort the iteration when invoked', done => {
      shiterate([0, 1, 2], (value, n, next) => {
        expect(n).to.not.equal(1);
        expect(n).to.not.equal(2);

        return next.abort();
      }, () => {
        done();
      });
    });

    it('should update the value of the current item', done => {
      shiterate([0, 1, 2], (value, n, next) => {
        return next.abort(value + 1);
      }, values => {
        should.exist(values);

        expect(values).to.have.length(3);
        expect(values[0]).to.equal(0 + 1);
        expect(values[1]).to.equal(1);
        expect(values[2]).to.equal(2);
        done();
      });
    });
  });

  describe('done', () => {

    it('should send the sliced array as a parameter', done => {
      shiterate([0, 1, 2], (value, n, next) => {
        return next();
      }, values => {
        should.exist(values);

        expect(values).to.have.length(3);
        expect(values[0]).to.equal(0);
        expect(values[1]).to.equal(1);
        expect(values[2]).to.equal(2);
        done();
      });
    });

    it('should send the updated sliced array as a parameter', done => {
      shiterate([0, 1, 2], (value, n, next) => {
        return next(value + 1);
      }, values => {
        should.exist(values);

        expect(values).to.have.length(3);
        expect(values[0]).to.equal(0 + 1);
        expect(values[1]).to.equal(1 + 1);
        expect(values[2]).to.equal(2 + 1);
        done();
      });
    });
  });
});
