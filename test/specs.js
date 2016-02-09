/**
 * @fileoverview Mocha test specs.
 * @author Nathan Buchar
 */

/* global it, describe, before, after, beforeEach, afterEach */

'use strict';

const chai = require('chai');

const iterate = require('../').iterate;

/**
 * Chai assertion shorthands.
 */
let expect = chai.expect;
let should = chai.should();

describe('iterate', () => {

  describe('inteface', () => {

    it('should not throw if "done" is not defined', () => {
      try {
        iterate([0, 1, 2], (i, item, next) => {
          return next();
        });
      } catch (err) {
        should.not.exist(err);
      }
    });

    it('should not throw if "items" is empty', () => {
      try {
        iterate([], (i, item, next) => {
          return next();
        }, items => {
          should.exist(items);

          expect(items.length).to.equal(0);
        });
      } catch (err) {
        should.not.exist(err);
      }
    });

    it('should throw if "items" is not an array', () => {
      try {
        iterate('not an array', (i, item, next) => {
          return next();
        });
      } catch (err) {
        should.exist(err);

        expect(err.toString()).to.contain('"items" must be an array.');
      }
    });

    it('should throw if "fn" is not a function', () => {
      try {
        iterate([0, 1, 2], 'not a function');
      } catch (err) {
        should.exist(err);

        expect(err.toString()).to.contain('"fn" must be a function.');
      }
    });

    it('should throw if "done" exists and is not a function', () => {
      try {
        iterate([0, 1, 2], (i, item, next) => {
          return next();
        }, 'not a function');
      } catch (err) {
        should.exist(err);

        expect(err.toString()).to.contain('"done" must be a function.');
      }
    });
  });

  describe('next', () => {

    it('should step to the next iteration', () => {
      let step = 0;

      iterate([0, 1, 2], (i, item, next) => {
        step++;
        return next();
      }, () => {
        expect(step).to.equal(3);
      });
    });

    it('should wait for "next" before stepping to the next iteration', () => {
      let step = 0;

      iterate([0, 1, 2], (i, item, next) => {
        step++;

        setTimeout(() => {
          expect(step).to.equal(i + 1);
        }, 100);
      });
    });

    it('should update the value of the current item', () => {
      iterate([0, 1, 2], (i, item, next) => {
        return next(item + 1);
      }, items => {
        should.exist(items);

        expect(items).to.have.length(3);
        expect(items[0]).to.equal(0 + 1);
        expect(items[1]).to.equal(1 + 1);
        expect(items[2]).to.equal(2 + 1);
      });
    });
  });

  describe('abort', () => {

    it('should immediately abort the iteration when called', () => {
      iterate([0, 1, 2], (i, item, next) => {
        expect(i).to.not.equal(1);
        expect(i).to.not.equal(2);

        return next.abort();
      });
    });

    it('should not iterate if "next" is called after "abort"', () => {
      iterate([0, 1, 2], (i, item, next) => {
        expect(i).to.not.equal(1);
        expect(i).to.not.equal(2);

        // Don't ever do this, please.
        next.abort();
        next();
      });
    });

    it('should update the value of the current item', () => {
      iterate([0, 1, 2], (i, item, next) => {
        return next.abort(item + 1);
      }, items => {
        should.exist(items);

        expect(items).to.have.length(3);
        expect(items[0]).to.equal(0 + 1);
        expect(items[1]).to.equal(1);
        expect(items[2]).to.equal(2);
      });
    });
  });

  describe('done', () => {

    it('should send the items array as an argument', () => {
      iterate([0, 1, 2], (i, item, next) => {
        return next();
      }, items => {
        should.exist(items);

        expect(items).to.have.length(3);
        expect(items[0]).to.equal(0);
        expect(items[1]).to.equal(1);
        expect(items[2]).to.equal(2);
      });
    });

    it('should send the updated items as an argument', () => {
      iterate([0, 1, 2], (i, item, next) => {
        return next(item + 1);
      }, items => {
        should.exist(items);

        expect(items).to.have.length(3);
        expect(items[0]).to.equal(0 + 1);
        expect(items[1]).to.equal(1 + 1);
        expect(items[2]).to.equal(2 + 1);
      });
    });
  });
});
