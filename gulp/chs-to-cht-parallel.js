// 并发调用接口
var urllib = require('urllib')
var through = require('through2')
var inquirer = require('inquirer')
var gutil = require('gulp-util')
var path = require('path')
var isEmpty = require('lodash').isEmpty
var MD5 = require('./md5')
var defaults = require('../locales/zh.json')
var defaultsTW = require('../locales/zh_tw.json')
var diff = require('../cache/diff.json')

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

  function requestTranslate(key, value) {
    var time = new Date().valueOf()
    optionsData.salt = time
    optionsData.q = value
    optionsData.sign = MD5(TRANSLATE_ID + value + time + TRANSLATE_KEY)

    gutil.log('Translate \'' + col.cyan(key) + '\' to ' + to + ' ...')
    return urllib.request(TRANSLATE_URL, { data: optionsData })
  }

  var promiseList = []
  keys.forEach((key) => {
    if (key && data[key] === '') {
      delete results[key]
      data[key] = ''
    } else {
      promiseList.push(
        requestTranslate(key, data[key])
          .then((res) => {
            var result = JSON.parse(res.data.toString())
            if (result.trans_result && result.trans_result[0]) {
              // 翻译成功加入列表
              data[key] = result.trans_result[0].dst
              results[key] = result.trans_result[0].dst
            } else {
              // 翻译不成功，将错误保存，置空当前字段，经过上面的逻辑重试这个字段
              errorMessages.push({ key: key, result: result })
              if (result.error_code === '52001' || result.error_code === '52002') {
                return requestTranslate(key, data[key])
              } else {
                throw new PluginError(PLUGIN_NAME, result.toString())
              }
            }
          })
          .catch((err) => {
            console.error(err)
          })
      )
    }
  })
  
  Promise.all(promiseList)
    .then(() => {
      if (!isEmpty(errorMessages)) {
        gutil.log('---------------------------- ' + col.red('Errors During Translation Process') + ' ----------------------------')
        gutil.log(errorMessages)
      }
      return callback(JSON.stringify(results, null, 2))
    })
}

module.exports = function (options) {
  options = options || {}
  var fromLang = 'zh'
  var lang = 'zh_tw'

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
      if (isEmpty(diff.added) && isEmpty(diff.modified) && isEmpty(diff.deleted)) {
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
