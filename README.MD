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

## 简体中文 翻译为 繁体中文
调用百度翻译 API 翻译 `/locales/zh.json` 并覆盖 `/locales/zh_tw.json`
将当前 简体中文 文档缓存（可省，但需保证 cache 内文档与 最新文档 不同）

`$ gulp cache`

下载 最新文档 并比对与 cache 下版本的不同 

`$ gulp download`

翻译 - 参数：`-a | --all` 全量翻译； `-f | --force` 不执行 确认修改 直接覆盖

`$ gulp chs-to-cht`

上传

`$ gulp post-cht`

### chs-to-cht 遇到 54003（请求过于频繁）报错时

可以尝试 `--queriesPerSecond [qps]` 选项，如：

`$ gulp chs-to-cht --queriesPerSecond 0.6`

指定了我们以 0.6 qps 为请求频率使用百度翻译服务，即：约 1.7秒 发一个请求。关于百度服务的层级，相关信息见：（[链接1](http://api.fanyi.baidu.com/api/trans/product/prodinfo#0)，[链接2](https://fanyiapp.cdn.bcebos.com/api/doc/%E7%99%BE%E5%BA%A6%E7%BF%BB%E8%AF%91%E5%BC%80%E6%94%BE%E5%B9%B3%E5%8F%B0%E9%80%9A%E7%94%A8%E7%BF%BB%E8%AF%91API%E6%9C%8D%E5%8A%A1%E5%8D%87%E7%BA%A7%E8%AF%B4%E6%98%8E.pdf)）

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
