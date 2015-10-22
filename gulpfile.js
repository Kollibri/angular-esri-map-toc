'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var stripDebug = require('gulp-strip-debug');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var deploy = require('gulp-gh-pages');
var angularProtractor = require('gulp-angular-protractor');
var minifyCss = require('gulp-minify-css');
var mainBowerFiles = require('main-bower-files');
// source directives and services
var srcJsFiles = 'src/**/*.js';

// source css
var srcCssFiles = 'src/**/*.css';

// lint source javascript files
gulp.task('lint', function() {
  return gulp.src(srcJsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// clean built copies of javascript files
// from dist folder and docs
gulp.task('clean', function() {
  return gulp.src(['dist', 'docs/lib'])
    .pipe(clean({force: true}));
});

// concatenate and minify source javascript files
// and copy into dist folder and docs
gulp.task('build-js', function() {
  return gulp.src([
    'src/angular-esri-map-toc.js'])
    .pipe(concat('angular-esri-map-toc.js'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('docs/lib'))
    .pipe(stripDebug())
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename('angular-esri-map-toc.min.js'))
    .pipe(gulp.dest('dist'))
    .on('error', gutil.log);
});

// concatenate and minify source css files
// and copy into dist folder
gulp.task('build-css', function() {
  return gulp.src([
    'src/angular-esri-map-toc.css'])
    .pipe(concat('angular-esri-map-toc.css'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('docs/lib'))
    .pipe(minifyCss())
    .pipe(rename('angular-esri-map-toc.min.css'))
    .pipe(gulp.dest('dist'))
    .on('error', gutil.log);
});


gulp.task('bower-files', function() {
    return gulp.src(mainBowerFiles(/* options */), { base: './bower_components' })
        .pipe(gulp.dest('docs/lib'));
});

// lint then clean and build javascript
gulp.task('build', function(callback) {
  runSequence('lint', 'clean', 'build-js', 'build-css', 'bower-files', callback);
});

// serve docs and tests on local web server
// and reload anytime source code or docs are modified
gulp.task('serve', ['build'], function() {
  browserSync({
    server: {
      baseDir: ['docs', 'test']
    },
    open: true,
    port: 9002,
    notify: false
  });

  gulp.watch([srcJsFiles, srcCssFiles, './docs/**.*.html', './docs/app/**/*.js', './docs/styles/*.css'], ['build', browserSync.reload ]);

});

// serve tests on local web server
gulp.task('serve-test', ['build'], function() {
  browserSync({
    server: {
      baseDir: 'test',
      routes: {
        '/lib': 'docs/lib'
      }
    },
    open: false,
    port: 9002,
    notify: false
  });
});


// deploy to github pages
gulp.task('deploy', ['build'], function () {
  return gulp.src(['./docs/**/*', './test/**/*'])
    .pipe(deploy());
});

// deploy to Kollibri's github pages
gulp.task('deploy-prod', ['build'], function () {
  return gulp.src(['./docs/**/*', './test/**/*'])
    .pipe(deploy({
      remoteUrl: 'https://github.com/Kollibri/angular-esri-map-toc.git'
    }));
});

gulp.task('test', ['serve-test'], function() {
  return gulp.src(['./test/e2e/specs/*.js'])
    .pipe(angularProtractor({
      'configFile': 'test/e2e/conf.js',
      'args': ['--baseUrl', 'http://localhost:9002'],
      'autoStartStopServer': true
      // 'debug': true
    }))
    .on('end', function() {
      browserSync.exit();
    })
    .on('error', function(e) {
      throw e;
    });
});

// Default Task
gulp.task('default', ['serve']);
