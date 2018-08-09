// 串行调用接口
var urllib = require('urllib')
var through = require('through2')
var inquirer = require('inquirer')
var gutil = require('gulp-util')
var path = require('path')
var fs = require('fs')
var isEmpty = require('lodash').isEmpty
var MD5 = require('./md5')
var defaults = require('../locales/zh.json')
var defaultsTW = require('../locales/zh_tw.json')

var col = gutil.colors
var PluginError = gutil.PluginError
var PLUGIN_NAME = 'gulp-i18n-translate'

// 文档页面 http://developer.baidu.com/ms/translate
// 使用百度翻译，每小时1000次请求，每月200万字符，超过会收费的，注意频率
var TRANSLATE_ID = process.env.TRANSLATE_ID
var TRANSLATE_KEY = process.env.TRANSLATE_KEY
var TRANSLATE_URL = 'http://api.fanyi.baidu.com/api/trans/vip/translate'
var TRANSLATE_MAP = {
  'ja': 'jp',
  'ko': 'kor',
  'zh_tw': 'cht'
}

function translate(contents, from, to, callback) {
  var results = defaultsTW
  var optionsData = {
    from: from,
    to: TRANSLATE_MAP[to] || to,
    appid: TRANSLATE_ID
  }
  var data = JSON.parse(contents)
  var keys = Object.keys(data)
  var errorMessages = []

  var poppedKey = keys[keys.length - 1]
  function getNext() {
    var key
    if (data[poppedKey] !== null) {
      poppedKey = keys[keys.length - 1]
      key = keys.pop()
    } else {
      key = poppedKey
    }
    var value = defaults[key] || ''
    if (key) {
      return { key: key, value: value }
    }
    else {
      if (!isEmpty(errorMessages)) {
        gutil.log('---------------------------- ' + col.red('Errors During Translation Process') + ' ----------------------------')
        gutil.log(errorMessages)
      }
      return null
    }
  }

  function transNext() {
    var next = getNext()
    if (!next) return callback(JSON.stringify(results, null, 2))

    if (next.key && next.value === '') {
      data[next.key] = ''
      delete results[next.key]
      transNext()
    } else {
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
        if (result.trans_result && result.trans_result[0]) {
          // 翻译成功加入列表
          data[next.key] = result.trans_result[0].dst
          results[next.key] = result.trans_result[0].dst
        } else {
          // 翻译不成功，将错误保存，置空当前字段，经过上面的逻辑重试这个字段
          errorMessages.push({ key: next.key, result: result })
          data[next.key] = null
        }
        transNext()
      })
    }

  }

  transNext()
}

module.exports = function (options) {
  options = options || {}
  var fromLang = 'zh'
  var lang = 'zh_tw'
  var diffFile = fs.readFileSync(path.join(__dirname, '../cache/diff.json'), 'utf-8')
  var diff = JSON.parse(diffFile)

  var outputStream = through.obj(function (file, enc, next) {
    if (!file.isBuffer()) return next()

    var contents = JSON.stringify(defaults, null, 2)
    if (!options.all) {
      var flatten = {}
      diff.added.forEach((added) => {
        flatten[added.key] = added.value
      })
      diff.modified.forEach((modified) => {
        flatten[modified.key] = modified.newValue
      })
      diff.deleted.forEach((deleted) => {
        flatten[deleted.key] = ''
      })
      contents = JSON.stringify(flatten, null, 2)
    }

    function printDiff() {
      gutil.log('---------------------------- ' + col.cyan('Diffs') + ' ----------------------------')
      if (!diff.added.length && !diff.modified.length && !diff.deleted.length) {
        gutil.log('None.')
      } else {
        diff.added.forEach((added) => {
          gutil.log(col.green('Added') + ' --> ' + added.key + ': ' + added.value)
        })
        diff.modified.forEach((modified) => {
          gutil.log(col.cyan('Modified') + ' --> ' + modified.key + ': ' + modified.oldValue + col.cyan(' -> ') + modified.newValue)
        })
        diff.deleted.forEach((deleted) => {
          gutil.log(col.red('Deleted') + ' --> ' + deleted.key + ': ' + deleted.value)
        })
      }
    }

    function execute() {
      return translate(contents, fromLang, lang, function (result) {
        var newFile = file
        newFile.path = path.dirname(file.path) + '/' + lang + '.json'
        newFile.contents = new Buffer(result)
        outputStream.push(newFile)
        return next()
      })
    }

    if (!options.force) {
      printDiff()
      inquirer.prompt({
        type: 'confirm',
        name: 'confirmTranslate',
        message: 'Execute Translating ?',
      }).then(answers => {
        if (answers.confirmTranslate) {
          execute()
        } else {
          return next()
        }
      })
    } else {
      execute()
    }
  })

  return outputStream
}
