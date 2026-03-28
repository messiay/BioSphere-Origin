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
        secure: false,
        timeout: 300000, // 5 minutes
        proxyTimeout: 300000, // 5 minutes (for slow backend responses)
      },
      '/api/google-patents': {
        target: 'https://patents.google.com/patent',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/google-patents/, ''),
        secure: false
      },
      '/api/ncbi-utils': {
        target: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ncbi-utils/, ''),
        secure: false
      }
    }
  }
})
