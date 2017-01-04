(function () {
    const { ipcRenderer } = require('electron');
    const invoice = require('../invoice');
    const BlobStream = require('blob-stream');
    ipcRenderer.send('invoice-preview-ready');
    ipcRenderer.on('invoice-data', (event, client, invoiceData) => {
        invoice.createInvoicePdf(client, invoiceData)
            .pipe(new BlobStream)
            .on('finish', function () {
            const previewFrame = document.body.querySelector('#preview-frame');
            previewFrame.src = `../../pdfjs/web/viewer.html?file=${this.toBlobURL()}`;
        });
    });
})();
