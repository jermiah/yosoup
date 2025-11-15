import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Allow access from iPhone on local network
    https: false // Set to true with certs for iOS in production
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
