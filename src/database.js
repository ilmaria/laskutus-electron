const PouchDB = require('pouchdb')

const db = new PouchDB('database', {
  auto_compaction: true
})

module.exports = {
  all
}

function all() {
  return db.allDocs({ include_docs: true })
    .then(result => result.rows)
}
