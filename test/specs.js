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
        shiterate([0, 1, 2], (i, item, next) => {
          return next();
        });
      } catch (err) {
        should.not.exist(err);
      }
    });

    it('should not throw if "items" is empty', done => {
      try {
        shiterate([], (i, item, next) => {
          return next();
        }, items => {
          should.exist(items);
          expect(items.length).to.equal(0);
          done();
        });
      } catch (err) {
        should.not.exist(err);
      }
    });

    it('should throw if "items" is not an array', () => {
      try {
        shiterate('not an array', (i, item, next) => {
          return next();
        });
      } catch (err) {
        should.exist(err);

        expect(err.toString()).to.contain('"items" must be an array.');
      }
    });

    it('should throw if "fn" is not a function', () => {
      try {
        shiterate([0, 1, 2], 'not a function');
      } catch (err) {
        should.exist(err);

        expect(err.toString()).to.contain('"fn" must be a function.');
      }
    });

    it('should throw if "done" exists and is not a function', () => {
      try {
        shiterate([0, 1, 2], (i, item, next) => {
          return next();
        }, 'not a function');
      } catch (err) {
        should.exist(err);

        expect(err.toString()).to.contain('"done" must be a function.');
      }
    });

    it('should allow nested shiterations', done => {
      let iItems = ['a', 'b', 'c'];
      let jItems = ['x', 'y', 'z'];

      shiterate(iItems, (i, iItem, iNext) => {
        shiterate(jItems, (j, jItem, jNext) => {
          return jNext(iItem + jItem);
        }, jItemsDone => {
          // Expect [(a|b|c)x, (a|b|c)x, (a|b|c)x]
          for (var x = 0; x < jItemsDone.length; x++) {
            expect(jItemsDone[x]).to.equal(iItems[i] + jItems[x]);
          }

          return iNext();
        });
      }, iItemsDone => {
        // Expect [a, b, c]
        for (var x = 0; x < iItemsDone.length; x++) {
          expect(iItemsDone[x]).to.equal(iItems[x]);
        }

        done();
      });
    });
  });

  describe('next', () => {

    it('should step to the next iteration', done => {
      let step = 0;

      shiterate([0, 1, 2], (i, item, next) => {
        step++;
        return next();
      }, () => {
        expect(step).to.equal(3);
        done();
      });
    });

    it('should wait for "next" before stepping to the next iteration', done => {
      let step = 0;

      shiterate([0, 1, 2], (i, item, next) => {
        step++;

        setTimeout(() => {
          expect(step).to.equal(i + 1);
          return next();
        }, 100);
      }, () => {
        done();
      });
    });

    it('should update the value of the current item', done => {
      let arr = [0, 1, 2];

      shiterate(arr, (i, item, next) => {
        return next(item + 1);
      }, items => {
        should.exist(items);

        expect(items).to.have.length(3);
        expect(items[0]).to.equal(0 + 1);
        expect(items[1]).to.equal(1 + 1);
        expect(items[2]).to.equal(2 + 1);
        done();
      });
    });

    it('should not update the values of the orginal array', done => {
      let arr = [0, 1, 2];

      shiterate(arr, (i, item, next) => {
        return next(item + 1);
      }, items => {
        should.exist(items);

        expect(items).to.have.length(3);
        expect(items[0]).to.not.equal(arr[0]);
        expect(items[1]).to.not.equal(arr[1]);
        expect(items[2]).to.not.equal(arr[2]);
        done();
      });
    });

    it('should allow for continued execution if "next" is outside of asynchronous code', done => {
      let step = 0;
      let count = 0;

      shiterate([0, 1, 2], (i, item, next) => {
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

      shiterate([0, 1, 2], (i, item, next) => {
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

    it('should immediately abort the iteration when called', done => {
      shiterate([0, 1, 2], (i, item, next) => {
        expect(i).to.not.equal(1);
        expect(i).to.not.equal(2);

        return next.abort();
      }, () => {
        done();
      });
    });

    it('should not iterate if "next" is called after "abort"', done => {
      shiterate([0, 1, 2], (i, item, next) => {
        expect(i).to.not.equal(1);
        expect(i).to.not.equal(2);

        // Don't ever do this, please.
        next.abort();
        next();
      }, () => {
        done();
      });
    });

    it('should update the value of the current item', done => {
      shiterate([0, 1, 2], (i, item, next) => {
        return next.abort(item + 1);
      }, items => {
        should.exist(items);

        expect(items).to.have.length(3);
        expect(items[0]).to.equal(0 + 1);
        expect(items[1]).to.equal(1);
        expect(items[2]).to.equal(2);
        done();
      });
    });
  });

  describe('done', () => {

    it('should send the items array as an argument', done => {
      shiterate([0, 1, 2], (i, item, next) => {
        return next();
      }, items => {
        should.exist(items);

        expect(items).to.have.length(3);
        expect(items[0]).to.equal(0);
        expect(items[1]).to.equal(1);
        expect(items[2]).to.equal(2);
        done();
      });
    });

    it('should send the updated items as an argument', done => {
      shiterate([0, 1, 2], (i, item, next) => {
        return next(item + 1);
      }, items => {
        should.exist(items);

        expect(items).to.have.length(3);
        expect(items[0]).to.equal(0 + 1);
        expect(items[1]).to.equal(1 + 1);
        expect(items[2]).to.equal(2 + 1);
        done();
      });
    });
  });
});
