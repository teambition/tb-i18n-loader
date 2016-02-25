
var through = require('through2')

// exporting the plugin main function
module.exports = function (description) {
  return through.obj(function (file, ence, next) {
    if (!file.isBuffer()) return next()

    var json = JSON.parse(file.contents.toString())
    var result = {}
    Object.keys(description).forEach(function (key) {
      result[key] = json[key] || description[key] || ''
    })

    file.contents = new Buffer(JSON.stringify(result, null, 2))
    this.push(file)
    next()
  })
}
