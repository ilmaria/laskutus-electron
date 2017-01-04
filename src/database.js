const PouchDB = require('pouchdb')

const db = new PouchDB('database', {
  auto_compaction: true
})

module.exports = {
  all, put
}

function all() {
  return db.allDocs({ include_docs: true })
    .then(result => result.rows)
    .then(rows => rows.map(x => x.doc))
}

function put(item) {
  return db.put(item)
}
