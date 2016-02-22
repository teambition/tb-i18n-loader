
var util = require('./util')
var through = require('through2')
var gutil = require('gulp-util')
var onesky = require('onesky-utils')

var col = gutil.colors
var PluginError = gutil.PluginError
var PLUGIN_NAME = 'gulp-i18n-download'

module.exports = function () {
  return through.obj(function (file, ence, next) {
    if (!file.isBuffer()) return next()

    var json = JSON.parse(file.contents.toString())
    var contents = Object.keys(json).join('\n')
    file.contents = new Buffer(contents)

    this.push(file)
    return next()
  })
}
