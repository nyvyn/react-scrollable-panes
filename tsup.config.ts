import { defineConfig } from 'tsup';

export default defineConfig({
    // bundle TS **and** copy the stylesheet
    entry: ['src/index.ts', 'src/styles.css'],
    dts: true,                 // generate *.d.ts
    format: ['cjs', 'esm'],    // matches "main" & "modul
    sourcemap: true,
    // copy *.css files verbatim to dist and keep the filename
    loader: { '.css': 'file' },     // esbuild “file” loader
    clean: true,
});
