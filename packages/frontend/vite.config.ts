import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            if (req.url === '/api/logs/stream') {
              // SSE stream — prevent timeout
              _proxyReq.setTimeout(0);
            }
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
