
var _ = require('lodash')

var ONESKY_CONFIG = {
  fileName: 'zh.json',
  secret: process.env.ONESKY_SECRET,
  apiKey: process.env.ONESKY_API_KEY,
  projectId: '',
  format: 'HIERARCHICAL_JSON',
  keepStrings: true
}
var LANGUAGE_MAP = {
  'zh': 'zh-CN',
  'zh_tw': 'zh-TW'
}

exports.getHttpOptions = function (lang, options) {
  return _.extend({}, ONESKY_CONFIG, {
    language: LANGUAGE_MAP[lang] || lang
  }, options)
}
