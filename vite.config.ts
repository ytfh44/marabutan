/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => ({
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
        'src/examples/**',
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
  build: {
    // Default library build configuration
    lib: {
      entry: 'src/index.ts',
      formats: ['es']
    },
    // Exclude examples directory from build
    rollupOptions: {
      external: (id) => {
        // Exclude examples from the build
        return id.includes('/examples/') || id.includes('?examples') || id.endsWith('.test.ts') || id.endsWith('.test.tsx') || id.endsWith('.spec.ts');
      },
      output: mode === 'min' ? {
        // Single minified file for browser usage
        format: 'iife',
        entryFileNames: 'marabutan.min.js',
        inlineDynamicImports: true,
        globals: {},
      } : {
        // Library build - ESM format for npm packages
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      }
    },
    // Minification settings
    minify: mode === 'min' ? 'esbuild' : false,
    sourcemap: mode === 'min' ? false : true,
  }
}))
