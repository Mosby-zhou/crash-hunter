import resolve from '@rollup/plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import strip from '@rollup/plugin-strip';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import babel from '@rollup/plugin-babel';
import _ from 'lodash';

const pkg = require('./package.json');

const browserLibConfigBase = {
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: ['src/**'],
  },
  plugins: [
    replace({
      'process.env.SDK_VERSION': JSON.stringify(pkg.version),
    }),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    babel({
      babelrc: false,
      extensions: ['.js', '.ts'],
      babelHelpers: 'runtime',
      presets: ['@babel/preset-env'],
      plugins: ['@babel/plugin-transform-runtime'],
    }),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({ browser: true, preferBuiltins: true, mainFields: ['browser'] }),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
};

const browserLibConfig = [
  {
    ...browserLibConfigBase,
    input: `src/browser/index.umd.ts`,
    output: {
      file: pkg['umd:main'],
      name: _.upperFirst(_.camelCase(pkg.name)),
      format: 'umd',
      sourcemap: true,
      sourcemapExcludeSources: true,
    },
    plugins: [...browserLibConfigBase.plugins, uglify()],
  },
  {
    ...browserLibConfigBase,
    input: `src/browser/index.ts`,
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      sourcemapExcludeSources: true,
    },
    plugins: [...browserLibConfigBase.plugins],
  },
];

const nodeLibConfig = [
  {
    input: `src/node/index.ts`,
    output: [{ file: pkg.main, format: 'cjs', exports: 'auto', sourcemap: true }],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: ['events'],
    watch: {
      include: 'src/**',
    },
    plugins: [
      replace({
        'process.env.SDK_VERSION': JSON.stringify(pkg.version),
      }),
      // Compile TypeScript files
      typescript({ useTsconfigDeclarationDir: true }),
      strip({
        include: ['**/*.ts'],
        // // set this to `false` if you don't want to
        // // remove debugger statements
        debugger: true,

        // // defaults to `[ 'console.*', 'assert.*' ]`
        functions: ['console.log', 'assert.*', 'debug', 'alert'],

        // // set this to `false` if you're not using sourcemaps –
        // // defaults to `true`
        sourceMap: true,
      }),
      commonjs(),
      // Allow node_modules resolution, so you can use 'external' to control
      // which external modules to include in the bundle
      // https://github.com/rollup/rollup-plugin-node-resolve#usage
      resolve({ preferBuiltins: true }),

      // Resolve source maps to the original source
      sourceMaps(),
    ],
  },
];

const config = async () => [].concat(nodeLibConfig, browserLibConfig);

export default config;
