var gutil = require('gulp-util')
var through = require('through2')
var cache = require('../cache/zh.json')

var col = gutil.colors

function compare(data) {
  var added = []
  var modified = []
  var deleted = []
  var cacheKeys = Object.keys(cache)
  var dataKeys = Object.keys(data)
  var allKeys = Object.keys(Object.assign({}, cache, data))
  
  while (!!allKeys.length) {
    var last = allKeys[allKeys.length - 1]
    if (!!data[last] && !!cache[last] && data[last] !== cache[last]) {
      modified.push({
        key: last,
        oldValue: cache[last],
        newValue: data[last],
      })
    }
    if (!!data[last] && !cache[last]) {
      added.push({
        key: last,
        value: data[last],
      })
    }
    if (!data[last] && !!cache[last]) {
      deleted.push({
        key: last,
        value: cache[last],
      })
    }
    allKeys.pop()
  }

  var result = {
    added: added,
    modified: modified,
    deleted: deleted,
  }

  gutil.log(col.green('Done'))
  return JSON.stringify(result, null, 2)
}

// exporting the plugin main function
module.exports = function () {
  return through.obj(function (file, enc, next) {
    if (!file.isBuffer()) return next()
    
    gutil.log('Compare Origin with OneSky ...')

    var contents = JSON.parse(file.contents.toString())
    var newFile = file
    newFile.path = './cache/diff.json'
    newFile.contents = new Buffer(compare(contents))
    this.push(file)
    next()
  })
}
