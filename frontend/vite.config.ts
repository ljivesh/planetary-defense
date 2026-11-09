import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      // API_URL lets the e2e suite point the proxy at its own API instance.
      '/api': { target: process.env.API_URL ?? 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: {
    // three.js (orbit viewer) and Recharts are lazy-loaded route/feature chunks;
    // the entry chunk (React, router, Query, Radix, zod) is ~160 kB gzip.
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
