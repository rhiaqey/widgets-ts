const fs = require('fs');

require('log-timestamp');
console.log('>> copying files');

fs.cpSync('www/build', 'dist/umd', {
  recursive: true,
});

fs.cpSync('www/assets', 'dist/assets', {
  recursive: true,
});

console.log('>> files copied');
