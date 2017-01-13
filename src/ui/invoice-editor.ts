import config from '../config'

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
    }
  },

  ready() {

  }

} as polymer.Base
