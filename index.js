
var loaderUtils = require('loader-utils')
var util = require('./util')

var languages = ['zh', 'zh_tw', 'en', 'ja', 'ko']

module.exports = function (content) {
  if (this.cacheable) this.cacheable()

  var query = loaderUtils.parseQuery(this.query)
  var descriptionAs = query.descriptionAs
  var languages = query.languages || config.languages
  var description = util.parseDescription(content)

  var results = ['var i18n = require(\'tb-i18n\');']
  for (var i = 0, len = languages.length; i < len; i++) {
    var lang = languages[i]
    var result
    if (lang === descriptionAs) {
      result = util.translate(lang, description)
    } else {
      result = util.translateLocales(lang, Object.keys(description))
    }
    results.push(result)
  }
  results.push('module.exports = i18n;')
  return results.join('\n')
}
