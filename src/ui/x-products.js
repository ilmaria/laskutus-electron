{
const { remote } = require('electron')
const db = remote.require('./database')

Polymer({
  is: 'x-products',

  ready() {
    const productList = this['product-list']

    db.all().then(console.log.bind(console))
  }
})

}
