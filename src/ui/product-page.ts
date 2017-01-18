import * as db from '../database'
import { Product, Client } from '../database'
import { VaadinGrid } from '../types/vaadin'

export default {
  is: 'product-page',

  ready() {
    const productList: VaadinGrid = this.$['product-list']
    const products = db.allProducts()

    productList.columns = [
      {name: 'name',  resizable: true, sortable: true },
      {name: 'price', resizable: true, sortable: true },
      {name: 'tax',   resizable: true, sortable: true }
    ]

    productList.items = products

    productList.sortOrder = [{ column: 0, direction: 'asc' }]

    productList.header.getCell(0, 0).content = 'Nimi'
    productList.header.getCell(0, 1).content = 'Hinta (€)'
    productList.header.getCell(0, 2).content = 'Alv (%)'

    db.events.on('db-put-products', (products: Product[]) => {
      for (const product of products) {
        productList.items.push(product)
        productList.size++
      }
    })

    db.events.on('db-remove-products', (ids: string[]) => {
      let i = productList.items.length

      while (i-- > 0) {
        const product = productList.items[i]

        if (ids.includes(product.id)) {
          productList.items.splice(i, 1)
        }
      }

      productList.size = productList.items.length
      productList.refreshItems()
    })
  },

  removeProduct() {
    const productList: VaadinGrid = this.$['product-list']
    const selected = productList.selection.selected()
    const products: string[] = selected.map(index => productList.items[index].id)

    db.removeProducts(products)
  }
} as polymer.Base
