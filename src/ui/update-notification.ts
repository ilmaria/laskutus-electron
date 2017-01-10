import { ipcRenderer } from 'electron'

export default {
  is: 'update-notification',

  closeWindow() {
    ipcRenderer.send('close-notification-window')
  },

  quitAndUpdate() {
    ipcRenderer.send('quit-and-update')
  }
} as polymer.Base
