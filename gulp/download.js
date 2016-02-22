
var util = require('./util')
var through = require('through2')
var gutil = require('gulp-util')
var onesky = require('onesky-utils')
var sysPath = require('path')
var fs = require('fs')
var rootDir = process.cwd()

var col = gutil.colors
var PluginError = gutil.PluginError
var PLUGIN_NAME = 'gulp-i18n-download'

function readOldJson (lang, extname) {
  var path = sysPath.resolve(rootDir, 'locales', lang + '.json')
  var contents = fs.readFileSync(path, 'utf-8')
  return JSON.parse(contents)
}

module.exports = function (languages) {
  var outputStream = through.obj(function (file, enc, next) {
    this.push(file)
    return next()
  })

  if (languages && languages.length) {
    var count = languages.length
    languages.map(function (lang) {
      var oldJson = readOldJson(lang)

      gutil.log('Download \'' + col.cyan(lang + '.json') + '\' from OneSky ...')
      onesky.getFile(util.getHttpOptions(lang)).then(function (content) {
        var json = JSON.parse(content)
        for (var key in oldJson) {
          if (oldJson[key] && !json[key]) {
            json[key] = oldJson[key]
          }
        }

        outputStream.push(new gutil.File({
          path: lang + '.json',
          contents: new Buffer(JSON.stringify(json, null, 2))
        }))

        if (--count <= 0) {
          outputStream.emit('end')
        }
      }).catch(function (err) {
        throw new PluginError(PLUGIN_NAME, err.message)
      })
    })
  } else {
    outputStream.emit('end')
  }
  return outputStream
}
