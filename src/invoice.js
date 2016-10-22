const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')
const accounting = require('accounting')
const config = require('./config')

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
  'numero',
  'viesti'
]

module.exports = {
  createPdf,
  savePdf,
  fieldNames
}

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
  const doc = new PDFDocument({autoFirstPage: false})
  doc.addPage({margin: 40})
  const MARGIN_TOP = 40
  const MARGIN_LEFT = 40
  const MARGIN_RIGHT = 612 - 40
  const DEFAULT_FONT = 12
  const BIG_FONT = 16
  
  const {
    nimi, lähiosoite, postitoimipaikka,
    päiväys, laskunumero, eräpäivä,
    puhelin, maksuehto, viivästyskorko,
    numero, viesti
  } = clientInfo

  // Company title
  doc.text('LAPPAJÄRVEN LOMA-GOLF OY', MARGIN_LEFT, MARGIN_TOP)
  doc.moveDown(3)
  
  // Recipient name and address
  doc.text([
    nimi,
    lähiosoite,
    postitoimipaikka
  ].join('\n'))

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
  ].join('\n'), 315, MARGIN_TOP)
  
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
  })

  // Product list
  const PRODUCT_LIST_HEADER = 250
  const PRICE_H = 250
  const PRICE = PRICE_H - 10
  const COUNT_H = 300
  const COUNT = COUNT_H + 10
  const TAXLESS_H = 370
  const TAXLESS = TAXLESS_H - 5
  const TAX = 430
  const TOTAL = 480 
  doc.text('Tuote', MARGIN_LEFT, PRODUCT_LIST_HEADER)
  doc.text('à-hinta', PRICE_H, PRODUCT_LIST_HEADER)
  doc.text('Määrä', COUNT_H, PRODUCT_LIST_HEADER)
  doc.text('Veroton', TAXLESS_H, PRODUCT_LIST_HEADER)
  doc.text('Alv %', TAX, PRODUCT_LIST_HEADER)
  doc.text('Yhteensä', TOTAL, PRODUCT_LIST_HEADER, {
    align: 'right'
  })

  const HEADER_DASH = PRODUCT_LIST_HEADER + 15
  doc.lineWidth(1)
  doc.lineCap('butt')
    .moveTo(MARGIN_LEFT - 10, HEADER_DASH)
    .lineTo(MARGIN_RIGHT + 10, HEADER_DASH)
    .stroke()
    
  // Products
  const START_Y_COORD = HEADER_DASH + 7
  let productYCoord
  for (let i = 0; i < productList.length; i++) {
    const product = productList[i]
    const totalPrice = product.price * product.count
    productYCoord = START_Y_COORD + i*25
    
    //name
    doc.text(`${product.name}, ${product.id}`, MARGIN_LEFT, productYCoord)
    //à-price
    doc.text(formatMoney(product.price), PRICE, productYCoord)
    //count
    doc.text(product.count, COUNT_H, productYCoord)
    //total price without tax
    doc.text(formatMoney(totalPrice), TAXLESS, productYCoord)
    //tax
    doc.text(`${product.tax * 100}%`, TAX, productYCoord)
    //total price
    doc.text(formatMoney(totalPrice * (1 + product.tax)), TOTAL,
      productYCoord, {align: 'right'})
  }
  
  const [totalPrice, totalTax] = productList.reduce((total, product) => {
    const price = product.price * product.count
    const tax = price * product.tax
    return [total[0] + price, total[1] + tax]
  }, [0, 0])
  
  const TOTAL_Y = productYCoord + 50
  doc.text('Yhteensä:', PRICE, TOTAL_Y)
  doc.text(formatMoney(totalPrice), TAXLESS, TOTAL_Y)
  const finalPrice = formatMoney(totalPrice + totalTax)
  doc.text(finalPrice,
    TOTAL, TOTAL_Y, {align: 'right'})
  
  const MESSAGE = TOTAL_Y + 70
  doc.text(viesti, MARGIN_LEFT, MESSAGE)
  
  const JSG = config.get('JSG')
  
  const RECEIVER_INFO = 550
  const viitenumero = '002' + numero
  
  doc.text([
    'Saaja / Mottagare:',
    'Tilinumero / Kontonummer:',
    '(IBAN)',
    'Viitenumero / Ref. nr:',
    'Eräpäivä / Förfallodag:',
    'Maksu / Betalningen:'
  ].join('\n'), MARGIN_LEFT, RECEIVER_INFO,
    {paragraphGap: 6})
  
  
  doc.font('Helvetica-Bold')
    .fontSize(BIG_FONT)
    
  doc.text([
    JSG.name,
    JSG.IBAN,
    '',
    viitenumero,
    eräpäivä,
    finalPrice
  ].join('\n'), MARGIN_LEFT + 160, RECEIVER_INFO - 2,
    {paragraphGap: 1})
  
  doc.font('Helvetica')
    .fontSize(DEFAULT_FONT)
  
  const FOOTER = 700
  doc.lineWidth(1)
  doc.lineCap('butt')
    .moveTo(MARGIN_LEFT - 10, FOOTER)
    .lineTo(MARGIN_RIGHT + 10, FOOTER)
    .stroke()
  
  doc
    .text(JSG.name, MARGIN_LEFT, FOOTER + 5,
      {continued: true})
    .text(`Puh. ${JSG.tel}`,
      {continued: true, align: 'center'})
    .text(`Y-tunnus: ${JSG.yTunnus}`,
      {align: 'right'})
    
  doc.end()

  return doc
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
    fs.accessSync(dir, fs.F_OK)
  } catch (e) {
    fs.mkdir(dir)
  }
  
  const name = invoiceData.nimi.replace(/ /g, '_') || 'nimetön'
  const number = invoiceData.numero
  const file = path.join(dir, `${name}_${number}.pdf`)

  createPdf(invoiceData)
    .pipe(fs.createWriteStream(file))
}
