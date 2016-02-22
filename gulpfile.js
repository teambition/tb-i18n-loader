
var config = require('./config.json')
var gulp = require('gulp')
var download = require('./gulp/download')
var post = require('./gulp/post')
var gather = require('./gulp/gather')
var sorter = require('./gulp/sorter')

gulp.task('gather', function () {
  return download('locales/*.json')
    .pipe(gather())
    .pipe(sorter())
    .pipe(gulp.dest('locales'))
})

gulp.task('download', function () {
  return download(config.languages)
    .pipe(sorter())
    .pipe(gulp.dest('locales'))
})

gulp.task('post', function () {
  return gulp.src('locales/zh.json')
    .pipe(post('zh'))
})
