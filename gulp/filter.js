
var through = require('through2')
var path = require('path')

// exporting the plugin main function
module.exports = function (description, descriptionAs) {
  return through.obj(function (file, ence, next) {
    if (!file.isBuffer()) return next()

    var extname = path.extname(file.path)
    var lang = path.basename(file.path, extname)
    var json = JSON.parse(file.contents.toString())
    var result = {}
    Object.keys(description).forEach(function (key) {
      if (lang === descriptionAs) {
        result[key] = json[key] || description[key] || ''
      } else {
        result[key] = json[key] || ''
      }
    })

    file.contents = new Buffer(JSON.stringify(result, null, 2))
    this.push(file)
    next()
  })
}
