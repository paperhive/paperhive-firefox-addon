'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var jscsStylish = require('gulp-jscs-stylish');
//var htmlhint = require('gulp-htmlhint');

var paths = {
  js: ['index.js', 'data/**.js'],
  html: 'data/**.html'
};

// Don't depend on jscs for now, cf.
// <https://github.com/jscs-dev/node-jscs/issues/1355>
// TODO fix this
gulp.task('jshint', function() {
  return gulp.src(paths.js)
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

gulp.task('jscs', function() {
  return gulp.src(paths.js)
  .pipe(jscs())
  .pipe(jscsStylish());  // log style errors
});

//var htmlhintOpts = {
//  'doctype-first': false
//};
//gulp.task('htmlhint', function() {
//  return gulp.src(paths.html)
//  .pipe(htmlhint(htmlhintOpts))
//  .pipe(htmlhint.reporter())
//  .pipe(htmlhint.failReporter());
//});
//
//var htmlminOpts = {
//  collapseWhitespace: true,
//  removeComments: true
//};
//// copy and compress HTML files
//gulp.task('html', ['htmlhint'], function() {
//  return gulp.src('src/*.html')
//  .pipe(debug ? gutil.noop() : htmlmin(htmlminOpts))
//  .pipe(gulp.dest('build'));
//});

gulp.task(
  'default',
  ['jshint', 'jscs']
);
