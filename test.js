
require('should')
var translate = require('./index')
var describe = global.describe
var it = global.it

var localesJA = require('./locales/ja.json')
var localesEN = require('./locales/ja.json')
var localesZH = require('./locales/ja.json')
var localesZH_TW = require('./locales/ja.json')
var localesKO = require('./locales/ja.json')

describe('test tb-i18n-loader', function () {
  it('translate keys', function () {
    var query = '?languages[]=en'
    var contextTranslate = translate.bind({query: query})

    var keys = [
      'FRI',
      'MON',
      'key1'
    ]
    var expects = [
      'var i18n = require(\'tb-i18n\');',
      'i18n.setLocales(\'en\', {',
      '  "FRI": "' + localesEN['FRI'] + '",',
      '  "MON": "' + localesEN['MON'] + '",',
      '  "key1": "' + (localesEN['key1'] || '') + '"',
      '});'
    ]
    contextTranslate(keys.join('\n')).should.eql(expects.join('\n'))
  })

  it('default languages', function () {
    var query = ''
    var contextTranslate = translate.bind({query: query})

    var keys = [
      'FRI',
      'MON',
      'key1'
    ]
    var expects = [
      'var i18n = require(\'tb-i18n\');',
      'i18n.setLocales(\'zh\', {',
      '  "FRI": "' + localesZH['FRI'] + '",',
      '  "MON": "' + localesZH['MON'] + '",',
      '  "key1": "' + (localesZH['key1'] || '') + '"',
      '});',
      'i18n.setLocales(\'zh_tw\', {',
      '  "FRI": "' + localesZH_TW['FRI'] + '",',
      '  "MON": "' + localesZH_TW['MON'] + '",',
      '  "key1": "' + (localesZH_TW['key1'] || '') + '"',
      '});',
      'i18n.setLocales(\'en\', {',
      '  "FRI": "' + localesEN['FRI'] + '",',
      '  "MON": "' + localesEN['MON'] + '",',
      '  "key1": "' + (localesEN['key1'] || '') + '"',
      '});',
      'i18n.setLocales(\'ja\', {',
      '  "FRI": "' + localesJA['FRI'] + '",',
      '  "MON": "' + localesJA['MON'] + '",',
      '  "key1": "' + (localesJA['key1'] || '') + '"',
      '});',
      'i18n.setLocales(\'ko\', {',
      '  "FRI": "' + localesKO['FRI'] + '",',
      '  "MON": "' + localesKO['MON'] + '",',
      '  "key1": "' + (localesKO['key1'] || '') + '"',
      '});'
    ]
    contextTranslate(keys.join('\n')).should.eql(expects.join('\n'))
  })

  it('with namespace', function () {
    var query = '?languages[]=en'
    var contextTranslate = translate.bind({query: query})

    var keys = [
      '@namespace: all.',
      'member',
      'project',
      'key1'
    ]
    var expects = [
      'var i18n = require(\'tb-i18n\');',
      'i18n.setLocales(\'en\', {',
      '  "all.member": "' + (localesEN['all.member'] || '') + '",',
      '  "all.project": "' + (localesEN['all.project'] || '') + '",',
      '  "all.key1": "' + (localesEN['all.key1'] || '') + '"',
      '});'
    ]
    contextTranslate(keys.join('\n')).should.eql(expects.join('\n'))
  })
})
