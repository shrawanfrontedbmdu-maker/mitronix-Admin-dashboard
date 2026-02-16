// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Serve and build the app under the /admin base path
  base: '/',
  server: {
    // Open the dev server at /admin instead of the root
    open: '/',
    proxy: {
      // Forward API requests to local backend during development
      '/api': {
        target: 'https://miltronix-backend-1.onrender.com/api', // Your backend URL
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err?.message)
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Bad gateway (proxy error)' }))
            }
          })
        },
      },
    },
  },
})
