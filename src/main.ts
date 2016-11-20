import * as chokidar from 'chokidar'
import config from './config'
import invoice from './invoice'
import * as path from 'path'

const electron = require('electron')
const { app, BrowserWindow, ipcMain } = electron

let mainWindow

//-----------------------------------------------
// Main function
//-----------------------------------------------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: config.get('window.width'),
    height: config.get('window.height'),
    x: config.get('window.x'),
    y: config.get('window.y')
  })

  mainWindow.loadURL(`file://${__dirname}/ui/index.html`)

  mainWindow.webContents.openDevTools()

  mainWindow.on('close', () => {
    const win = mainWindow.getBounds()

    config.set('window.x', win.x)
    config.set('window.y', win.y)
    config.set('window.height', win.height)
    config.set('window.width', win.width)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

//-----------------------------------------------
// Event listeners
//-----------------------------------------------
ipcMain.on('invoice-preview', (event, client, invoiceData) => {
  let previewWindow = new BrowserWindow({parent: mainWindow, width: 800, height: 1000})
  previewWindow.loadURL(
    `file://${__dirname}/ui/x-invoice-preview.html`
  )
  //previewWindow.webContents.openDevTools()
  ipcMain.once('invoice-preview-ready', (event) => {
    event.sender.send('invoice-data', client, invoiceData)
  })
})

ipcMain.on('invoice-save', (event, clients, invoiceData, opts) => {
  invoice.saveInvoicePdf(clients, invoiceData, opts,
    path.join(__dirname, config.get('invoiceSavePath')))
})


//-----------------------------------------------
// Watch file changes
//-----------------------------------------------
chokidar.watch([`${__dirname}/ui/**/*`])
  .on('change', () => {
    if (mainWindow) {
      mainWindow.reload()
    }
  })

//-----------------------------------------------
// App events
//-----------------------------------------------
app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
