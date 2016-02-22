
var through = require('through2')
var fs = require('fs')
var rootDir = process.cwd()

function readKeys () {
  var files = fs.readdirSync('../keys')
  console.log(files)
  return []
}

// exporting the plugin main function
module.exports = function () {
  var keys = readKeys()

  return through.obj(function (file, ence, next) {
    if (!file.isBuffer()) return next()

    var json = JSON.parse(file.contents.toString())
    keys.forEach(function (key) {
      if (!json.hasOwnProperty(key)) {
        json[key] = ''
      }
    })

    file.contents = new Buffer(JSON.stringify(json, null, 2))
    this.push(file)
    next()
  })
}
