// native/capacitor-local-server/rollup.config.js
// Run after `tsc` (see package.json's "build" script) — takes the ESM
// output tsc already wrote to dist/esm/ and bundles it into the single
// CJS file package.json's "main" points to. inlineDynamicImports is
// required because src/index.ts dynamically imports ./web — without it
// rollup would try to emit a second chunk, which a single "main" file
// consumer (plain `require('elorge-capacitor-local-server')`) can't load.
export default {
  input: 'dist/esm/index.js',
  output: {
    file: 'dist/plugin.cjs.js',
    format: 'cjs',
    sourcemap: true,
    inlineDynamicImports: true,
    exports: 'named',
  },
  external: ['@capacitor/core'],
};
