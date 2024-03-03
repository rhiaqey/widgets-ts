const {execSync} = require('child_process');

require('log-timestamp');
console.log('>> start watching stats');

/*
fs.watchFile('stencil-stats.json', (curr, prev) => {
    console.log(`stencil-stats.json file Changed`);
    exec('npm run build');
});
*/

const chokidar = require('chokidar');

const watcher = chokidar.watch('src/components', {ignored: /^\./, persistent: true});

watcher
  .on('add', (path) => {console.log('>> file', path, 'has been added');})
  .on('change', (path) => {
    console.log('>> file', path, 'has been changed');
    execSync('npm run build');
    console.log('>> build finished');
  })
  .on('unlink', (path) => {console.log('>> file', path, 'has been removed');})
  .on('error', (error) => {console.error('>> error happened', error);})
