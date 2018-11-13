const shelljs = require('shelljs')

const tagRE = /^[0-9]+(\.[0-9]+)*(-(alpha|beta)\.[0-9]+)?/

const prepare = () => {
  const { stderr, stdout } = shelljs.exec('git log -1 --pretty=%B')

  if (stderr) {
    return Promise.reject(stderr)
  }

  if (!tagRE.test(stdout)) {
    return Promise.reject('Not a release commit.')
  }

  return Promise.resolve(stdout)
}

const getTag = (version) => {
  if (version.indexOf('alpha') > -1) {
    return 'prerelease'
  }

  if (version.indexOf('beta') > -1) {
    return 'next'
  }

  return 'latest'
}

const publish = (version) => {
  const tag = getTag(version)

  const { stderr, stdout } = shelljs.exec(`npm publish --tag ${tag}`)

  if (stderr) {
    return Promise.reject(stderr)
  }

  return Promise.resolve(stdout)
}

prepare()
  .then((version) => publish(version))
  .then((ret) => console.log(ret))
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
