/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

const del = require('del');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const eslint = require('rollup-plugin-eslint');
const uglify = require('rollup-plugin-uglify');
const pkg = require('../package.json');

const bundles = [
  {
    format: 'umd',
    dest: 'dist/stardog.min.js',
    plugins: [
      eslint(),
      babel({
        exclude: 'node_modules/**',
        presets: ['es2015-rollup'],
      }),
      uglify(),
    ],
    moduleName: 'stardog',
    minify: true,
  },
  {
    format: 'umd',
    dest: 'dist/stardog.umd.js',
    plugins: [
      eslint(),
      babel({
        exclude: 'node_modules/**',
        presets: ['es2015-rollup'],
      }),
    ],
  },
];

Promise.resolve()
  .then(() => del(['dist/*']))
  .then(() => {
    bundles.forEach(bundle => {
      rollup
        .rollup({
          entry: 'js/stardog',
          external: Object.keys(pkg.dependencies),
          plugins: bundle.plugins,
        })
        .then(dist =>
          dist.write({
            dest: bundle.dest,
            format: bundle.format,
            moduleName: bundle.moduleName || 'main',
            sourceMap: !bundle.minify || bundle.sourceMap || false,
          })
        )
        .then(() => console.log(`${bundle.dest} written successfully.`));
    });
  })
  .catch(err => console.error(err));
