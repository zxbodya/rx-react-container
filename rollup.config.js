const typescript = require('rollup-plugin-typescript2');
const pkg = require('./package.json');

module.exports = {
  input: 'src/index.ts',
  external: ['rxjs', 'prop-types', 'react', 'hoist-non-react-statics', 'tslib'],
  output: [
    { file: pkg.main, sourcemap: true, format: 'cjs' },
    { file: pkg.module, sourcemap: true,  format: 'es' },
  ],
  plugins: [
    typescript({ cacheRoot: `${require('temp-dir')}/.rpt2_cache` }),
  ],
};
