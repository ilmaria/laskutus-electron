const fs = require('fs');
const PDFDocument = require('pdfkit');
const BlobStream = require('blob-stream');
const { ipcRenderer } = require('electron');

try {
  fs.accessSync(`${__dirname}/../laskut`, fs.F_OK);
} catch (e) {
  fs.mkdir(`${__dirname}/../laskut`);
}

module.exports = previewInvoice;

function previewInvoice(fields, idx) {
  const doc = new PDFDocument();
  
  const stream = doc.pipe(new BlobStream());
  const {
    nimi, lähiosoite, postitoimipaikka,
    päiväys, laskunumero, eräpäivä,
    puhelin, maksuehto, viivästyskorko
  } = fields;

  /*
  
              lähiosoite = '',
              postitoimipaikka = '',
              päiväys = '',
              laskunumero = '',
              eräpäivä = '',
              puhelin = '',
              maksuehto = '',
              viivästyskorko = ''
            }, idx) {*/

  //Logo
  doc.text('LAPPAJÄRVEN LOMA-GOLF OY');

  //Nimi ja osoite
  doc.text([
    nimi,
    lähiosoite,
    postitoimipaikka
  ].join('\n'));

  //Oikeassa yläkulmassa olevat tiedot:
  //laskunumero, päiväys, viivästyskorko, yms.
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

  //Tuotteet ja hinnat
  doc.text('Tuote');
  doc.text('a-hinta');
  doc.text('Määrä');
  doc.text('Veroton');
  doc.text('Alv %');
  doc.text('Yhteensä');

  //Erotinviiva
  doc.lineWidth(1);
  doc.lineCap('butt')
    .moveTo(0, 40)
    .lineTo(10, 40)
    .stroke();



  doc.end();

  stream.on('finish', () => {
    ipcRenderer.send('invoice-preview', stream.toBlobURL())
  })
}
