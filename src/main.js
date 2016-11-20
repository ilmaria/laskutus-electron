"use strict";
const chokidar = require("chokidar");
const config_1 = require("./config");
const invoice_1 = require("./invoice");
const path = require("path");
const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
let mainWindow;
//-----------------------------------------------
// Main function
//-----------------------------------------------
function createWindow() {
    mainWindow = new BrowserWindow({
        width: config_1.default.get('window.width'),
        height: config_1.default.get('window.height'),
        x: config_1.default.get('window.x'),
        y: config_1.default.get('window.y')
    });
    mainWindow.loadURL(`file://${__dirname}/ui/index.html`);
    mainWindow.webContents.openDevTools();
    mainWindow.on('close', () => {
        const win = mainWindow.getBounds();
        config_1.default.set('window.x', win.x);
        config_1.default.set('window.y', win.y);
        config_1.default.set('window.height', win.height);
        config_1.default.set('window.width', win.width);
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
//-----------------------------------------------
// Event listeners
//-----------------------------------------------
ipcMain.on('invoice-preview', (event, client, invoiceData) => {
    let previewWindow = new BrowserWindow({ parent: mainWindow, width: 800, height: 1000 });
    previewWindow.loadURL(`file://${__dirname}/ui/x-invoice-preview.html`);
    //previewWindow.webContents.openDevTools()
    ipcMain.once('invoice-preview-ready', (event) => {
        event.sender.send('invoice-data', client, invoiceData);
    });
});
ipcMain.on('invoice-save', (event, clients, invoiceData, opts) => {
    invoice_1.default.saveInvoicePdf(clients, invoiceData, opts, path.join(__dirname, config_1.default.get('invoiceSavePath')));
});
//-----------------------------------------------
// Watch file changes
//-----------------------------------------------
chokidar.watch([`${__dirname}/ui/**/*`])
    .on('change', () => {
    if (mainWindow) {
        mainWindow.reload();
    }
});
//-----------------------------------------------
// App events
//-----------------------------------------------
app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
