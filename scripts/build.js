/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const chalk = require('chalk');
const rollup = require('rollup');
const del = require('del');
const commonJs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');

const entries = [
  {
    dest: 'dist/stardog.js',
    moduleName: 'stardogjs',
    minify: false,
    name: 'Uncommpressed UMD',
  },
  {
    dest: 'dist/stardog.min.js',
    moduleName: 'stardogjs',
    minify: true,
    name: 'Minified UMD',
  },
];

del('dist/*')
  .then(() => {
    return Promise.all(
      entries.map(config => {
        console.log(chalk.yellow(`Starting build for ${config.name}...`));
        const plugins = [
          resolve({
            browser: true,
            preferBuiltins: false,
          }),
          json(),
          commonJs(),
          babel({
            exclude: 'node_modules/**',
            presets: ['es2015-rollup'],
          }),
        ];
        if (config.minify) {
          plugins.push(uglify());
        }
        return rollup
          .rollup({
            entry: 'lib/index.js',
            treeshake: true,
            plugins,
          })
          .then(bundle => {
            console.log(chalk.green(`${config.name} successfully rolled.`));
            console.log(chalk.yellow(`Starting write for ${config.name}...`));
            return bundle.write({
              format: 'umd',
              dest: config.dest,
              // Inject the version here because the JSON plugin here pulls everything in and freezes it, thus adding a lot of bloat.
              // intro: `global.VERSION = '${pkg.version}';`,
              sourceMap: config.minify ? 'inline' : false,
              moduleName: 'stardogjs',
            });
          })
          .then(() =>
            console.log(
              chalk.green(
                `${config.name} successfully written to ${config.dest}.`
              )
            )
          );
      })
    );
  })
  .then(() => {
    console.log(
      chalk.bgBlack.greenBright(
        'All Stardog.js builds completed successfully.'
      )
    );
  })
  .catch(e => {
    console.error(chalk.bgBlack.red(e));
  });
