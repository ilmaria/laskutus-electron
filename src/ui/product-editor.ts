import * as db from '../database'
import { VaadinGrid } from '../types/vaadin'

export default {
  is: 'product-editor',

  async isProductValid(name: any, product: db.Product): Promise<boolean> {
    const isValidName = name.validate()
    if (isValidName) {
      try {
        await db.findProduct(product)
        return false
      } catch (e) {
        return true
      }
    } else {
      return true
    }
  },

  async createProduct() {
    const name = this.$$('[label="Nimi"]')
    const price = this.$$('[label="Hinta"]')
    const tax = this.$$('[label="Alv"]')

    const product = {
      name: name.value,
      price: price.value,
      tax: tax.value
    }

    if (await this.isProductValid(name, product)) {
      db.putProducts([{
        id: db.UUID('product'),
        ...product
      }])
    }
  }
} as polymer.Base
