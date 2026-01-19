import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Include muziertcclient-alpha so it's properly pre-bundled
    include: ['muziertcclient-alpha'],
    // Exclude @hiyve packages from pre-bundling so changes are picked up
    exclude: [
      '@hiyve/audio-monitor',
      '@hiyve/chat',
      '@hiyve/client-provider',
      '@hiyve/control-bar',
      '@hiyve/device-selector',
      '@hiyve/file-manager',
      '@hiyve/mood-analysis',
      '@hiyve/participant-list',
      '@hiyve/recording',
      '@hiyve/sidebar',
      '@hiyve/transcription',
      '@hiyve/video-grid',
      '@hiyve/video-tile',
      '@hiyve/waiting-room',
    ],
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
    watch: {
      // Watch hiyve-components for changes
      ignored: ['!**/node_modules/@hiyve/**'],
    },
    fs: {
      // Allow serving files from hiyve-components
      allow: [
        '.',
        path.resolve(__dirname, '../../hiyve-components'),
      ],
    },
  },
});
