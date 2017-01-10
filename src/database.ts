import * as storage from 'node-persist'

storage.initSync({continuous: false})

export interface Product {
  _id: string
  name: string
  price: number
  tax: number
  type: 'products'
}

export interface Client {
  name: string
  address: string
  postOffice: string
  shares: string[]
  type: 'clients'
}

type DbItem = Product | Client


export function all(type: 'clients'): Client[]
export function all(type: 'products'): Product[]
export function all(type: DbItem['type']): DbItem[] {
  let result: DbItem[] = []

  storage.forEach((key, value: DbItem) => {
    if (value.type === type) {
      result.push(value)
    }
  })

  return result
}

export function put(item: DbItem) {
  let key: string

  if (item.type === 'products') {
    key = item._id
  } else {
    key = item.name
  }

  storage.setItem(key, item)
  storage.persistKey(key)
}

export function putAll(items: DbItem[]) {
  for (const item of items) {
    let key: string

    if (item.type === 'products') {
      key = item._id
    } else {
      key = item.name
    }

    storage.setItem(key, item)
  }

  return storage.persist()
}

export async function get<T extends DbItem>(id: string): Promise<T> {
  return storage.getItem(id) as any
}


