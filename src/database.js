"use strict";
const PouchDB = require("pouchdb");
const db = new PouchDB('database', {
    auto_compaction: true
});
function all() {
    return db.allDocs({ include_docs: true })
        .then(result => result.rows)
        .then(rows => rows.map(x => x.doc));
}
exports.all = all;
function put(item) {
    return db.put(item);
}
exports.put = put;
