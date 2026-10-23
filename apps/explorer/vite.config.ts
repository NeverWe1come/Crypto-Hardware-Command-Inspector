import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_URL || '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@chci/parser-core': fileURLToPath(
        new URL('../../packages/parser-core/src/index.ts', import.meta.url)
      ),
      '@chci/device-specs': fileURLToPath(
        new URL('../../packages/device-specs/src/index.ts', import.meta.url)
      )
    }
  },
  build: {
    chunkSizeWarningLimit: 3000
  }
});
