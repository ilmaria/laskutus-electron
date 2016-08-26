(function () {
  const fs = require('fs');
  const { ipcRenderer } = require('electron');
  const PDFDocument = require('pdfkit');
  const BlobStream = require('blob-stream');

  try {
    fs.accessSync(`${__dirname}/../../laskut`, fs.F_OK);
  } catch (e) {
    fs.mkdir(`${__dirname}/../../laskut`);
  }

  ipcRenderer.send('invoice-preview-ready');

  ipcRenderer.on('invoice-data', (event, invoiceFields) => {
    const pdfStream = createPdf(invoiceFields).on('finish', () => {
      previewFrame = document.body.querySelector('#preview-frame');
      previewFrame.src = `../../pdfjs/web/viewer.html?file=${pdfStream.toBlobURL()}`;
    })
  });

  function createPdf(fields) {
    const doc = new PDFDocument();
    
    const pdfStream = doc.pipe(new BlobStream());
    const {
      nimi, lähiosoite, postitoimipaikka,
      päiväys, laskunumero, eräpäivä,
      puhelin, maksuehto, viivästyskorko
    } = fields;

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

    return pdfStream;
    /*
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve(stream.toBlobURL());
      });

      stream.on('error', (err) => {
        reject(err);
      })
    });
    */
  }
})();
