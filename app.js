const electron = require('electron');
const { app, BrowserWindow } = electron;
const Config = require('electron-config');
const chokidar = require('chokidar');

const config = new Config({ defaults: {
  window: {
    width: 1600,
    height: 1200
  }
}});
let window;

function createWindow() {
  window = new BrowserWindow({
    width: config.get('window.width'),
    height: config.get('window.height'),
    x: config.get('window.x'),
    y: config.get('window.y')
  });

  window.loadURL(`file://${__dirname}/src/index.html`);

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

chokidar.watch(['./src/ports.js', './src/index.html', './src/elm.js'])
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
