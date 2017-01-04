"use strict";
const electron_1 = require("electron");
const config_1 = require("./config");
const invoice = require("./invoice");
const path = require("path");
const os = require("os");
const electron_auto_updater_1 = require("electron-auto-updater");
const DEV_ENV = process.env.NODE_ENV === 'development';
if (DEV_ENV) {
    var chokidar = require('chokidar');
}
let mainWindow;
//-----------------------------------------------
// Main function
//-----------------------------------------------
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
electron_1.ipcMain.on('invoice-preview', (event, client, invoiceData) => {
    const previewWindow = new electron_1.BrowserWindow({ parent: mainWindow, width: 800, height: 1000 });
    previewWindow.loadURL(`file://${__dirname}/ui/x-invoice-preview.html`);
    //previewWindow.webContents.openDevTools()
    electron_1.ipcMain.once('invoice-preview-ready', (event) => {
        event.sender.send('invoice-data', client, invoiceData);
    });
});
electron_1.ipcMain.on('invoice-save', (event, clients, invoiceData, opts) => {
    invoice.saveInvoicePdf(clients, invoiceData, opts, path.join(__dirname, config_1.default.get('invoiceSavePath')));
});
//-----------------------------------------------
// Watch file changes
//-----------------------------------------------
if (DEV_ENV) {
    chokidar.watch([`${__dirname}/ui/**/*`])
        .on('change', () => {
        if (mainWindow) {
            mainWindow.reload();
        }
    });
}
//-----------------------------------------------
// App events
//-----------------------------------------------
electron_1.app.on('ready', () => {
    createMainWindow();
    if (!DEV_ENV) {
        initAutoUpdates();
    }
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});
electron_1.app.setAppUserModelId('com.squirrel.laskutus-electron.laskutus-electron');
function initAutoUpdates() {
    if (os.platform() === 'linux') {
        return;
    }
    electron_auto_updater_1.autoUpdater.addListener('update-downloaded', () => {
        log('update downloaded');
        const notificationWindow = new electron_1.BrowserWindow({ parent: mainWindow, width: 400, height: 600, modal: true });
        notificationWindow.loadURL(`file://${__dirname}/ui/x-update-notification.html`);
        electron_1.ipcMain.once('close-notification-window', () => {
            notificationWindow.close();
        });
        electron_1.ipcMain.once('quit-and-update', () => {
            electron_auto_updater_1.autoUpdater.quitAndInstall();
        });
    });
    electron_auto_updater_1.autoUpdater.addListener('checking-for-update', () => {
        log('checking-for-update');
    });
    electron_auto_updater_1.autoUpdater.addListener('update-available', () => {
        log('update-available');
    });
    electron_auto_updater_1.autoUpdater.addListener('update-not-available', () => {
        log('update-not-available');
    });
    electron_auto_updater_1.autoUpdater.addListener('error', (err) => {
        log(err);
    });
    mainWindow.webContents.once("did-frame-finish-load", () => {
        log('start checking updates');
        electron_auto_updater_1.autoUpdater.checkForUpdates();
    });
}
function log(msg) {
    mainWindow.webContents.executeJavaScript(`console.log(\`${msg}\`)`);
}
