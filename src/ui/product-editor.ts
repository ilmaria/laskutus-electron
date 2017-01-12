import * as db from '../database'
import { VaadinGrid } from '../types/vaadin'

export default {
  is: 'product-editor',

  ready() {

  },

  async isProductValid(id: any, name: any): Promise<boolean> {
    const isValidName = name.validate()
    const isValidId = id.validate()

    const existingItem = await db.get(id.value)

    if (isValidName && isValidId && !!existingItem) {
      //id.errorMessage = 'Tämä tunnus on jo varattu'
    }

    return isValidName && isValidId && !existingItem
  },

  async createProduct() {
    const name = this.$$('[label="Nimi"]')
    const id = this.$$('[label="Tunnus"]')
    const price = this.$$('[label="Hinta"]')
    const tax = this.$$('[label="Alv"]')

    if (await this.isProductValid(id, name)) {
      db.put({
        _id: id.value,
        name: name.value,
        price: price.value,
        tax: tax.value,
        type: 'products'
      })
    }
  }
} as polymer.Base
