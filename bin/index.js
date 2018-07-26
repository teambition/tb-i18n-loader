#!/usr/bin/env node

var gulp = require('gulp')

require('../gulpfile')

if (gulp.tasks['ci:i18n']) {
  gulp.start('ci:i18n')
}
