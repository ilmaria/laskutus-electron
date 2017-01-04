import * as PouchDB from 'pouchdb'

const db = new PouchDB('database', {
  auto_compaction: true
})

export function all() {
  return db.allDocs({ include_docs: true })
    .then(result => result.rows)
    .then(rows => rows.map(x => x.doc))
}

export function put(item) {
  return db.put(item)
}
