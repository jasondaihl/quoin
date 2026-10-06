import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2022',
  dts: true,
  sourcemap: true,
  clean: true,
  // Lit relies on legacy (experimental) decorators; tell esbuild to match tsconfig.
  tsconfig: './tsconfig.json',
  external: ['lit', '@jasondaihl/tokens'],
});
