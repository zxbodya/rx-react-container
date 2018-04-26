import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default [
  {
    entry: 'src/index.js',
    external: ['rxjs', 'prop-types', 'react'],
    targets: [
      { dest: pkg.main, format: 'cjs' },
      { dest: pkg.module, format: 'es' },
    ],
    plugins: [
      babel({
        exclude: ['node_modules/**'],
        runtimeHelpers: true,
      }),
    ],
    sourceMap: true,
  },
];
