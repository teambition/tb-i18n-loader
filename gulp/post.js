
var _ = require('lodash')
var util = require('./util')
var through = require('through2')
var gutil = require('gulp-util')
var onesky = require('onesky-utils')
var loaderUtil = require('../util')

var col = gutil.colors
var PluginError = gutil.PluginError
var PLUGIN_NAME = 'gulp-i18n-post'

module.exports = function (lang, extOptions) {
  var json = {}
  return through.obj(function (file, ence, next) {
    if (!file.isBuffer()) return next()

    var obj = loaderUtil.parseDescription(file.contents.toString())
    _.extend(json, obj)

    this.push(file)
    return next()
  }, function (next) {
    var options = util.getHttpOptions(lang, extOptions)
    options.content = JSON.stringify(json)

    gutil.log('Upload \'' + col.cyan(lang + '.json') + '\' to OneSky ...')
    onesky.postFile(options).then(function (content) {
      gutil.log('Upload finished')
    }).catch(function (err) {
      throw new PluginError(PLUGIN_NAME, err.message)
    })
    return next()
  })
}
