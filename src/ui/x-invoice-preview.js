(function () {
  const fs = require('fs');
  const { ipcRenderer } = require('electron');
  const invoice = require('../invoice');
  const BlobStream = require('blob-stream');

  try {
    fs.accessSync(`${__dirname}/../laskut`, fs.F_OK);
  } catch (e) {
    fs.mkdir(`${__dirname}/../laskut`);
  }

  ipcRenderer.send('invoice-preview-ready');

  ipcRenderer.on('invoice-data', (event, invoiceFields) => {
    invoice.createPdf(invoiceFields)
      .pipe(new BlobStream)
      .on('finish', function () {
        previewFrame = document.body.querySelector('#preview-frame');
        previewFrame.src = `../../pdfjs/web/viewer.html?file=${this.toBlobURL()}`;
      })
  });
})();
