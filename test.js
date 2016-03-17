
require('should')
var translate = require('./index')
var describe = global.describe
var it = global.it

var localesJA = require('./locales/ja.json')
var localesEN = require('./locales/en.json')
var localesZH = require('./locales/zh.json')
var localesZH_TW = require('./locales/zh_tw.json')
var localesKO = require('./locales/ko.json')

describe('test tb-i18n-loader', function () {
  it('translate keys', function () {
    var query = '?languages[]=en'
    var contextTranslate = translate.bind({query: query})

    var desciption = `
    {
      "FRI": "FRI",
      "MON": "MON",
      "key1": "key1"
    }
    `
    var expects = [
      'var i18n = require(\'tb-i18n\');',
      'i18n.setLocales(\'en\', {',
      `  "FRI": "${localesEN['FRI'] || ''}",`,
      `  "MON": "${localesEN['MON'] || ''}",`,
      `  "key1": "${localesEN['key1'] || ''}"`,
      '});',
      'module.exports = i18n;'
    ]
    contextTranslate(desciption).should.eql(expects.join('\n'))
  })

  it('default languages', function () {
    var query = ''
    var contextTranslate = translate.bind({query: query})

    var desciption = `
    {
      "FRI": "FRI",
      "MON": "MON",
      "key1": "key1"
    }
    `
    var expects = [
      'var i18n = require(\'tb-i18n\');',
      'i18n.setLocales(\'zh\', {',
      `  "FRI": "${localesZH['FRI'] || ''}",`,
      `  "MON": "${localesZH['MON'] || ''}",`,
      `  "key1": "${localesZH['key1'] || ''}"`,
      '});',
      'i18n.setLocales(\'zh_tw\', {',
      `  "FRI": "${localesZH_TW['FRI'] || ''}",`,
      `  "MON": "${localesZH_TW['MON'] || ''}",`,
      `  "key1": "${localesZH_TW['key1'] || ''}"`,
      '});',
      'i18n.setLocales(\'en\', {',
      `  "FRI": "${localesEN['FRI'] || ''}",`,
      `  "MON": "${localesEN['MON'] || ''}",`,
      `  "key1": "${localesEN['key1'] || ''}"`,
      '});',
      'i18n.setLocales(\'ja\', {',
      `  "FRI": "${localesJA['FRI'] || ''}",`,
      `  "MON": "${localesJA['MON'] || ''}",`,
      `  "key1": "${localesJA['key1'] || ''}"`,
      '});',
      'i18n.setLocales(\'ko\', {',
      `  "FRI": "${localesKO['FRI'] || ''}",`,
      `  "MON": "${localesKO['MON'] || ''}",`,
      `  "key1": "${localesKO['key1'] || ''}"`,
      '});',
      'module.exports = i18n;'
    ]
    contextTranslate(desciption).should.eql(expects.join('\n'))
  })

  it('with namespace', function () {
    var query = '?languages[]=en'
    var contextTranslate = translate.bind({query: query})

    var desciption = `
    @namespace: all.
    {
      "member": "member",
      "project": "project",
      "key1": "key1"
    }
    `
    var expects = [
      'var i18n = require(\'tb-i18n\');',
      'i18n.setLocales(\'en\', {',
      `  "all.member": "${localesEN['all.member'] || ''}",`,
      `  "all.project": "${localesEN['all.project'] || ''}",`,
      `  "all.key1": "${localesEN['all.key1'] || ''}"`,
      '});',
      'module.exports = i18n;'
    ]
    contextTranslate(desciption).should.eql(expects.join('\n'))
  })

  it('desciption as', function () {
    var query = '?languages[]=en&&descriptionAs=en'
    var contextTranslate = translate.bind({query: query})

    var desciption = {
      'FRI': 'desciption FRI',
      'MON': 'desciption MON',
      'key1': 'desciption key1'
    }

    var expects = [
      'var i18n = require(\'tb-i18n\');',
      'i18n.setLocales(\'en\', {',
      `  "FRI": "${desciption['FRI']}",`,
      `  "MON": "${desciption['MON']}",`,
      `  "key1": "${desciption['key1']}"`,
      '});',
      'module.exports = i18n;'
    ]
    contextTranslate(JSON.stringify(desciption)).should.eql(expects.join('\n'))
  })
})
