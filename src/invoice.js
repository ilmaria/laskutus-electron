"use strict";
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const accounting = require("accounting");
const config_1 = require("./config");
exports.fieldNames = [
    'nimi',
    'lähiosoite',
    'postitoimipaikka',
    'päiväys',
    'laskunumero',
    'eräpäivä',
    'maksuehto',
    'viivästyskorko',
    'numero',
    'viesti'
];
/**
 * Create an invoice PDF in memory. Pipe it to a file stream to save it.
 * @param {Client} client - Client info that differs between clients.
 * @param {Data} invoiceData - Data that is shared between multiple clients.
 */
function createPdf(client, invoiceData) {
    const doc = new PDFDocument({ autoFirstPage: false });
    doc.addPage({ margin: 40 });
    const JSG = config_1.default.get('JSG');
    const MARGIN_TOP = 40;
    const MARGIN_LEFT = 40;
    const MARGIN_RIGHT = 612 - 40;
    const DEFAULT_FONT = 12;
    const BIG_FONT = 16;
    const { nimi, lähiosoite, postitoimipaikka, numero } = client;
    const { päiväys, laskunumero, eräpäivä, maksuehto, viivästyskorko, viesti, products } = invoiceData;
    //-----------------------------------------------
    //TOP INFO
    //-----------------------------------------------
    doc.text('LAPPAJÄRVEN LOMA-GOLF OY', MARGIN_LEFT, MARGIN_TOP);
    doc.moveDown(3);
    // Recipient name and address
    doc.text([
        nimi,
        lähiosoite,
        postitoimipaikka
    ].join('\n'));
    // Invoice small details
    doc.text([
        'LASKU',
        '',
        'Laskunumero:',
        'Eräpäivä:',
        'Puhelin:',
        'Maksuehto:',
        'Viivästyskorko:',
        '',
        'HUOM! Uusi tilinumero.'
    ].join('\n'), 315, MARGIN_TOP);
    doc.text([
        päiväys,
        '',
        laskunumero,
        eräpäivä,
        JSG.tel,
        maksuehto,
        viivästyskorko
    ].join('\n'), 315, MARGIN_TOP, {
        align: 'right'
    });
    //-----------------------------------------------
    //PRODUCT HEADERS
    //-----------------------------------------------
    const PRODUCT_LIST_HEADER = 250;
    const PRICE_H = 250;
    const PRICE = PRICE_H - 10;
    const COUNT_H = 310;
    const COUNT = COUNT_H + 10;
    const TAXLESS_H = 370;
    const TAXLESS = TAXLESS_H - 5;
    const TAX = 430;
    const TOTAL = 480;
    doc.text('Tuote', MARGIN_LEFT, PRODUCT_LIST_HEADER);
    doc.text('à-hinta', PRICE_H, PRODUCT_LIST_HEADER);
    doc.text('Määrä', COUNT_H, PRODUCT_LIST_HEADER);
    doc.text('Veroton', TAXLESS_H, PRODUCT_LIST_HEADER);
    doc.text('Alv %', TAX, PRODUCT_LIST_HEADER);
    doc.text('Yhteensä', TOTAL, PRODUCT_LIST_HEADER, {
        align: 'right'
    });
    const HEADER_DASH = PRODUCT_LIST_HEADER + 15;
    doc.lineWidth(1);
    doc.lineCap('butt')
        .moveTo(MARGIN_LEFT - 10, HEADER_DASH)
        .lineTo(MARGIN_RIGHT + 10, HEADER_DASH)
        .stroke();
    //-----------------------------------------------
    //PRODUCT LIST
    //-----------------------------------------------
    const START_Y_COORD = HEADER_DASH + 7;
    let productYCoord;
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const totalPrice = product.price * product.count;
        productYCoord = START_Y_COORD + i * 25;
        //name
        doc.text(`${product.name}, ${product.id}`, MARGIN_LEFT, productYCoord);
        //à-price
        doc.text(formatMoney(product.price), PRICE, productYCoord);
        //count
        doc.text(product.count, COUNT_H, productYCoord);
        //total price without tax
        doc.text(formatMoney(totalPrice), TAXLESS, productYCoord);
        //tax
        doc.text(`${product.tax * 100}%`, TAX, productYCoord);
        //total price
        doc.text(formatMoney(totalPrice * (1 + product.tax)), TOTAL, productYCoord, { align: 'right' });
    }
    const [totalPrice, totalTax] = products.reduce((total, product) => {
        const price = product.price * product.count;
        const tax = price * product.tax;
        return [total[0] + price, total[1] + tax];
    }, [0, 0]);
    const TOTAL_Y = productYCoord + 50;
    doc.text('Yhteensä:', PRICE, TOTAL_Y);
    doc.text(formatMoney(totalPrice), TAXLESS, TOTAL_Y);
    const finalPrice = formatMoney(totalPrice + totalTax);
    doc.text(finalPrice, TOTAL, TOTAL_Y, { align: 'right' });
    const MESSAGE = TOTAL_Y + 70;
    doc.text(viesti, MARGIN_LEFT, MESSAGE);
    //-----------------------------------------------
    //PAYMENT INFO
    //-----------------------------------------------
    const RECEIVER_INFO = 550;
    const viitenumero = '002' + numero;
    doc.text([
        'Saaja / Mottagare:',
        'Tilinumero / Kontonummer (IBAN):',
        'Viitenumero / Ref. nr:',
        'Eräpäivä / Förfallodag:',
        'Maksu / Betalningen:'
    ].join('\n'), MARGIN_LEFT, RECEIVER_INFO, { paragraphGap: 6 });
    const RECEIVER_INFO_LEFT = MARGIN_LEFT + 200;
    doc.font('Helvetica-Bold')
        .fontSize(BIG_FONT);
    doc.text([
        JSG.name,
        JSG.IBAN,
        viitenumero,
        eräpäivä,
        finalPrice
    ].join('\n'), RECEIVER_INFO_LEFT, RECEIVER_INFO - 2, { paragraphGap: 1 });
    doc.font('Helvetica')
        .fontSize(DEFAULT_FONT);
    //-----------------------------------------------
    //FOOTER
    //-----------------------------------------------
    const FOOTER = 700;
    doc.lineWidth(1);
    doc.lineCap('butt')
        .moveTo(MARGIN_LEFT - 10, FOOTER)
        .lineTo(MARGIN_RIGHT + 10, FOOTER)
        .stroke();
    doc.text(JSG.name, MARGIN_LEFT, FOOTER + 5, { continued: true })
        .text(`Y-tunnus: ${JSG.yTunnus}`, { align: 'right' });
    doc.text(`Puh. ${JSG.tel}`, MARGIN_LEFT, FOOTER + 5, { align: 'center' })
        .text(JSG.email, { align: 'center' })
        .moveUp()
        .text(JSG.address)
        .text(JSG.postalAddress);
    doc.end();
    return doc;
}
exports.createPdf = createPdf;
/**
 * Save invoices in PDF format.
 * @param {Object[]} clients - List of client infos. This is the only data
 * that will vary between invoices.
 * @param {Object} invoiceData - Invoice fields that will be same for all invoices.
 * @param {Object} opts - Other options for invoices. Same options will be
 * used for all saved invoices.
 * @param {string} dir - Directory to save invoice files.
 */
function savePdf(clients, invoiceData, opts, dir) {
    try {
        fs.accessSync(dir, fs.constants.F_OK);
    }
    catch (e) {
        fs.mkdir(dir);
    }
    for (const client of clients) {
        let skip = false;
        // if column is excluded then skip client
        if (opts.excludeCol) {
            skip = !!Object.keys(opts.excludeCol).find(col => {
                return client[col] === opts.excludeCol[col];
            });
        }
        if (!skip && client.nimi) {
            const name = client.nimi.replace(/[ _\\\/]/g, '_') || 'nimetön';
            const number = client.numero;
            const file = path.join(dir, `${name}_${number}.pdf`);
            createPdf(client, invoiceData)
                .pipe(fs.createWriteStream(file));
        }
    }
}
exports.savePdf = savePdf;
/**
 * Format number into euros.
 */
function formatMoney(amount) {
    return accounting.formatMoney(amount, {
        symbol: '€',
        format: '%v %s',
        decimal: ',',
        thousand: '.',
        precision: 2
    });
}
