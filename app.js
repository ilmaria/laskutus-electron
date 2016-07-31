const electron = require('electron');
const {app, BrowserWindow} = electron;
const Config = require('electron-config');

const config = new Config({ defaults: {
  window: {
    width: 1600,
    height: 1200
  }
}});
let win;

function createWindow() {
  win = new BrowserWindow({
    width: config.get('window.width'),
    height: config.get('window.height'),
    x: config.get('window.x'),
    y: config.get('window.y')
  });

  win.loadURL(`file://${__dirname}/index.html`);

  win.webContents.openDevTools();

  win.on('close', () => {
    const window = win.getBounds();

    config.set('window.x', window.x);
    config.set('window.y', window.y);
    config.set('window.height', window.height);
    config.set('window.width', window.width);
  });

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
