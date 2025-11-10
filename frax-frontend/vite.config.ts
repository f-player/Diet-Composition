// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
 

export default defineConfig(({ command }) => {
    const base = command === 'build'
      ? '/LAB6/' 
      : '/'; 
    return {
      base: base, 
      plugins: [
        react(),
        mkcert(),
        VitePWA({
          registerType: 'autoUpdate',
          devOptions: { enabled: true },
          manifest: {
            name: "DIET Calculator",
            short_name: "DIET",
            description: "Сервис для расчета диеты по изотопному анализу.",
            start_url: ".",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#6eb1e0ff",
            icons: [
              { src: 'logo/logo32.png', type: 'image/png', sizes: '32x32' },
              { src: 'logo/logo192.png', type: 'image/png', sizes: '192x192', purpose: 'any maskable'  },
              { src: 'logo/logo512.png', type: 'image/png', sizes: '512x512', purpose: 'any maskable'  }
            ]
          }
        })
      ],
      server: {
        port: 3000,
        proxy: {
          '/api': {
            target: 'http://localhost:8080', 
            changeOrigin: true, 
          },
        },
      },
    }
  }
)
 