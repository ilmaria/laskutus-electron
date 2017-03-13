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
    selectedProductItems: {
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
    productList.detailedEvents = ['click']

    productList.header.getCell(0, 0).content = 'Nimi'
    productList.header.getCell(0, 1).content = 'Hinta (€)'
    productList.header.getCell(0, 2).content = 'Alv (%)'

    // Store extra detail for products in this array
    let productListExtra = products.map(() => {
      return {
        count: 4,
        perShare: false
      }
    })

    // Generate details view for individual product rows
    productList.rowDetailsGenerator = (rowIndex) => {
      const container = document.createElement('div')
      container.id = productList.items[rowIndex].id
      container.style.cssText = 'height: 7em; display: flex'

      const detailsTemplate = this.$['product-row-details']
      const productDetails = productListExtra[rowIndex]

      let a = detailsTemplate.querySelector('paper-input')
      a.value = productDetails.count
      let b = detailsTemplate.querySelector('paper-checkbox')
      b.checked = productDetails.perShare

      for (let childElem of detailsTemplate.children) {
        container.appendChild(childElem)
      }

      return container
    }

    db.events.on('db-put-products', (products: Product[]) => {
      for (const product of products) {
        productList.items.push(product)
        productList.size++

        productListExtra.push({
          count: 0,
          perShare: false
        })
      }
    })

    db.events.on('db-remove-products', (ids: string[]) => {
      let i = productList.items.length

      while (i-- > 0) {
        const product = productList.items[i]

        if (ids.includes(product.id)) {
          productList.items.splice(i, 1)
          productListExtra.splice(i, 1)
        }
      }

      productList.size = productList.items.length
      productList.refreshItems()
    })

    productList.addEventListener('selected-items-changed', () => {
      const selected = productList.selection.selected()

      this.selectedProductItems = selected.map(index => {
        return {
          product: productList.items[index],
          count: productListExtra[index].count,
          perShare: productListExtra[index].perShare
        }
      })
    })

    const openedDetails = new Map<number, boolean>()

    productList.addEventListener('detailed-click', (event: any) => {
      const rowIndex = event.detail.row

      const isRowOpened = openedDetails.get(rowIndex)

      productList.setRowDetailsVisible(rowIndex, !isRowOpened);

      openedDetails.set(rowIndex, !isRowOpened)
    })
  }
} as polymer.Base
