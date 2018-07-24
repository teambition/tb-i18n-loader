
var gulp = require('gulp')
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
var sdk = require('teambition-sdk')

var request = new sdk.SDKFetch()

var ONESKY_OPTIONS = {
  projectId: 153977
}

var params = minimist(process.argv.slice(3))
var chsToChtOptions = {
  all: false,
  force: false,
}
if (process.argv[2] && process.argv[2] === 'chs-to-cht') {
  chsToChtOptions.all = params.a || params.all
  chsToChtOptions.force = params.f || params.force
}

function readDescription () {
  var result = {}
  fs.readdirSync('./keys').forEach(function (fileName) {
    var filePath = path.resolve('./keys', fileName)
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
  return gulp.src('tmp/*.json')
    .pipe(translate({from: 'zh'}))
    .pipe(gulp.dest('tmp/translated'))
})

gulp.task('chs-to-cht', function () {
  return gulp.src('locales/zh.json')
    .pipe(chsToCht(chsToChtOptions))
    .pipe(gulp.dest('locales'))
})

gulp.task('cache', function () {
  return gulp.src('locales/zh.json')
    .pipe(gulp.dest('cache'))
})

gulp.task('raw-download', function () {
  return download(config.LANGUAGES, ONESKY_OPTIONS)
    .pipe(filter(readDescription(), 'zh'))
    .pipe(sorter())
    .pipe(gulp.dest('locales'))
})

gulp.task('compare', ['raw-download'], function () {
  return gulp.src('locales/zh.json')
    .pipe(compare())
    .pipe(gulp.dest('cache'))
})

gulp.task('download', ['compare'])

gulp.task('pick-empty', function () {
  return gulp.src('locales/*.json')
    .pipe(pickEmpty('zh'))
    .pipe(gulp.dest('tmp'))
})

gulp.task('notice', function () {
  var enEmpty = require('./tmp/en.json')
  var version = require('./package.json').version
  request.setToken(config.TOKEN)
  var team$ = request.get('teams/5763667798cb0609458bacdd')
    .map(team => team.hasMembers.map(m => m._id))

  return team$.concatMap(members => request.post('tasks', {
    content: version + ' i18n check',
    _tasklistId: config.TASKLIST_ID,
    note: '```' + JSON.stringify(enEmpty, null, 2) + '```',
    involveMembers: members
  }))
    .toPromise()
    .catch(e => {
      console.error(e)
    })
})

gulp.task('post', function () {
  return gulp.src('locales/zh.json')
    .pipe(post('zh', ONESKY_OPTIONS))
})

gulp.task('post-cht', ['cache'], function () {
  return gulp.src('locales/zh_tw.json')
    .pipe(post('zh_tw', ONESKY_OPTIONS))
})
