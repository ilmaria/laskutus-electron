const electron = require('electron')
const { app, BrowserWindow, ipcMain } = electron
const config = require('./config')
const invoice = require('./invoice')
const path = require('path')
const os = require('os')
const { autoUpdater } = require('electron-auto-updater')

const DEV_ENV = process.env.NODE_ENV === 'development'

if (DEV_ENV) {
  var chokidar = require('chokidar')
}

let mainWindow

//-----------------------------------------------
// Main function
//-----------------------------------------------
function createMainWindow() {
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
  const previewWindow = new BrowserWindow(
    {parent: mainWindow, width: 800, height: 1000})

  previewWindow.loadURL(
    `file://${__dirname}/ui/x-invoice-preview.html`)

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
if (DEV_ENV) {
  chokidar.watch([`${__dirname}/ui/**/*`])
    .on('change', () => {
      if (mainWindow) {
        mainWindow.reload()
      }
    })
}

//-----------------------------------------------
// App events
//-----------------------------------------------
app.on('ready', () => {
  createMainWindow()

  if (!DEV_ENV) {
    initAutoUpdates()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow()
  }
})

app.setAppUserModelId('com.squirrel.laskutus-electron.laskutus-electron')

function initAutoUpdates() {
  if (os.platform() === 'linux') {
    return
  }

  autoUpdater.addListener('update-downloaded', () => {
    log('update downloaded')
    const notificationWindow = new BrowserWindow(
      {parent: mainWindow, width: 400, height: 600, modal: true})

    notificationWindow.loadURL(
      `file://${__dirname}/ui/x-update-notification.html`)

    ipcMain.once('close-notification-window', () => {
      notificationWindow.close()
    })

    ipcMain.once('quit-and-update', () => {
      autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.addListener('checking-for-update', () => {
    log('checking-for-update')
  })
  autoUpdater.addListener('update-available', () => {
    log('update-available')
  })
  autoUpdater.addListener('update-not-available', () => {
    log('update-not-available')
  })
  autoUpdater.addListener('error', (err) => {
    log(err)
  })

  mainWindow.webContents.once("did-frame-finish-load", () => {
    log('start checking updates')
    autoUpdater.checkForUpdates()
  })
}

function log(msg) {
  mainWindow.webContents.executeJavaScript(`console.log(\`${msg}\`)`)
}