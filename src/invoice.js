const PDFDocument = require('pdfkit');

const fieldNames = [
  'nimi',
  'lähiosoite',
  'postitoimipaikka',
  'päiväys',
  'laskunumero',
  'eräpäivä',
  'puhelin',
  'maksuehto',
  'viivästyskorko'
];

module.exports = {
  createPdf,
  fieldNames
};

function createPdf(fields) {
  const doc = new PDFDocument();
  
  const {
    nimi, lähiosoite, postitoimipaikka,
    päiväys, laskunumero, eräpäivä,
    puhelin, maksuehto, viivästyskorko
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
