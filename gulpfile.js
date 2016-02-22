
var gulp = require('gulp')
var config = require('./config.json')
var download = require('./gulp/download')
var post = require('./gulp/post')
var filter = require('./gulp/filter')
var sorter = require('./gulp/sorter')
var tranlsate = require('./gulp/translate')
var util = require('./util')

gulp.task('translate', function () {
  return gulp.src('locales/*.json')
    .pipe(tranlsate())
    .pipe(gulp.dest('locales'))
})

gulp.task('download', function () {
  return download(config.languages)
    .pipe(filter(util.readKeys()))
    .pipe(sorter())
    .pipe(gulp.dest('locales'))
})

gulp.task('post', function () {
  return gulp.src('locales/zh.json')
    .pipe(post('zh'))
})
