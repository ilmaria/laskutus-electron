const electron = require('electron');
const {app, BrowserWindow} = electron;

let win;

function createWindow() {
  win = new BrowserWindow({width: 1600, height: 900});

  win.loadURL(`file://${__dirname}/index.html`);

  win.webContents.openDevTools();

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