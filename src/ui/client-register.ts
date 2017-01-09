import { remote, ipcRenderer } from 'electron'
import * as fs from 'fs'
import * as xlxs from 'xlsx'
import * as invoice from '../invoice'
import config from '../config'
import * as db from '../database'
import { VaadinGrid } from '../types/vaadin'

Polymer({
  is: 'client-register',

  properties: {
    invoiceSettings: {
      type: Array,
      value: () => {
        const settings = config.get('invoiceSettings')
        return [
          { label: 'Laskunumeron etuliite',
            value: settings.laskunumero
          },
          { label: 'Maksuehto',
            value: settings.maksuehto
          },
          { label: 'Viivästyskorko',
            value: settings.viivästyskorko
          }]
      }
    }
  },

  observers: [
    'invoiceSettingsChanged(invoiceSettings.*)'
  ],

  ready() {
    const grid: VaadinGrid = this.$['register-grid']
    const registerFile = config.get('registerFile')

    /**
     * Check if the register file saved in config exists and then
     * parse it and add its data to the Vaadin grid. If the register
     * file doesn't exist, open the register selection dialog.
     */
    fs.access(registerFile, fs.constants.F_OK, (err) => {
      if (!err) {
        const register = importRegister(registerFile)
        saveRegister(register)
        renderToGrid(grid, register)

        this.$['view'].select('register-view')
      } else {
        this.$['view'].select('register-selection')
      }
    })

    /**
     * Button listener for submitting a selected client register file.
     * Parses the file and adds its content to the Vaadin grid.
     */
    this.$['select-register-btn'].addEventListener('change', (event: Event) => {
      const file = (event.target as HTMLInputElement).files[0]
      if (file) {
        const register = importRegister(file.path)
        renderToGrid(grid, register)
        config.set('registerFile', file.path)
      }
    })

    /**
     * Preview the invoice for the selected client.
     */
    this.$['preview-btn'].addEventListener('click', () => {
      const clients = getSelectedClients(grid)
      if (clients.length) {
        ipcRenderer.send('invoice-preview', clients[0], this.getInvoiceData())
      }
    })

    /**
     * Save invoices for selected clients as PDF.
     */
    this.$['save-btn'].addEventListener('click', () => {
      const clients = getSelectedClients(grid)
      if (clients.length) {
        const opts = {}

        ipcRenderer.send('invoice-save', clients, this.getInvoiceData(), opts)
      }
    })

    /**
     * Save invoices for all clients in the register.
     */
    this.$['save-all-btn'].addEventListener('click', () => {
      const allClients = grid.items || []

      let opts: invoice.Opts = {
        excludeCol: {}
      }

      if (this.$['exclude-rahoitusvastike-ok'].checked) {
        opts.excludeCol['rahoitusvastike'] = 'OK'
      }

      ipcRenderer.send('invoice-save', allClients, this.getInvoiceData(), opts)
    })

    /**
     * Disable save button when selected clients arrays is empty.
     */
    grid.addEventListener('selected-items-changed', () => {
      const selected = grid.selection.selected()

      this.$['save-btn'].disabled = !selected.length
    })
  },

  /**
   * Get data that will be same for all created invoices.
   */
  getInvoiceData(): invoice.Data {
    const {
      laskunumero,  maksuehto, viivästyskorko
    } = config.get('invoiceSettings')

    return {
      päiväys: new Date().toLocaleDateString(),
      laskunumero,
      maksuehto,
      viivästyskorko,
      viesti: '',
      products: this.getProductList(),
      eräpäivä: ''
    }
  },

  /**
   * Add all selected products to the product list.
   */
  getProductList(): Array<invoice.Product> {
    let productList: Array<invoice.Product> = []

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
  },

  /**
   * Save changed settings to config.
   */
  invoiceSettingsChanged({path, value}: {path: string, value: any}) {
    const pathTable: any = {
      '#0': 'laskunumero',
      '#1': 'maksuehto',
      '#2': 'viivästyskorko'
    }

    // Save settings only every 100 ms
    this.debounce('invoiceSettingsChanged', () => {
      // Match with pattern like `#1`.
      const match = path.match(/#\d+/)
      const key = match ? match[0] : null
      config.set(`invoiceSettings.${pathTable[key]}`, value)
    }, 100)
  }
}) // end Polymer()


/**
 * Save all clients from the register to the database.
 * @param {Object} register - Register worksheet to save to database.
 */
function saveRegister(worksheet: xlxs.IWorkSheet) {
  const register: any[] = xlxs.utils.sheet_to_json(worksheet)

  register.sort((a, b) => {
    if (a.nimi < b.nimi) return -1
    if (a.nimi > b.nimi) return 1
    return 0
  })

  let clients: db.Client[] = []
  let clientName = ''

  for (const client of register) {
    if (client.nimi === clientName) {
      // Add listed share number to clients shares
      clients[clients.length-1].shares.push(client.numero)
    } else {
      clientName = client.nimi
      clients.push({
        name: client.nimi,
        address: client.kähisoite,
        postOffice: client.postitoimipaikka,
        shares: [client.numero],
        type: 'clients'
      })
    }
  }

  db.put(clients)
}

/**
 * Get all selected clients in the table `grid`. This function
 * assumes that the Vaadin grid `items` property is an array and not a function.
 * @param {Object} grid - Vaadin grid object.
 */
function getSelectedClients(grid: VaadinGrid): Array<invoice.Client> {
  // indices of selected items
  const selected = grid.selection.selected()

  return selected.map(index => grid.items[index])
}

/**
 * Read excel file and save it into memory.
 * @param {string} register - Path to the register file.
 */
function importRegister(register: string) {
  const workbook = xlxs.readFile(register)
  const firstSheet = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheet]
  return worksheet
}

/**
 * Transform js-xlsx data to be compatible with vaadin-grid and
 * bind the data to an existing grid.
 * @param {Object} grid - Vaadin grid to bind the worksheet data.
 * @param {Object} worksheet - Js-xlsx worksheet that contains the
 * client register.
 */
function renderToGrid(grid: VaadinGrid, worksheet: xlxs.IWorkSheet) {
  const range = xlxs.utils.decode_range(worksheet['!ref'] as any)
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
