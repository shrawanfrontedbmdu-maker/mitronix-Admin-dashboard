// In your frontend project: vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request starting with /api will be forwarded
      '/api': {
        target: 'http://localhost:3000', // Use local mock server during development
        changeOrigin: true,
        secure: false,
        // Optional: add a small timeout and error handler
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err && err.message)
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Bad gateway (proxy error)' }))
            }
          })
        }
      },
    },
  },
})
