"use strict";
const electron_1 = require("electron");
Polymer({
    is: 'x-update-notification',
    closeWindow() {
        electron_1.ipcRenderer.send('close-notification-window');
    },
    quitAndUpdate() {
        electron_1.ipcRenderer.send('quit-and-update');
    }
});
