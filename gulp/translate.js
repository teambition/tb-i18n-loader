
var urllib = require('urllib')
var through = require('through2')
var gutil = require('gulp-util')
var path = require('path')
var MD5 = require('./md5')
var defaults = require('../locales/zh.json')

var col = gutil.colors
var PluginError = gutil.PluginError
var PLUGIN_NAME = 'gulp-i18n-translate'

// 文档页面 http://developer.baidu.com/ms/translate
// 使用百度翻译，每小时1000次请求，每月200万字符，超过会收费的，注意频率
var TRANSLATE_ID = '20151130000006954'
var TRANSLATE_KEY = process.env.TRANSLATE_KEY
var TRANSLATE_URL = 'http://api.fanyi.baidu.com/api/trans/vip/translate'
var TRANSLATE_MAP = {
  'ja': 'jp',
  'ko': 'kor',
  'zh_tw': 'cht'
}

function translate (contents, from, to, callback) {
  var optionsData = {
    from: from,
    to: TRANSLATE_MAP[to] || to,
    appid: TRANSLATE_ID
  }
  var data = JSON.parse(contents)
  var keys = Object.keys(data).filter(function (key) {
    return !data[key] && defaults[key]
  })
  function getNext () {
    var key = keys.pop()
    var value = defaults[key] || ''
    if (key) return {key: key, value: value}
    else return null
  }
  function transNext () {
    var next = getNext()
    if (!next) return callback(JSON.stringify(data, null, 2))

    var time = new Date().valueOf()
    gutil.log('Translate \'' + col.cyan(next.key) + '\' to ' + to + ' ...')
    optionsData.salt = time
    optionsData.q = next.value
    optionsData.sign = MD5(TRANSLATE_ID + next.value + time + TRANSLATE_KEY)

    urllib.request(TRANSLATE_URL, {data: optionsData}, function (err, result, res) {
      if (err) {
        throw new PluginError(PLUGIN_NAME, err.toString())
      }
      result = JSON.parse(result.toString())
      data[next.key] = result.trans_result[0].dst
      transNext()
    })
  }
  transNext()
}

module.exports = function (options) {
  options = options || {}
  var fromLang = options.fromLang || 'zh'

  var outputStream = through.obj(function (file, enc, next) {
    if (!file.isBuffer()) return next()

    var extname = path.extname(file.path)
    var lang = path.basename(file.path, extname)
    if (lang === fromLang) { // 不翻译原文
      this.push(file)
      return next()
    } else {
      translate(file.contents.toString(), fromLang, lang, function (result) {
        file.contents = new Buffer(result)
        outputStream.push(file)
        next()
      })
    }
  })
  return outputStream
}
