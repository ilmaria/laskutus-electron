const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const config = require('./config');
const chokidar = require('chokidar');

let window;

function createWindow() {
  window = new BrowserWindow({
    width: config.get('window.width'),
    height: config.get('window.height'),
    x: config.get('window.x'),
    y: config.get('window.y')
  });

  window.loadURL(`file://${__dirname}/ui/index.html`);

  window.webContents.openDevTools();

  window.on('close', () => {
    const win = window.getBounds();

    config.set('window.x', win.x);
    config.set('window.y', win.y);
    config.set('window.height', win.height);
    config.set('window.width', win.width);
  });

  window.on('closed', () => {
    window = null;
  });
}

ipcMain.on('invoice-preview', (event, invoiceData) => {
  let previewWindow = new BrowserWindow({parent: window, width: 800, height: 1000});
  previewWindow.loadURL(
    `file://${__dirname}/ui/x-invoice-preview.html`
  );
  //previewWindow.webContents.openDevTools();
  ipcMain.on('invoice-preview-ready', (event) => {
    event.sender.send('invoice-data', invoiceData);
  })
});

chokidar.watch([`${__dirname}/ui/**/*`])
  .on('change', () => {
    if (window) {
      window.reload();
    }
  })

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (window === null) {
    createWindow();
  }
});
