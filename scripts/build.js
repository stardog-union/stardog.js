const { babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');
const chalk = require('chalk');
const { deleteAsync } = require('del');
const rollup = require('rollup');

const entries = [
  { browser: true, minify: false },
  { browser: true, minify: true },
  { browser: false, minify: false },
  { browser: false, minify: true },
];

deleteAsync('dist/*')
  .then(() =>
    Promise.all(
      entries.map(({ browser, minify }) => {
        const name = `${minify ? 'Minified' : 'Uncompressed'} ${
          browser ? 'Browser' : 'Node'
        } UMD`;

        const output = {
          file: `dist/stardog.${browser ? 'browser' : 'node'}${
            minify ? '.min' : ''
          }.js`,
          name: 'stardogjs',
          format: 'umd',
        };

        console.log(chalk.yellow(`Starting build for ${name}...`));

        const plugins = [
          nodeResolve({
            browser,
          }),
          json(),
          commonjs(),
          babel({
            babelHelpers: 'bundled',
            targets: browser ? 'defaults' : 'maintained node versions',
          }),
        ];
        if (minify) {
          plugins.push(terser());
        }

        return rollup
          .rollup({
            input: 'lib/index.js',
            output,
            plugins,
          })
          .then(bundle => {
            console.log(chalk.green(`${name} successfully rolled.`));
            console.log(chalk.yellow(`Starting write for ${name}...`));
            return bundle.write(output);
            // Inject the version here because the JSON plugin here pulls everything in and freezes it, thus adding a lot of bloat.
            // intro: `global.VERSION = '${pkg.version}';`,
          })
          .then(() =>
            console.log(
              chalk.green(`${name} successfully written to ${output.file}.`)
            )
          );
      })
    )
  )
  .then(() => {
    console.log(
      chalk.bgBlack.greenBright('All Stardog.js builds completed successfully.')
    );
  })
  .catch(err => {
    console.error(chalk.bgBlack.red(err));
    process.exit(1);
  });
