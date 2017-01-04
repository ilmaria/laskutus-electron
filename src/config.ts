import * as Config from 'electron-config'
import { ipcMain } from 'electron'

const config = new Config({ defaults: {
  // Default window dimensions
  window: {
    width: 1600,
    height: 1200
  },

  // Register file's path
  registerFile: '',

  // Company information
  JSG: {
    name: 'Lappajärven Loma-Golf Oy',
    yTunnus: '0804876-2',
    tel: '0400 667 190',
    email: 'golf@jgs.fi',
    address: 'Hyyrynkuja 9 B',
    postalAddress: '62600 Lappajärvi',
    IBAN: 'FI73 1193 3006 1027 42'
  },

  invoiceSettings: {
    laskunumero: '1000',
    maksuehto: '21pv netto',
    viivästyskorko: '7,5%'
  },

  // Where to save invoices. Relative to `main.js` file.
  invoiceSavePath: '../laskut'
}}) as Config

export default config


interface Config {
  /**
   * Set an item.
   */
  set(key: string, value: any)

  /**
   * Set multiple items at once.
   */
  set(object: Object)

  /**
   * Get an item.
   */
  get(key: string)

  /**
   * Check if an item exists.
   */
  has(key: string)

  /**
   * Delete an item.
   */
  delete(key: string)

  /**
   * Delete all items.
   */
  clear()

  /**
   * Get the item count.
   */
  size: number

  /**
   * Get all the config as an object or replace the current config with an object:
   * `conf.store = {  hello: 'world' };`
   */
  store: Object

  /**
   * Get the path to the config file.
   */
  path: string
}
