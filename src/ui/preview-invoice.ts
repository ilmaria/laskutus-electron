import { ipcRenderer } from 'electron'
import * as invoice from '../invoice'
import * as BlobStream from 'blob-stream'

ipcRenderer.send('preview-invoice-ready')

ipcRenderer.on('invoice-data', (event, client, invoiceData) => {
  invoice.createPdf(client, invoiceData)
    .pipe(BlobStream())
    .on('finish', function () {
      const previewFrame = document.body.querySelector('#preview-frame') as HTMLIFrameElement
      previewFrame.src = `../../pdfjs/web/viewer.html?file=${this.toBlobURL()}`
    })
})
