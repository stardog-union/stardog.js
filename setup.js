const path = require('path');
const { spawn, exec } = require('child_process');

// console.info('setting up database...');
// exec('./load_test_data.sh', {
//   env: Object.assign({}, process.env, {
//     PATH: process.env.PATH + ':' + path.join(process.env.STARDOG_HOME, 'bin')
//   }),
//   shell: true,
//   stdio: 'inherit'
// }, (err, stdout, stderr) => {
//   if (err) {
//     console.error(err);
//   }
//   console.info('database created');

const jest = spawn('node node_modules/.bin/jest',
  ['test/query.spec.js', '--watch'], {
    shell: true,
    stdio: 'inherit'
  });
//});

