import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'js/stardog',
  dest: 'build/stardog.min.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    eslint(),
    babel({
      exclude: 'node_modules/**'
    }),
    uglify(),
  ]
}