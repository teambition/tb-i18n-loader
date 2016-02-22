
var util = require('./util')
var through = require('through2')
var gutil = require('gulp-util')
var onesky = require('onesky-utils')

var col = gutil.colors
var PluginError = gutil.PluginError
var PLUGIN_NAME = 'gulp-i18n-download'

module.exports = function (languages) {
  var outputStream = through.obj(function (file, enc, next) {
    this.push(file)
    return next()
  })
  var count = languages.length
  languages.map(function (lang) {
    gutil.log('Download \'' + col.cyan(lang + '.json') + '\' from OneSky ...')
    onesky.getFile(util.getHttpOptions(lang)).then(function (content) {
      outputStream.push(new gutil.File({
        path: lang + '.json',
        contents: new Buffer(content)
      }))

      if (--count <= 0) {
        outputStream.emit('end')
      }
    }).catch(function (err) {
      throw new PluginError(PLUGIN_NAME, err.message)
    })
  })
  return outputStream
}
