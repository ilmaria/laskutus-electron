import { remote } from 'electron'
import * as db from '../database'
import { VaadinGrid } from '../types/vaadin'

export default {
  is: 'product-editor',

  ready() {

  },

  isValidProduct() {
    const isValidName = this.$$('[label="Nimi"]').validate()
    const isValidId = this.$$('[label="Tunnus"]').validate()

    return isValidName && isValidId
  },

  createProduct() {
    const name = this.$$('[label="Nimi"]')
    const id = this.$$('[label="Tunnus"]')
    const price = this.$$('[label="Hinta"]')
    const tax = this.$$('[label="Alv"]')

    if (!name.validate() || !id.validate()) {
      return false
    }

    return db.put({
      _id: id.value,
      name: name.value,
      price: price.value,
      tax: tax.value,
      type: 'products'
    })
  }
} as polymer.Base
