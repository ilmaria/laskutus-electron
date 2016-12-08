const electron = require('electron')
const { app, BrowserWindow, ipcMain } = electron
const config = require('./config')
const invoice = require('./invoice')
const path = require('path')

if (process.env.NODE_ENV === 'development') {
  var chokidar = require('chokidar')
}

let window

//-----------------------------------------------
// Main function
//-----------------------------------------------
function createWindow() {
  window = new BrowserWindow({
    width: config.get('window.width'),
    height: config.get('window.height'),
    x: config.get('window.x'),
    y: config.get('window.y')
  })

  window.loadURL(`file://${__dirname}/ui/index.html`)

  window.webContents.openDevTools()

  window.on('close', () => {
    const win = window.getBounds()

    config.set('window.x', win.x)
    config.set('window.y', win.y)
    config.set('window.height', win.height)
    config.set('window.width', win.width)
  })

  window.on('closed', () => {
    window = null
  })
}

//-----------------------------------------------
// Event listeners
//-----------------------------------------------
ipcMain.on('invoice-preview', (event, client, invoiceData) => {
  let previewWindow = new BrowserWindow({parent: window, width: 800, height: 1000})
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
if (process.env.NODE_ENV === 'development') {
  chokidar.watch([`${__dirname}/ui/**/*`])
    .on('change', () => {
      if (window) {
        window.reload()
      }
    })
}

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
  if (window === null) {
    createWindow()
  }
})
