const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const config = require('./config');
const chokidar = require('chokidar');
const invoicePreview = require('./invoice-preview');

let window;

function createWindow() {
  window = new BrowserWindow({
    width: config.get('window.width'),
    height: config.get('window.height'),
    x: config.get('window.x'),
    y: config.get('window.y')
  });

  window.loadURL(`file://${__dirname}/../renderer-process/index.html`);

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

ipcMain.on('invoice-preview', (event, previewUrl) => {
  let previewWindow = new BrowserWindow({parent: window, width: 1200, height: 800});
  console.log(previewUrl)
  previewWindow.loadURL(`file://${__dirname}/../pdfjs/web/viewer.html?file=${previewUrl}`);
});

chokidar.watch(['./renderer-process/**/*'])
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
