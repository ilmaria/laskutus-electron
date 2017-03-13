import * as PDFDocument from 'pdfkit'
import * as fs from 'fs'
import * as path from 'path'
import * as accounting from 'accounting'
import config from './config'
import * as db from './database'
import { Client, Product } from './database'

/*
export const fieldNames = [
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
]*/

export interface Data {
  date: string
  dueDate: string
  paymentTerms: string
  penaltyInterest: string
  notes: string
  products: {
    product: Product
    count: number
    perShare: boolean
  }[]
}


/**
 * Create an invoice PDF in memory. Pipe it to a file stream to save it.
 * @param {Client} client - Client info that differs between clients.
 * @param {Data} invoiceData - Data that is shared between multiple clients.
 */
export function createPdf(client: Client, invoiceData: Data) {
  const doc = new PDFDocument({autoFirstPage: false})
  doc.addPage({margin: 40})

  const JSG = config.get('JSG')

  const MARGIN_TOP = 40
  const MARGIN_LEFT = 40
  const MARGIN_RIGHT = 612 - 40
  const DEFAULT_FONT_SIZE = 12
  const BIG_FONT_SIZE = 16
  const DEFAULT_FONT = 'Helvetica'
  const BOLD_FONT = 'Helvetica-Bold'

  const {
    name, address, postOffice, shares
  } = client

  const {
    date, dueDate, paymentTerms,
    penaltyInterest, notes, products
  } = invoiceData

  const invoiceNumber = '123644'

  //-----------------------------------------------
  //TOP INFO
  //-----------------------------------------------
  doc.font(BOLD_FONT)
  doc.text('LAPPAJÄRVEN LOMA-GOLF OY', MARGIN_LEFT, MARGIN_TOP)
  doc.moveDown(3)
  doc.font(DEFAULT_FONT)

  // Recipient name and address
  doc.text([
    name,
    address,
    postOffice
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
    date,
    '',
    invoiceNumber,
    dueDate,
    JSG.tel,
    paymentTerms,
    penaltyInterest
  ].join('\n'), 315, MARGIN_TOP, {
    align: 'right'
  })


  //-----------------------------------------------
  //PRODUCT HEADERS
  //-----------------------------------------------
  const PRODUCT_LIST_HEADER = 250
  const PRICE_H = 250
  const PRICE = PRICE_H - 10
  const COUNT_H = 310
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


  //-----------------------------------------------
  //PRODUCT LIST
  //-----------------------------------------------
  const START_Y_COORD = HEADER_DASH + 7
  let productYCoord
  let i = 0
  for (const productItem of products) {
    const product = productItem.product
    const totalPrice = product.price * productItem.count

    for (const share of client.shares) {
      productYCoord = START_Y_COORD + i*25
      i++

      //name
      doc.text(`${product.name}, ${share}`, MARGIN_LEFT, productYCoord)
      //à-price
      doc.text(formatMoney(product.price), PRICE, productYCoord)
      //count
      doc.text(productItem.count as any, COUNT_H, productYCoord)
      //total price without tax
      doc.text(formatMoney(totalPrice), TAXLESS, productYCoord)
      //tax
      doc.text(`${product.tax * 100}%`, TAX, productYCoord)
      //total price
      doc.text(formatMoney(totalPrice * (1 + product.tax)), TOTAL,
        productYCoord, {align: 'right'})
    }
  }

  const [totalPrice, totalTax] = products.reduce((total, {product, count}) => {
    const price = product.price * count
    const tax = price * product.tax
    return [total[0] + price, total[1] + tax]
  }, [0, 0])


  doc.font(BOLD_FONT)

  const TOTAL_Y = productYCoord + 50
  doc.text('Yhteensä:', PRICE, TOTAL_Y)
  doc.text(formatMoney(totalPrice), TAXLESS, TOTAL_Y)
  const finalPrice = formatMoney(totalPrice + totalTax)
  doc.text(finalPrice,
    TOTAL, TOTAL_Y, {align: 'right'})

  doc.font(DEFAULT_FONT)

  const MESSAGE = TOTAL_Y + 70
  doc.text(notes, MARGIN_LEFT, MESSAGE)


  //-----------------------------------------------
  //PAYMENT INFO
  //-----------------------------------------------
  const RECEIVER_INFO = 550
  const viitenumero = '0020998'

  doc.text([
    'Saaja / Mottagare:',
    'Tilinumero / Kontonummer (IBAN):',
    'Viitenumero / Ref. nr:',
    'Eräpäivä / Förfallodag:',
    'Maksu / Betalningen:'
  ].join('\n'), MARGIN_LEFT, RECEIVER_INFO,
    {paragraphGap: 6})

  const RECEIVER_INFO_LEFT = MARGIN_LEFT + 200

  doc.font(BOLD_FONT)
    .fontSize(BIG_FONT_SIZE)

  doc.text([
    JSG.name,
    JSG.IBAN,
    viitenumero,
    dueDate,
    finalPrice
  ].join('\n'), RECEIVER_INFO_LEFT, RECEIVER_INFO - 2,
    {paragraphGap: 1})

  doc.font(DEFAULT_FONT)
    .fontSize(DEFAULT_FONT_SIZE)


  //-----------------------------------------------
  //FOOTER
  //-----------------------------------------------
  const FOOTER = 700
  doc.lineWidth(1)
  doc.lineCap('butt')
    .moveTo(MARGIN_LEFT - 10, FOOTER)
    .lineTo(MARGIN_RIGHT + 10, FOOTER)
    .stroke()

  doc.text(JSG.name, MARGIN_LEFT, FOOTER + 5,
      {continued: true})
    .text(`Y-tunnus: ${JSG.yTunnus}`,
      {align: 'right'})

  doc.text(`Puh. ${JSG.tel}`, MARGIN_LEFT, FOOTER + 5,
      {align: 'center'})
    .text(JSG.email, {align: 'center'})
    .moveUp()
    .text(JSG.address)
    .text(JSG.postalAddress)

  doc.end()

  return doc
}

/**
 * Save invoices in PDF format.
 * @param {Object[]} clients - List of clients. This is the only data
 * that will vary between invoices.
 * @param {Object} invoiceData - Invoice fields that will be same for all invoices.
 * @param {string} dir - Directory to save invoice files.
 */
export function savePdf(clients: Client[],
                        invoiceData: Data,
                        dir: string) {
  try {
    fs.accessSync(dir, fs.constants.F_OK)
  } catch (e) {
    fs.mkdir(dir)
  }

  for (const client of clients) {
    const name = client.name.replace(/[ _\\\/]/g, '_') || 'nimetön'
    const number = '123'
    const file = path.join(dir, `${name}_${number}.pdf`)

    createPdf(client, invoiceData)
      .pipe(fs.createWriteStream(file))
  }
}

/**
 * Format number into euros.
 */
function formatMoney(amount: number) {
  return accounting.formatMoney(amount, {
    symbol: '€',
    format: '%v %s',
    decimal: ',',
    thousand: '.',
    precision: 2
  })
}
