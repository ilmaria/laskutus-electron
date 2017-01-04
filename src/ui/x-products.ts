{
const { remote } = require('electron')
const db = remote.require('./database')

Polymer({
  is: 'x-products',

  async ready() {
    const productList = this.$['product-list']
    const products = await db.all()

    productList.columns = [
      {name: '_id'},
      {name: 'hinta'}
    ]
    productList.items = products
  }
})

}
