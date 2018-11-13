const shelljs = require('shelljs')

const tagRE = /^[0-9]+(\.[0-9]+)*(-(alpha|beta)\.[0-9]+)?/

const prepare = () => {
  const { stderr, stdout } = shelljs.exec('git log -1 --pretty=%B')

  if (stderr) {
    return Promise.reject(stderr)
  }

  if (!tagRE.test(stdout)) {
    return Promise.reject(-1)
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

  const { code } = shelljs.exec(`npm publish --tag ${tag}`)

  if (code !== 0) {
    return Promise.reject()
  }

  return Promise.resolve()
}

prepare()
  .then((version) => publish(version))
  .then(() => {
    console.info('Published.')
    process.exit(0)
  })
  .catch((err) => {
    if (err === -1) {
      console.info('Not a release commit.')
      process.exit(0)
      return
    }
    console.error(err)
    process.exit(1)
  })
