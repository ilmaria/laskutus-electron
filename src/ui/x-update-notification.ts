import { ipcRenderer } from 'electron'

Polymer({
  is: 'x-update-notification',

  closeWindow() {
    ipcRenderer.send('close-notification-window')
  },

  quitAndUpdate() {
    ipcRenderer.send('quit-and-update')
  }
})
