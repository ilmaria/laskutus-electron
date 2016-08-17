(function () {
  const { remote, ipcRenderer } = require('electron');
  const fs = require('fs');
  const config = remote.require('./config');
  const xlxs = require('xlsx');

  Polymer({
    is: 'x-client-register',
    ready: addFileSelection
  });

  function addFileSelection() {
    const grid = this.$['register-table'];
    const registerFile = config.get('registerFile');

    this.$['select-register-btn'].addEventListener('change', (event) => {
      const file = event.target.files[0];
      
      if (file) {
        const register = importRegister(file.path);
        renderToGrid(grid, register);
        config.set('registerFile', file.path);
      }
    });

    grid.addEventListener('selected-items-changed', () => {
      const clientIndex = grid.selection.selected()[0];
      const client = grid.items[clientIndex];

      if (client) {
        ipcRenderer.send('invoice-preview', client);
      }
    });

    fs.access(registerFile, fs.F_OK, (err) => {
      if (!err) {
        const register = importRegister(registerFile);
        renderToGrid(grid, register);
      }
    });
  }

  function importRegister(register) {
    const workbook = xlxs.readFile(register);
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    return worksheet;
  }

  function renderToGrid(grid, worksheet) {
    const range = xlxs.utils.decode_range(worksheet['!ref']);
    const register = xlxs.utils.sheet_to_json(worksheet);
    let columns = [];
    
    const startIdx = range.s.c;
    const endIdx = range.e.c;
    const headerRow = range.s.r;
    //Loop first row and add cell values as table columns
    for (let i = startIdx; i < endIdx; i++) {
      const cellAddress = xlxs.utils.encode_cell({c: i, r: headerRow});
      const cell = worksheet[cellAddress];
      
      if (!cell) continue;

      columns.push({ name: cell.v });
    }
    
    grid.columns = columns;
    grid.items = register;
  }
})();
