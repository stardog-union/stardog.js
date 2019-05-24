const rollup = require('rollup');
const chalk = require('chalk');
const del = require('del');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const typescript = require('rollup-plugin-typescript2');
const pkg = require('../package.json');

const moduleName = 'stardogjs';
const basePlugins = [
  commonjs(),
  resolve({
    browser: true,
    preferBuiltins: false, // for using `querystring` npm module, among others
  }),
  typescript({
    typescript: require('typescript'), // use local typescript
  }),
];
const entries = [
  {
    dest: pkg.browser,
    name: 'UMD',
    format: 'umd',
  },
  {
    dest: pkg.module,
    name: 'ESM',
    format: 'es',
  },
  {
    dest: pkg.main,
    name: 'CommonJS',
    format: 'cjs',
  },
].reduce(
  (decoratedEntries, entry) => [
    ...decoratedEntries,
    {
      ...entry,
      plugins: basePlugins,
      sourceMap: false,
    },
    {
      dest: entry.dest.replace(/\.(\w+)$/, '.min.$1'),
      name: `Minified ${entry.dest}`,
      format: entry.format,
      plugins: [...basePlugins, terser()],
      sourceMap: 'inline',
    },
  ],
  []
);

del('dist/*')
  .then(() => {
    return Promise.all(
      entries.map((entry) => {
        console.log(chalk.yellow(`Starting build for ${entry.name}...`));
        return rollup
          .rollup({
            input: 'lib/index.ts',
            treeshake: true,
            plugins: entry.plugins,
          })
          .then((bundle) => {
            console.log(chalk.green(`${entry.name} successfully rolled.`));
            console.log(chalk.yellow(`Starting write for ${entry.name}...`));
            return bundle.write({
              name: moduleName,
              format: entry.format,
              file: entry.dest,
              intro: entry.format === 'umd' ? `global.VERSION = '${pkg.version}';` : '',
              sourceMap: entry.sourceMap
            });
          })
          .then(() =>
            console.log(
              chalk.green(
                `${entry.name} successfully written to ${entry.dest}.`
              )
            )
          );
      })
    );
  })
  .then(() => {
    console.log(
      chalk.bgBlack.greenBright(
        'All Stardog.js builds completeled successfully.'
      )
    );
  })
  .catch((e) => {
    console.error(chalk.bgBlack.red(e));
  });
