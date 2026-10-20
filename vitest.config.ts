import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@chci/parser-core': path.resolve(__dirname, 'packages/parser-core/src/index.ts'),
      '@chci/device-specs': path.resolve(__dirname, 'packages/device-specs/src/index.ts'),
      '@': path.resolve(__dirname, 'apps/explorer/src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'packages/**/src/**/*.test.ts',
      'apps/explorer/src/**/*.test.{ts,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: [
        'packages/parser-core/src/**/*.ts',
        'packages/device-specs/src/**/*.ts',
        'apps/explorer/src/state/**/*.ts',
        'apps/explorer/src/platform/**/*.ts',
        'apps/explorer/src/features/**/*.{ts,tsx}'
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        '**/index.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
});
