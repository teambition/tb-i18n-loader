
var gulp = require('gulp')
var config = require('config')
var download = require('./gulp/download')
var post = require('./gulp/post')
var filter = require('./gulp/filter')
var sorter = require('./gulp/sorter')
var tranlsate = require('./gulp/translate')
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
    .pipe(tranlsate({from: 'zh'}))
    .pipe(gulp.dest('tmp/translated'))
})

gulp.task('download', function () {
  return download(config.LANGUAGES, ONESKY_OPTIONS)
    .pipe(filter(readDescription(), 'zh'))
    .pipe(sorter())
    .pipe(gulp.dest('locales'))
})

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
