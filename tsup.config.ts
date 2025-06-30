import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,                 // generate *.d.ts
    format: ['cjs', 'esm'],    // matches "main" & "modul
    clean: true,
});
