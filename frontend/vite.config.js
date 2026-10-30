import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // No aceptar encabezados Host arbitrarios: evita exponer el servidor de desarrollo a DNS rebinding.
    allowedHosts: ['localhost', '127.0.0.1'],
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
