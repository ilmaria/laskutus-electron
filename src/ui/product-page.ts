import { remote } from 'electron'
import * as db from '../database'
import { Product, Client } from '../database'
import { VaadinGrid } from '../types/vaadin'

export default {
  is: 'product-page',

  ready() {
    const productList: VaadinGrid = this.$['product-list']
    const products = db.all('products')

    productList.columns = [
      {name: '_id',   resizable: true, sortable: true },
      {name: 'name',  resizable: true, sortable: true },
      {name: 'price', resizable: true, sortable: true },
      {name: 'tax',   resizable: true, sortable: true }
    ]

    productList.items = products

    productList.sortOrder = [{ column: 0, direction: 'asc' }]

    productList.header.getCell(0, 0).content = 'Tunnus'
    productList.header.getCell(0, 1).content = 'Nimi'
    productList.header.getCell(0, 2).content = 'Hinta'
    productList.header.getCell(0, 3).content = 'Alv'

    db.events.on('db-put', (item: db.DbItem) => {
      if (item.type === 'products') {
        productList.items.push(item)
        productList.size++
      }
    })
  }
} as polymer.Base
