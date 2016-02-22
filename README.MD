# i18n loader of teambition web for webpack

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

[tb-i18n](https://github.com/teambition/tb-i18n)

Translate keys to register locales in `tb-i18n`

``` javascript
require("locales.i18n?languages[]=en&languages[]=zh");
// => define
```

Translate from

```
key1
key2
key3
```

to

```javascript
var i18n = require('tb-i18n');
i18n.setLocales('en', {
  "key1": "en.value1",
  "key2": "en.value2",
  "key3": "en.value3"
})
i18n.setLocales('zh', {
  "key1": "zh.value1",
  "key2": "zh.value2",
  "key3": "zh.value3"
})
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
