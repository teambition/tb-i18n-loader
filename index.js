
var loaderUtils = require("loader-utils")
var config = require('./config.json')
var localesJA = require('./locales/ja.json')
var localesEN = require('./locales/ja.json')
var localesZH = require('./locales/ja.json')
var localesZH_TW = require('./locales/ja.json')
var localesKO = require('./locales/ja.json')

var NAMESPACE_MARK = '@namespace:'

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

function localesToString (language, keys, namespace) {
  var originLocales = getLocales(language)
  var locales = {}
  keys.forEach(function (key) {
    locales[key] = originLocales[namespace + key] || ''
  })
  return 'i18n.setLocales(\'' + language + '\', ' + JSON.stringify(locales, null, 2) + ');'
}

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

module.exports = function (content) {
	this.cacheable && this.cacheable()

	var query = loaderUtils.parseQuery(this.query)
  var languages = query.languages || config.languages
  var set = parseContent(content)

  var results = ['var i18n = require(\'tb-i18n\');']
  for (var i = 0, len = languages.length; i < len; i++) {
    var lang = languages[i]
    results.push(localesToString(lang, set.keys, set.namespace))
  }
  return results.join('\n')
}
