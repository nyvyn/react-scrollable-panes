import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],   // main barrel file
    dts: true,                 // generate *.d.ts
    format: ['cjs', 'esm'],    // matches "main" & "modul
    sourcemap: true
});