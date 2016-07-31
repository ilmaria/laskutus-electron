const PDFDocument = require('pdfkit')
const fs = require('fs')
const BlobStream = require('blob-stream')

try {
  fs.accessSync('./laskut', fs.F_OK)
} catch (e) {
  fs.mkdir('laskut')
}

module.exports = createPdf
  
function createPdf(fields, idx) {
  let doc = new PDFDocument()
  
  const stream = doc.pipe(new BlobStream())
  const {
    nimi, osoite, postitoimipaikka,
    päiväys, laskunumero, eräpäivä,
    puhelin, maksuehto, viivästyskorko
  } = fields

  //Logo
  doc.text('LAPPAJÄRVEN LOMA-GOLF OY')

  //Nimi ja osoite
  doc.text([
    nimi,
    osoite,
    postitoimipaikka
  ].join('\n'))

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
  ].join('\n'))
  
  doc.text([
    päiväys,
    laskunumero,
    eräpäivä,
    puhelin,
    maksuehto,
    viivästyskorko
  ].join('\n'),
  { align: 'right' })

  //Tuotteet ja hinnat
  doc.text('Tuote')
  doc.text('a-hinta')
  doc.text('Määrä')
  doc.text('Veroton')
  doc.text('Alv %')
  doc.text('Yhteensä')

  //Erotinviiva
  doc.lineWidth(1)
  doc.lineCap('butt')
    .moveTo(0, 40)
    .lineTo(10, 40)
    .stroke()



  doc.end()

  stream.on('finish', () => {
    let url = stream.toBlobURL()
    let iframe = document.createElement('webview')
    iframe.src = `../pdfjs/web/viewer.html?file=${url}`
    iframe.style = 'display:inline-flex; width:640px; height:480px'
    document.body.appendChild(iframe)
  })
}
