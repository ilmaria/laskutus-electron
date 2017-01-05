"use strict";
const electron_1 = require("electron");
const invoice = require("../invoice");
const BlobStream = require("blob-stream");
electron_1.ipcRenderer.send('invoice-preview-ready');
electron_1.ipcRenderer.on('invoice-data', (event, client, invoiceData) => {
    invoice.createPdf(client, invoiceData)
        .pipe(BlobStream())
        .on('finish', function () {
        const previewFrame = document.body.querySelector('#preview-frame');
        previewFrame.src = `../../pdfjs/web/viewer.html?file=${this.toBlobURL()}`;
    });
});
