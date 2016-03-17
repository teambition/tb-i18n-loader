
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
function mergeLocales (language, description) {
  var originLocales = getLocales(language)
  var keys = Object.keys(description)
  var locales = {}
  keys.forEach(function (key) {
    locales[key] = originLocales[key] || description[key] || ''
  })
  return translate(language, locales)
}

exports.translate = translate
function translate (language, locales) {
  return 'i18n.setLocales(\'' + language + '\', ' + JSON.stringify(locales, null, 2) + ');'
}

var NAMESPACE_MARK = '@namespace:'
exports.parseDescription = parseDescription
function parseDescription (content) {
  var set = parseDescriptionSet(content)
  var namespace = set.namespace
  var description = set.description
  if (namespace) {
    var result = {}
    var keys = Object.keys(description)
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i]
      result[namespace + key] = description[key]
    }
    return result
  } else {
    return description
  }
}

exports.parseDescriptionSet = parseDescriptionSet
function parseDescriptionSet (content) {
  var namespace = ''
  var lines = content.trim().split('\n')
  var first = (lines[0] || '').trim()

  if (first.indexOf(NAMESPACE_MARK) === 0) {
    namespace = first.slice(NAMESPACE_MARK.length).trim()
    lines.shift()
  }

  var description = JSON.parse(lines.join('\n'))
  return {namespace: namespace, description: description}
}
