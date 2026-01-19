import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Include muziertcclient-alpha so it's properly pre-bundled
    include: ['muziertcclient-alpha'],
  },
  resolve: {
    // Dedupe dependencies to ensure single instance resolution
    dedupe: ['react', 'react-dom', 'muziertcclient-alpha'],
  },
  build: {
    commonjsOptions: {
      // Include @hiyve packages in CommonJS transformation
      include: [/node_modules/, /@hiyve\//],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
