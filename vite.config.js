// In your frontend project: vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Serve and build the app under the /admin base path
  base: '/admin',
  server: {
    // Open the dev server at /admin instead of the root
    open: '/admin',
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
