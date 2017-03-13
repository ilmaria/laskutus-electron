import { ipcRenderer } from 'electron'
import * as fs from 'fs'
import * as xlxs from 'xlsx'
import * as invoice from '../invoice'
import config from '../config'
import * as db from '../database'
import { VaadinGrid } from '../types/vaadin'

interface ExcelClient {
  nimi: string
  lähiosoite: string
  postitoimipaikka: string
  numero: string
  rahoitusvastike: string
}

export default {
  is: 'invoice-page',

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
        const clients = parseRegister(register)

        db.putClients(clients)
        renderGrid(grid, clients)

        this.$['view'].select('register-view')
      } else {
        this.$['view'].select('register-selection')
      }
    })

    this.initEventListeners(grid)
  },

  /**
   * Initialize event listeners for buttons in html and for grid change events.
   */
  initEventListeners(grid: VaadinGrid) {
    /**
     * Button listener for submitting a selected client register file.
     * Parses the file and adds its content to the Vaadin grid.
     */
    this.$['select-register-btn'].addEventListener('change', (event: Event) => {
      const file = (event.target as HTMLInputElement).files[0]
      if (file) {
        const register = importRegister(file.path)
        const clients = parseRegister(register)

        db.putClients(clients)
        renderGrid(grid, clients)

        config.set('registerFile', file.path)

        this.$['view'].select('register-view')
      }
    })

    /**
     * Preview the invoice for the selected client.
     */
    this.$['preview-btn'].addEventListener('click', () => {
      const clients = getSelectedClients(grid)

      if (clients.length) {
        ipcRenderer.send('preview-invoice', clients[0], this.getInvoiceData())
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

      if (this.$['exclude-rahoitusvastike-ok'].checked) {
        //opts.excludeCol['rahoitusvastike'] = 'OK'
      }

      ipcRenderer.send('invoice-save', allClients, this.getInvoiceData())
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
    return {
      date: new Date().toLocaleDateString(),
      paymentTerms: this.paymentTerms,
      penaltyInterest: this.penaltyInterest,
      notes: '',
      products: this.selectedProductItems,
      dueDate: ''
    }
  }

} as polymer.Base


/**
 * Save all clients from the register to the database.
 * @param {Object} register - Register worksheet to save to database.
 */
function parseRegister(worksheet: xlxs.IWorkSheet): db.Client[] {
  const register: ExcelClient[] = xlxs.utils.sheet_to_json(worksheet) as any

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
    } else if (client.nimi) {
      clientName = client.nimi
      clients.push({
        name: client.nimi,
        address: client.lähiosoite,
        postOffice: client.postitoimipaikka,
        shares: [client.numero]
      })
    }
  }

  return clients
}

/**
 * Get all selected clients in the table `grid`. This function
 * assumes that the Vaadin grid `items` property is an array and not a function.
 * @param {Object} grid - Vaadin grid object.
 */
function getSelectedClients(grid: VaadinGrid): Array<db.Client> {
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
 * @param {Object} clients - Clients to populate the grid.
 */
function renderGrid(grid: VaadinGrid, clients: db.Client[]) {
  const columns = [
    { name: 'name',       resizable: true, sortable: true },
    { name: 'address',    resizable: true, sortable: true },
    { name: 'postOffice', resizable: true, sortable: true },
    { name: 'shares',     resizable: true, sortable: true },
  ]

  grid.columns = columns
  grid.items = clients

  grid.sortOrder = [{ column: 0, direction: 'asc' }]

  grid.header.getCell(0, 0).content = 'Nimi'
  grid.header.getCell(0, 1).content = 'Osoite'
  grid.header.getCell(0, 2).content = 'Postitoimipaikka'
  grid.header.getCell(0, 3).content = 'Osakkeet'
}
