import * as PouchDB from 'pouchdb'

const db = new PouchDB('database', {
  auto_compaction: true
})

export interface Product {
  id: string
  price: number
  name: string
  tax: number
}

export async function all(): Promise<Array<Product>> {
  const allDocs = await db.allDocs({ include_docs: true })

  return allDocs.rows.map(x => x.doc) as any
}

export function put(item: Product) {
  return db.put(item)
}
