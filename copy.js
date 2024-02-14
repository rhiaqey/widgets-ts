const fs = require('fs');

require('log-timestamp');
console.log('>> copying files');

fs.cpSync('www/build', 'dist/umd', {
  recursive: true,
});

console.log('>> files copied');
