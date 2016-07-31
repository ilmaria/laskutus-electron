const chokidar = require('chokidar');
const exec = require('child_process').exec;

function makeElm() {
  const elmMake = 'elm-make ./src/Main.elm --output ./elm.js';

  exec(elmMake, (err, stdout) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });
}

const elmWatcher = chokidar.watch('./src/**/*.elm')
  .on('change', makeElm);

const electron = exec('"./node_modules/.bin/electron" .', (err, stdout) => {
  if (err) {
    console.error(err);
  } else {
    console.log(stdout);
  }

  elmWatcher.close();
  return;
});
