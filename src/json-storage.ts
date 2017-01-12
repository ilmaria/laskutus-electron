import * as fs from 'fs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'

export default class JsonStorage {
  private storagePath: string
  private storage: any

  constructor(storagePath = './storage/storage.json') {
    this.storagePath = storagePath

    try {
      fs.accessSync(storagePath, fs.constants.F_OK)
    } catch (err) {
      mkdirp.sync(path.dirname(storagePath))
      this.writeStorage({})
    }

    const data = fs.readFileSync(this.storagePath, 'utf8')
    this.storage = JSON.parse(data)
  }

  writeStorage(jsObject: any) {
    fs.writeFileSync(this.storagePath, JSON.stringify(jsObject))
  }

  getItem(key: string) {
    return this.storage[key]
  }

  setItem(key: string, value: any) {
    this.storage[key] = value
  }

  forEach(callback: (key: string, value: any) => void) {
    for (const key of Object.keys(this.storage)) {
      callback(key, this.storage[key])
    }
  }

  persist() {
    this.writeStorage(this.storage)
  }

}
