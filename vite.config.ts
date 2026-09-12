import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // GitHub Pages project sites serve from /<repo>/ — override per environment
  // via VITE_BASE (the deploy workflow computes it; custom domains use '/').
  base: process.env.VITE_BASE || '/',
  define: {
    // Settings page reads the app version; `process` doesn't exist in the browser
    'process.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // No `virtual:pwa-register` import in the app — inject a registration
      // script into index.html instead. Without this the service worker
      // never registers and the app is not installable.
      injectRegister: 'script-defer',
      // Serve the manifest + SW on the dev server too, so install intent
      // works on localhost while developing.
      devOptions: { enabled: true },
      includeAssets: ['icons/*.png', 'zikr.svg'],
      manifest: {
        name: 'Zikr',
        short_name: 'Zikr',
        description: 'Islamic dhikr practice tracker',
        theme_color: '#012d1d',
        background_color: '#faf7f0',
        display: 'standalone',
        // Relative to the manifest URL — survives a non-root base
        // (GitHub Pages serves project sites from /<repo>/).
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Serve index.html for cold-open navigations (e.g. /join/CODE invite
        // links opened offline or before the service worker has cached docs).
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' }
          },
          {
            // Shared-goals sync API: serve stale data offline, refresh online.
            urlPattern: /^https:\/\/[a-z0-9-]+\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'shared-room-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
            }
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['zustand', 'dexie', 'dexie-react-hooks']
        }
      }
    }
  }
});
