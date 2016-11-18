(function () {
  const { remote, ipcRenderer } = require('electron')
  const fs = require('fs')
  const config = remote.require('./config')
  const invoice = remote.require('./invoice')
  const xlxs = require('xlsx')

  Polymer({
    is: 'x-client-register',

    properties: {
      selectedClient: {
        type: Object,
        value: () => Object.create(null)
      },
      pdfFields: {
        type: Array,
        computed: 'updatePdfFields(selectedClient)'
      }
    },

    ready() {
      const grid = this.$['register-grid']
      const registerFile = config.get('registerFile')
      const view = registerFile ? 'register-view' : 'register-selection'
      
      this.$['view'].select(view)

      this.$['select-register-btn'].addEventListener('change', (event) => {
        const file = event.target.files[0]
        if (file) {
          const register = importRegister(file.path)
          renderToGrid(grid, register)
          config.set('registerFile', file.path)
        }
      })

      this.$['preview-btn'].addEventListener('click', () => {
        const client = this.getClientData()
        if (client) {
          ipcRenderer.send('invoice-preview', client, getInvoiceData())
        }
      })

      this.$['save-btn'].addEventListener('click', () => {
        const client = this.getClientData()
        if (client) {
          ipcRenderer.send('invoice-save', [client], getInvoiceData(), opts)
        }
      })

      this.$['save-all-btn'].addEventListener('click', () => {
        const allClients = grid.items || []

        let opts = {
          excludeCol: {}
        }

        if (this.$['exclude-rahoitus-vastike'].checked) {
          opts.excludeCol['rahoitusvastike'] = 'OK'
        }

        ipcRenderer.send('invoice-save', allClients, opts)
      })
      
      grid.addEventListener('selected-items-changed', () => {
        const selected = grid.selection.selected()
        if (selected.length) {
          const clientIndex = grid.selection.selected()[0]
          const client = grid.items[clientIndex]
          this.selectedClient = client
          /*
          grid.getItem(clientIndex, (err, elem) => {
            console.log(elem)
            
            if (err) return
            
            const focusOutFn = () => {
              grid.selection.deselect(clientIndex)
              elem.removeEventListener(focusOutFn)
            }
            
            elem.addEventListener('focusout', focusOutFn)
          })
          */
          this.$['save-btn'].disabled = false
        } else {
          this.$['save-btn'].disabled = true
        }
      })

      fs.access(registerFile, fs.F_OK, (err) => {
        if (!err) {
          const register = importRegister(registerFile)
          renderToGrid(grid, register)
        }
      })
    },
    
    getClientData() {
      const inputs = Polymer.dom(this.$['field-editor'])
        .querySelectorAll('paper-input')
        
      let isEmpty = true
      const client = inputs.reduce((data, item) => {
        if (item.value !== '') {
          isEmpty = false
        }
        data[item.label] = item.value
        return data
      }, {})
      
      return isEmpty ? null : client
    },
    
    updatePdfFields
  })
  
  function updatePdfFields(selectedClient = {}) {
    return invoice.fieldNames.reduce((arr, field) => {
      const value = selectedClient[field] !== undefined ?
        selectedClient[field] : ''
        
      arr.push({name: field, value: value})
      
      return arr
    }, [])
  }

  /**
   * Read excel file and save it into memory.
   * @param {string} register - Path to the register file.
   * @return {Object} Return js-xlsx worksheet.
   */
  function importRegister(register) {
    const workbook = xlxs.readFile(register)
    const firstSheet = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheet]
    return worksheet
  }

  /**
   * Transform js-xlsx data to be compatible with vaadin-grid and
   * bind the data to an existing grid.
   * @param {Object} grid - Vaadin-grid to bind the worksheet data.
   * @param {Object} worksheet - Js-xlsx worksheet that contains the
   * client register.
   */
  function renderToGrid(grid, worksheet) {
    const range = xlxs.utils.decode_range(worksheet['!ref'])
    const register = xlxs.utils.sheet_to_json(worksheet)
    let columns = []
    
    const startIdx = range.s.c
    const endIdx = range.e.c
    const headerRow = range.s.r
    //Loop first row and add cell values as table columns
    for (let i = startIdx; i < endIdx; i++) {
      const cellAddress = xlxs.utils.encode_cell({c: i, r: headerRow})
      const cell = worksheet[cellAddress]
      
      if (cell) {
        columns.push({name: cell.v})
      }
    }
    
    grid.columns = columns
    grid.items = register
  }

  function getInvoiceData() {
    const {
      laskunumero,  maksuehto, viivästyskorko
    } = config.get('invoiceSettings')

    return {
      päiväys: new Date.now().toLocaleDateString(),
      laskunumero,
      maksuehto,
      viivästyskorko,
      viesti: '',
      products: getProductList()
    }
  }

  function getProductList() {
    let productList = []
    console.log('id="perusvastike" - ', this.$['perusvastike'])

    if (this.$['perusvastike'].checked) {
      const product = {
        name: 'Perusvastike',
        id: 'P 528',
        price: 110,
        count: 1,
        tax: 0.12
      }
      productList.push(product)
    }

    if (this.$['käyttövastike'].checked) {
      const product = {
        name: 'Käyttövastike',
        id: 'P 448',
        price: 210,
        count: 1,
        tax: 0.11
      }
      productList.push(product)
    }

    if (this.$['rahoitusvastike'].checked) {
      const product = {
        name: 'Rahoitusvastike',
        id: 'P 548',
        price: 110,
        count: 1,
        tax: 0.10
      }
      productList.push(product)
    }

    return productList
  }

})()
