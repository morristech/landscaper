import fs from 'fs'
import path from 'path'
import npmi from 'npmi'
import rimraf from 'rimraf'

export function isExistingDirectory (path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (error, stats) => {
      resolve(!!error && stats.isDirectory())
    })
  })
}

export function npmInstall (packageName) {
  return new Promise((resolve, reject) => {
    npmi({name: packageName}, (error, result) => {
      error ? reject(error) : resolve(result)
    })
  })
}

export default class PackageCache {
  constructor (directory) {
    this._directory = directory
  }

  async getPackage (packageName) {
    const packagePath = path.join(this._directory, 'node_modules', packageName)
    const isInstalled = await isExistingDirectory(packagePath)
    if (!isInstalled) {
      await npmInstall(this._directory, packageName)
    }
    return packagePath
  }

  static auto () {
    const cachePath = path.join(path.dirname(__dirname), 'cache')
    fs.mkdirSync(cachePath)
    const cache = new PackageCache(cachePath)
    cache.empty = () => {
      rimraf.sync(cachePath)
    }
  }
}
