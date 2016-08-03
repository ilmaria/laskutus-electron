(function () {
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
    return xlxs.utils.sheet_to_json(worksheet);
  }

  function renderRegister(register) {
    
  }
})();
