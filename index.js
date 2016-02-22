
var loaderUtils = require('loader-utils')
var config = require('./config.json')
var util = require('./util')

module.exports = function (content) {
  if (this.cacheable) this.cacheable()

  var query = loaderUtils.parseQuery(this.query)
  var languages = query.languages || config.languages
  var keys = util.parseKeys(content)

  var results = ['var i18n = require(\'tb-i18n\');']
  for (var i = 0, len = languages.length; i < len; i++) {
    var lang = languages[i]
    var result = util.localesToString(lang, keys)
    results.push(result)
  }
  return results.join('\n')
}
