const chokidar = require('chokidar');
const exec = require('child_process').exec;

function makeElm() {
  const elmMake = 'elm-make ./src/elm/Main.elm --output ./src/elm.js';

  exec(elmMake, (err, stdout) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });
}

makeElm();

const elmWatcher = chokidar.watch('./src/elm/**/*.elm')
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
