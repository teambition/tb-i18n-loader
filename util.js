
var sysPath = require('path')
var fs = require('fs')
var localesJA = require('./locales/ja.json')
var localesEN = require('./locales/en.json')
var localesZH = require('./locales/zh.json')
var localesZH_TW = require('./locales/zh_tw.json')
var localesKO = require('./locales/ko.json')

exports.getLocales = getLocales
function getLocales (language) {
  switch (language) {
    case 'ja':
      return localesJA
    case 'en':
      return localesEN
    case 'zh':
      return localesZH
    case 'zh_tw':
      return localesZH_TW
    case 'ko':
      return localesKO
  }
  return {}
}

exports.localesToString = localesToString
function localesToString (language, keys) {
  var originLocales = getLocales(language)
  var locales = {}
  keys.forEach(function (key) {
    locales[key] = originLocales[key] || ''
  })
  return 'i18n.setLocales(\'' + language + '\', ' + JSON.stringify(locales, null, 2) + ');'
}

var NAMESPACE_MARK = '@namespace:'
exports.parseKeys = parseKeys
function parseKeys (content) {
  var namespace = ''
  var results = []
  var keys = content.split('\n')

  for (var i = 0, len = keys.length; i < len; i++) {
    var key = (keys[i] || '').trim()
    if (key) {
      if (key.indexOf(NAMESPACE_MARK) === 0) {
        namespace = key.slice(NAMESPACE_MARK.length).trim()
      } else {
        results.push(key)
      }
    }
  }

  if (namespace) {
    return results.map(function (item) { return namespace + item })
  } else {
    return results
  }
}

exports.readKeys = readKeys
function readKeys () {
  var results = []
  fs.readdirSync('./keys').forEach(function (fileName) {
    var path = sysPath.resolve('./keys', fileName)
    var contents = fs.readFileSync(path, 'utf-8')
    parseKeys(contents).forEach(function (key) {
      if (!~results.indexOf(key)) results.push(key)
    })
  })
  return results
}
