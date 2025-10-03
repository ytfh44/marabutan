/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/main.ts',
        'src/demo/**',
        'src/examples/index.ts',
        'src/examples/templates.ts',
        'src/examples/components-jsx.tsx',
        'src/counter.ts',
        'src/index.ts',
      ],
      thresholds: {
        lines: 72,
        functions: 64,
        branches: 85,
        statements: 72
      }
    },
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '.',
  },
})
