const Config = require('electron-config')
const { ipcMain } = require('electron')

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
    viivästyskorko: 0.075
  }
}})

module.exports = config
