
var gulp = require('gulp')
var sequence = require('gulp-sequence')
var config = require('config')
var minimist = require('minimist')
var download = require('./gulp/download')
var post = require('./gulp/post')
var filter = require('./gulp/filter')
var sorter = require('./gulp/sorter')
var compare = require('./gulp/compare')
var translate = require('./gulp/translate')
var chsToCht = require('./gulp/chs-to-cht-parallel')
var pickEmpty = require('./gulp/pick-empty')
var util = require('./util')
var fs = require('fs')
var path = require('path')

require('isomorphic-fetch')

var i18nCacheDir = path.join(__dirname, './cache')

var ONESKY_OPTIONS = {
  projectId: 153977
}

var params = minimist(process.argv.slice(3))
var chsToChtOptions = {
  all: false,
  force: false,
  exec: false
}

if (process.argv[2] && process.argv[2] === 'chs-to-cht') {
  chsToChtOptions.all = params.a || params.all
  chsToChtOptions.force = params.f || params.force
}

if (params.y || params.exec) {
  chsToChtOptions.exec = true
}

var localesDir = path.join(__dirname, 'locales')
var getLocalesJson = function(file) {
  file = file || 'zh.json'
  return path.join(localesDir, file)
}

function readDescription () {
  var result = {}
  var dir = path.resolve(__dirname, './keys')
  fs.readdirSync(dir).forEach(function (fileName) {
    var filePath = path.resolve(dir, fileName)
    var contents = fs.readFileSync(filePath, 'utf-8')
    var description = util.parseDescription(contents)
    var keys = Object.keys(description)

    for (var i = 0, len = keys.length; i < len; i++) {
      result[keys[i]] = description[keys[i]]
    }
  })
  return result
}

gulp.task('translate', function () {
  var tmpDir = path.join(__dirname, 'tmp', '*.json')
  var translatedDir = path.join(__dirname, 'translated')

  return gulp.src(tmpDir)
    .pipe(translate({from: 'zh'}))
    .pipe(gulp.dest(translatedDir))
})

gulp.task('chs-to-cht', function () {
  return gulp.src(getLocalesJson())
    .pipe(chsToCht(chsToChtOptions))
    .pipe(gulp.dest(localesDir))
})

gulp.task('cache', function () {
  return gulp.src(getLocalesJson())
    .pipe(gulp.dest(i18nCacheDir))
})

gulp.task('raw-download', function () {
  return download(config.LANGUAGES, ONESKY_OPTIONS)
    .pipe(filter(readDescription(), 'zh'))
    .pipe(sorter())
    .pipe(gulp.dest(localesDir))
})

gulp.task('compare', ['raw-download'], function () {
  return gulp.src(getLocalesJson())
    .pipe(compare())
    .pipe(gulp.dest(i18nCacheDir))
})

gulp.task('download', ['compare'])

gulp.task('pick-empty', function () {
  return gulp.src(getLocalesJson('*.json'))
    .pipe(pickEmpty('zh'))
    .pipe(gulp.dest('tmp'))
})

gulp.task('post', function () {
  return gulp.src(getLocalesJson())
    .pipe(post('zh', ONESKY_OPTIONS))
})

gulp.task('post-cht', ['cache'], function () {
  return gulp.src(getLocalesJson('zh_tw.json'))
    .pipe(post('zh_tw', ONESKY_OPTIONS))
})

gulp.task('ci:i18n', sequence('download', 'chs-to-cht', 'post-cht'))

gulp.task('default', 'download')
