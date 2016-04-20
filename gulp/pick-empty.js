'use strict'

var through = require('through2')
var gutil = require('gulp-util')
var path = require('path')

function compare (base, current) {
  var result = {}
  Object.keys(current).forEach(function (key) {
    if (current[key] === base[key]) {
      result[key] = ''
    }
  })
  return result
}

module.exports = function (baseLang) {
  var set = {}

  var outputStream = through.obj(function (file, enc, next) {
    if (!file.isBuffer()) return next()

    var extname = path.extname(file.path)
    var lang = path.basename(file.path, extname)
    set[lang] = JSON.parse(file.contents.toString())
    return next()
  }, function (next) {
    Object.keys(set).forEach(function (lang) {
      if (lang !== baseLang) {
        var diff = compare(set[baseLang], set[lang])
        outputStream.push(new gutil.File({
          path: lang + '.json',
          contents: new Buffer(JSON.stringify(diff, null, 2))
        }))
      }
    })
    next()
  })
  return outputStream
}
