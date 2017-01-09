import { remote } from 'electron'
import * as db from '../database'
import { Product, Client } from '../database'
import { VaadinGrid } from '../types/vaadin'

Polymer({
  is: 'product-page',

  async ready() {
    const productList: VaadinGrid = this.$['product-list']
    const products = db.all('products')

    productList.columns = [
      {name: '_id'},
      {name: 'hinta'}
    ]
    productList.items = products
  }
})
