import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'VulneraCheck',
        short_name: 'VulneraCheck',
        description:
          'Evaluación del Perfil de Vulnerabilidad Conductual frente al Fraude de Pagos Autorizados (APP)',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // El PDF (@react-pdf/renderer + su documento) se carga con import()
        // dinámico solo al exportar, para no inflar el bundle inicial. Si
        // ese chunk lleva un hash de contenido, cada redeploy le cambia el
        // nombre de archivo y lo borra del servidor — una pestaña abierta
        // desde antes del redeploy pide el archivo viejo, Netlify no lo
        // encuentra y el catch-all de _redirects devuelve index.html (200)
        // en su lugar, que falla al parsear como JS. Con nombre fijo, ese
        // archivo siempre existe después de cualquier deploy.
        chunkFileNames: (chunkInfo) => {
          const stableChunks = ['react-pdf.browser', 'VulneraCheckReportDocument']
          if (stableChunks.some((name) => chunkInfo.name.includes(name))) {
            return `assets/${chunkInfo.name}.js`
          }
          return 'assets/[name]-[hash].js'
        },
      },
    },
  },
})
