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
    const window = window.getBounds();

    config.set('window.x', window.x);
    config.set('window.y', window.y);
    config.set('window.height', window.height);
    config.set('window.width', window.width);
  });

  window.on('closed', () => {
    window = null;
  });
}

chokidar.watch(['ports.js', 'index.html', 'elm.js'])
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
