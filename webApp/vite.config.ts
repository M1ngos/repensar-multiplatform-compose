import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  plugins: [react()],
  build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
          onwarn(warning, warn) {
              if (
                  warning.code === 'SOURCEMAP_ERROR' &&
                  /kotlin-stdlib\.mjs/.test(warning.message)
              ) return; // ignore stdlib warnings
              warn(warning);
          }
      }
  },
  server: { port: 3000 },
});