const Config = require('electron-config');
const { ipcMain } = require('electron');

const config = new Config({ defaults: {
  window: {
    width: 1600,
    height: 1200
  },
  registerFile: ''
}});

module.exports = config;
