
var through = require('through2')
var path = require('path')

// exporting the plugin main function
module.exports = function (description, descriptionAs) {
  return through.obj(function (file, ence, next) {
    if (!file.isBuffer()) return next()

    var extname = path.extname(file.path)
    var lang = path.basename(file.path, extname)
    var json = JSON.parse(file.contents.toString())
    Object.keys(description).forEach(function (key) {
      if (!json[key] && lang === descriptionAs) {
        json[key] = description[key]
      }
    })

    file.contents = new Buffer(JSON.stringify(json, null, 2))
    this.push(file)
    next()
  })
}
