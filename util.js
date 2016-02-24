
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

exports.translateLocales = translateLocales
function translateLocales (language, keys) {
  var originLocales = getLocales(language)
  var locales = {}
  keys.forEach(function (key) {
    locales[key] = originLocales[key] || ''
  })
  return translate(language, locales)
}

exports.mergeLocales = mergeLocales
function mergeLocales (language, desciption) {
  var originLocales = getLocales(language)
  var keys = Object.keys(desciption)
  var locales = {}
  keys.forEach(function (key) {
    locales[key] = originLocales[key] || desciption[key] || ''
  })
  return translate(language, locales)
}

function translate (language, locales) {
  return 'i18n.setLocales(\'' + language + '\', ' + JSON.stringify(locales, null, 2) + ');'
}

var NAMESPACE_MARK = '@namespace:'
exports.parseDescription = parseDescription
function parseDescription (content) {
  var namespace = ''
  var lines = content.trim().split('\n')
  var first = (lines[0] || '').trim()

  if (first.indexOf(NAMESPACE_MARK) === 0) {
    namespace = first.slice(NAMESPACE_MARK.length).trim()
    lines.shift()
  }

  var desciption = JSON.parse(lines.join('\n'))
  if (namespace) {
    var result = {}
    var keys = Object.keys(desciption)
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i]
      result[namespace + key] = desciption[key]
    }
    return result
  } else {
    return desciption
  }
}

exports.readKeys = readKeys
function readKeys () {
  var results = []
  fs.readdirSync('./keys').forEach(function (fileName) {
    var path = sysPath.resolve('./keys', fileName)
    var contents = fs.readFileSync(path, 'utf-8')
    parseDescription(contents).forEach(function (key) {
      if (!~results.indexOf(key)) results.push(key)
    })
  })
  return results
}
