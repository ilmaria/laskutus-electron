import config from '../config'
import * as db from '../database'
import { Product } from '../database'
import { VaadinGrid } from '../types/vaadin'

const invoiceSettings = config.get('invoiceSettings')

export default {
  is: 'invoice-editor',

  properties: {
    today: {
      type: Date,
      value: () => {
        // Get only date part of the ISO string
        return new Date().toISOString().split('T')[0]
      },
      readOnly: true
    },
    paymentTerms: {
      type: String,
      value: invoiceSettings.paymentTerms,
      notify: true
    },
    penaltyInterest: {
      type: String,
      value: invoiceSettings.penaltyInterest,
      notify: true
    },
    selectedProducts: {
      type: Array,
      value: (): any[] => [],
      notify: true
    }
  },

  ready() {
    const productList: VaadinGrid = this.$['product-selector']
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

    productList.addEventListener('selected-items-changed', () => {
      const selected = productList.selection.selected()
      console.log('change')

      this.selectedProducts = selected.map(index => productList.items[index])
    })
  }
} as polymer.Base
