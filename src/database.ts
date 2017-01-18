import Storage from './json-storage'
import { EventEmitter } from 'events'

const productStorage = new Storage<Product>('./storage/products.json')
const clientStorage = new Map<string, Client>()
const _UUID = new Map<string, number>()
export const events = new EventEmitter()

let labels: any = {}

productStorage.forEach((key) => {
  // Get the largest UUID number
  const [label, labelNum] = key.split('__')

  const labelCount = Number(labelNum)
  const highest = Number(labels[label])

  // Add label count by 1 every time same key is encountered.
  if (isNaN(highest) || labelCount > highest) {
    labels[label] = labelCount
  }
})

const keys = Object.keys(labels)

// Update UUID counter to match the number of items on disk.
for (const key of keys) {
  _UUID.set(key, labels[key])
}

export function UUID(label: string) {
  const id = _UUID.get(label)

  if (id !== undefined) {
    _UUID.set(label, id + 1)
    return label + '__' + (id + 1)
  } else {
    _UUID.set(label, 0)
    return label + '__0'
  }
}

export function allProducts(): Product[] {
  let result: Product[] = []

  productStorage.forEach((key, value: Product) => {
    result.push(value)
  })

  return result
}

export function allClients(): Client[] {
  let result: Client[] = []

  clientStorage.forEach((value, key) => {
    result.push(value)
  })

  return result
}

export function putProducts(products: Product[]) {
  for (const product of products) {
    productStorage.setItem(product.id, product)
  }

  productStorage.persist()
  events.emit('db-put-products', products)
}

export function putClients(clients: Client[]) {
  for (const client of clients) {
    clientStorage.set(client.name, client)
  }

  events.emit('db-put-clients', clients)
}

export async function getProduct(id: string): Promise<Product> {
  return productStorage.getItem(id)
}

export async function getClient(name: string): Promise<Client> {
  return clientStorage.get(name)
}

export async function findProduct(properties: Partial<Product>): Promise<Product> {
  const keys = Object.keys(properties) as (keyof Product)[]

  const product = allProducts().find(product => {
    for (const key of keys) {
      if (product[key] !== properties[key]) {
        return false
      }
    }

    return true
  })

  return product || Promise.reject(new Error('No such products found.'))
}

export async function findClient(name: string): Promise<Client> {
  return clientStorage.get(name)
}

export function removeProducts(ids: string[]) {
  for (const id of ids) {
    productStorage.deleteItem(id)
  }

  productStorage.persist()
  events.emit('db-remove-products', ids)
}

export function removeClients(names: string[]) {
  for (const name of names) {
    clientStorage.delete(name)
  }

  events.emit('db-remove-clients', names)
}


export interface Product {
  id: string
  name: string
  price: number
  tax: number
}

export interface Client {
  name: string
  address: string
  postOffice: string
  shares: string[]
}

