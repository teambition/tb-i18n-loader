
var sysPath = require('path')
var fs = require('fs')
var localesJA = require('./locales/ja.json')
var localesEN = require('./locales/ja.json')
var localesZH = require('./locales/ja.json')
var localesZH_TW = require('./locales/ja.json')
var localesKO = require('./locales/ja.json')

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
function localesToString (language, namespace, keys) {
  var originLocales = getLocales(language)
  var locales = {}
  keys.forEach(function (key) {
    locales[key] = originLocales[namespace + key] || ''
  })
  return 'i18n.setLocales(\'' + language + '\', ' + JSON.stringify(locales, null, 2) + ');'
}

var NAMESPACE_MARK = '@namespace:'
exports.parseContent = parseContent
function parseContent (content) {
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

  return {namespace: namespace, keys: results}
}

exports.readKeys = readKeys
function readKeys () {
  var results = []
  fs.readdirSync('./keys').forEach(function (fileName) {
    var path = sysPath.resolve('./keys', fileName)
    var contents = fs.readFileSync(path, 'utf-8')
    var set = parseContent(contents)
    set.keys.forEach(function (key) {
      if (!~results.indexOf(key)) results.push(set.namespace + key)
    })
  })
  return results
}
