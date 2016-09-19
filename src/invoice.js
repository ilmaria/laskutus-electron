const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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

function createPdf(fields) {
  const doc = new PDFDocument();
  
  const {
    nimi, lähiosoite, postitoimipaikka,
    päiväys, laskunumero, eräpäivä,
    puhelin, maksuehto, viivästyskorko,
    numero
  } = fields;

  doc.text('LAPPAJÄRVEN LOMA-GOLF OY');

  doc.text([
    nimi,
    lähiosoite,
    postitoimipaikka
  ].join('\n'));

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
  ].join('\n'));
  
  doc.text([
    päiväys,
    laskunumero,
    eräpäivä,
    puhelin,
    maksuehto,
    viivästyskorko
  ].join('\n'),
  { align: 'right' });

  doc.text('Tuote');
  doc.text('a-hinta');
  doc.text('Määrä');
  doc.text('Veroton');
  doc.text('Alv %');
  doc.text('Yhteensä');

  doc.lineWidth(1);
  doc.lineCap('butt')
    .moveTo(0, 40)
    .lineTo(10, 40)
    .stroke();

  doc.end();

  return doc;
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
