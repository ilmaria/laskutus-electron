import * as fs from 'fs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'

export default class JsonStorage<T> {
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

  getItem(key: string): T {
    return this.storage[key]
  }

  setItem(key: string, value: T) {
    this.storage[key] = value
  }

  deleteItem(key: string) {
    delete this.storage[key]
  }

  forEach(callback: (key: string, value: T) => void) {
    for (const key of Object.keys(this.storage)) {
      callback(key, this.storage[key])
    }
  }

  persist() {
    this.writeStorage(this.storage)
  }

}
