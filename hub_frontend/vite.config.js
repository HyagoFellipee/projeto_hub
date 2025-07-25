import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simple config without complex polyfills
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['fsevents']
  },
})