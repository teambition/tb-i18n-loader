
var through = require('through2')

function sortKeys (str) {
  var data = JSON.parse(str)
  var keys = Object.keys(data)
  keys = keys.sort(function (left, right) {
    if (~left.indexOf('.') && !~right.indexOf('.')) {
      return 1
    } else if (!~left.indexOf('.') && ~right.indexOf('.')) {
      return -1
    }
    if (left > right) {
      return 1
    } else if (left < right) {
      return -1
    }
    return 0
  })

  var result = {}
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    result[key] = data[key]
  }
  return JSON.stringify(result, null, 2)
}

// exporting the plugin main function
module.exports = function () {
  return through.obj(function (file, ence, next) {
    if (!file.isBuffer()) return next()

    var contents = file.contents.toString()
    contents = sortKeys(contents)
    file.contents = new Buffer(contents)
    this.push(file)
    next()
  })
}
