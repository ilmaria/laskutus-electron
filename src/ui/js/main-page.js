const createPdf = require('./pdf-writer.js');
const fields = {
    nimi: 'ilmari autio',
    osoite: 'joku osoite 12',
    postitoimipaikka: '01230',
    päiväys: '21.07.2016',
    laskunumero: '21302497',
    eräpäivä: '30.07.2016',
    puhelin: '040-2820397',
    maksuehto: '21 päivää',
    viivästyskorko: '7.5%'
};
for (let i = 0; i < 5; i++) {
    createPdf(fields, i);
}
