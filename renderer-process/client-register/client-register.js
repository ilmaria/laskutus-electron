(function () {
  Polymer({
    is: 'x-client-register'
  });
  
  const { remote } = require('electron');
  const fs = require('fs');
  const config = remote.require('./config');
  const xlxs = require('xlsx');

  const registerFile = config.get('registerFile');

  fs.access(registerFile, fs.F_OK, (err) => {
    if (!err) {
      const register = importRegister(registerFile);
      renderRegister(register);
    }
  });

  document.querySelector('#select-register-btn')
    .addEventListener('change', (event) => {
      const file = event.target.files[0];
      
      if (file) {
        const register = importRegister(file.path);
        renderRegister(register);
      }
    });
    
  function importRegister(register) {
    const workbook = xlxs.readFile(register);
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    return worksheet;
  }

  function renderRegister(worksheet) {
    const range = xlxs.utils.decode_range(worksheet['!ref']);
    const register = xlxs.utils.sheet_to_json(worksheet);
    let headers = [];
    
    const startIdx = range.s.c;
    const endIdx = range.e.c;
    const headerRow = range.s.r;
    //Loop first row and add cell values as table headers
    for (let i = startIdx; i < endIdx; i++) {
      const cell = worksheet[{c: i, r: headerRow}];
      headers.push(cell.v);
    }

    const frag = document.createDocumentFragment();
  }
})();