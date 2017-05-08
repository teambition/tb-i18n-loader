# i18n loader of teambition web for webpack

## Config
```
mkdir config && touch config/default.json
{
  "LANGUAGES": ["zh", "zh_tw", "en", "ja", "ko"],
  // use for gulp notice
  "TOKEN": "Your Teambition AccessToken",
  "TASKLIST_ID": "5809ebecad0e08685f6e49a8",
  "TEAM_ID": "5763667798cb0609458bacdd"
}
```

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

[tb-i18n](https://github.com/teambition/tb-i18n)

Translate keys to register locales in `tb-i18n`

``` javascript
var i18n = require("locales.i18n?languages[]=en&languages[]=zh&descriptionAs=zh");
// register locales to i18n and return i18n object
```

Translate from

```
@namespace: example
{
  "key1": "description1",
  "key2": "description2",
  "key3": "description3"
}
```

to

```javascript
var i18n = require('tb-i18n');
i18n.setLocales('en', {
  "example.key1": "en.value1",
  "example.key2": "en.value2",
  "example.key3": "en.value3"
})
i18n.setLocales('zh', {
  "example.key1": "zh.value1",
  "example.key2": "zh.value2",
  "example.key3": "zh.value3"
})
```

## query

### languages: []string
The string array of languages those to register.

### desciptionAs: string = ''
Set the desciption as default value of the specified language.


## Attention
Set the namespace at the first line!!!

## Develop
export ONESKY_SECRET='OneSky Secret'

export ONESKY_API_KEY='OneSky ApiKey'

export TRANSLATE_KEY='Baidu Translate Key'

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
