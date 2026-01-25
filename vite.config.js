import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/blast': {
        target: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/blast/, ''),
        secure: false
      }
    }
  }
})
