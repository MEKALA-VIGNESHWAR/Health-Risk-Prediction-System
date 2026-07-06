import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// The React SPA is built to ../dist and served either by the Spring Boot JAR
// (bundled into static/) or by nginx. During local dev, /api is proxied to the
// Spring backend on :8080 so the token/`/api` contract is identical to prod.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
  },
})
