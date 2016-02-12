/**
 * @fileoverview Our Gulp tasks.
 * @author Nathan Buchar
 * @ignore
 */

'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const chalk = require('chalk');
const jscs = require('gulp-jscs');
const jshint = require('gulp-jshint');
const mocha = require('gulp-mocha');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sequence = require('gulp-sequence');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

/**
 * Handles Gulp errors.
 *
 * @param {Error} err
 */
let onError = function (err) {
  gutil.beep();
  console.log(chalk.red(err));
};

/**
 * Default Gulp task.
 *
 * @see task:build
 */
gulp.task('default', ['build']);

/**
 * Runs all the primary build tasks then runs the tests.
 *
 * @see task:jscs
 * @see task:jshint
 */
gulp.task('lint', ['jscs', 'jshint']);

/**
 * Compiles the source code then runs the tests.
 *
 * @see task:compile
 * @see task:test
 */
gulp.task('build', (cb) => {
  sequence('compile', 'test')(cb);
});

/**
 * Lints the source code then compiles and uglifies.
 *
 * @see task:link
 * @see task:scripts
 * @see task:uglify
 */
gulp.task('compile', (cb) => {
  sequence('lint', 'scripts', 'uglify')(cb);
});

/**
 * Runs the source code through our JSHint linter.
 *
 * @see {@link http://npmjs.org/package/gulp-jshint}
 */
gulp.task('jshint', () => {
  return gulp.src('./src/**/*.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

/**
 *  Runs the source code through our JSCS linter.
 *
 * @see {@link http://npmjs.org/package/gulp-jscs}
 */
gulp.task('jscs', () => {
  return gulp.src('src/**/*.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(jscs())
    .pipe(jscs.reporter('fail'));
});

/**
 * Babelifies the scripts and exports to root.
 *
 * @see {@link http://npmjs.org/package/gulp-sourcemaps}
 * @see {@link http://npmjs.org/package/gulp-babel}
 */
gulp.task('scripts', () => {
  return gulp.src('src/shiterate.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./'));
});

/**
 * Uglifies the compiled source code.
 *
 * @see {@link http://npmjs.org/package/gulp-uglify}
 * @see {@link http://npmjs.org/package/gulp-rename}
 */
gulp.task('uglify', () => {
  return gulp.src('./shiterate.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(uglify())
    .pipe(rename('shiterate.min.js'))
    .pipe(gulp.dest('./'));
});

/**
 * Runs our Mocha tests.
 *
 * @see {@link http://npmjs.org/package/gulp-mocha}
 */
gulp.task('test', () => {
  return gulp.src('./test/**/*')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(mocha());
});

/**
 * Watches for file changes in src.
 *
 * @see task:build
 */
gulp.task('watch', ['build'], () => {
  gulp.watch('./src/**/*', ['build']);
});
