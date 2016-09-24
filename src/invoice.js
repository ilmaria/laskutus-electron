const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const accounting = require('accounting');

const fieldNames = [
  'nimi',
  'lähiosoite',
  'postitoimipaikka',
  'päiväys',
  'laskunumero',
  'eräpäivä',
  'puhelin',
  'maksuehto',
  'viivästyskorko',
  'numero'
];

module.exports = {
  createPdf,
  savePdf,
  fieldNames
};

function createPdf(clientInfo, productList = [{
  name: 'Käyttövastike',
  id: 'P 848',
  price: 210,
  count: 1,
  tax: 0.10
}, {
  name: 'Perusvastike',
  id: 'P 548',
  price: 110,
  count: 1,
  tax: 0.12
}]) {
  const doc = new PDFDocument();
  const MARGIN_TOP = 40;
  const MARGIN_LEFT = 40;
  const MARGIN_RIGHT = 612 - 72;
  
  const {
    nimi, lähiosoite, postitoimipaikka,
    päiväys, laskunumero, eräpäivä,
    puhelin, maksuehto, viivästyskorko,
    numero
  } = clientInfo;

  // Company title
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
    puhelin,
    maksuehto,
    viivästyskorko
  ].join('\n'), 315, MARGIN_TOP, {
    align: 'right'
  });

  // Product list
  const PRODUCT_LIST_HEADER = 250;
  const PRICE = 250;
  const COUNT = 300;
  const TAXLESS = 370;
  const TAX = 430;
  const TOTAL = 480; 
  doc.text('Tuote', MARGIN_LEFT, PRODUCT_LIST_HEADER);
  doc.text('à-hinta', PRICE, PRODUCT_LIST_HEADER);
  doc.text('Määrä', COUNT, PRODUCT_LIST_HEADER);
  doc.text('Veroton', TAXLESS, PRODUCT_LIST_HEADER);
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
    
  // Products
  const START_Y_COORD = HEADER_DASH + 7;
  let i = 0;
  for (product of productList) {
    const yCoord = START_Y_COORD + i*25;
    doc.text(`${product.name}, ${product.id}`, MARGIN_LEFT, yCoord);
    doc.text(formatMoney(product.price), PRICE - 10, yCoord);
    doc.text(product.count, COUNT + 10, yCoord);
    doc.text(formatMoney(product.price), TAXLESS - 5, yCoord);
    doc.text(`${product.tax * 100}%`, TAX, yCoord);
    doc.text(formatMoney(product.price * (1 + product.tax)), TOTAL, yCoord, {
      align: 'right'
    });
    
    i++;
  }
  
  
  doc.end();

  return doc;
}

function formatMoney(number) {
  return accounting.formatMoney(number, {
    symbol: '€',
    format: '%v %s',
    decimal: ',',
    thousand: '.',
    precision: 2
  })
}

function savePdf(invoiceData, dir) {
  try {
    fs.accessSync(dir, fs.F_OK);
  } catch (e) {
    fs.mkdir(dir);
  }
  
  const name = invoiceData.nimi.replace(/ /g, '_') || 'nimetön';
  const number = invoiceData.numero;
  const file = path.join(dir, `${name}_${number}.pdf`);

  createPdf(invoiceData)
    .pipe(fs.createWriteStream(file));
}
