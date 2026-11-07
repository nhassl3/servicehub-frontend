import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['host.docker.internal', 'openig.servicehub.org', 'localhost'],
    proxy: {
      '/userinfo': { target: 'http://openig.servicehub.org', changeOrigin: true }
    }
  },
  plugins: [react()],
})
