const fs = require('fs');
const { webContents } = require('electron');

try {
  fs.accessSync(`${__dirname}/../laskut`, fs.F_OK);
} catch (e) {
  fs.mkdir(`${__dirname}/../laskut`);
}

module.exports = createPdf;

function createPdf(previewWindow, field) {
  console.log('createPdf')
  return new Promise((resolve, reject) => {
    previewWindow.loadURL(`file://${__dirname}/../renderer-process/invoice-preview/invoice-preview.html`);
    previewWindow.show = true;
    previewWindow.webContents.openDevTools();
    webContents.excuteJavacript(`(${_createPdf.toString()})()`, false, (res)=> {
      console.log('results')
      console.log(res);
      resolve(res);
    });
    
  });
}

function _createPdf(fields) {
  const PDFDocument = require('pdfkit');
  const BlobStream = require('blob-stream');

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

    console.log('end')

  doc.end();
  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      const url = blobUtil.createObjectURL(stream.toBlob());
      resolve(`../pdfjs/web/viewer.html?file=${url}`);
    });

    stream.on('error', (err) => {
      reject(err);
    })
  });
}
