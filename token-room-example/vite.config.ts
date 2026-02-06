import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const sdkPath = path.resolve(__dirname, '../../hiyve-sdk');
const isDevMode = fs.existsSync(sdkPath);

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      '@emotion/react',
      '@emotion/styled',
      '@emotion/cache',
      '@mui/material',
      '@mui/system',
      '@mui/icons-material',
    ],
  },
  build: {
    commonjsOptions: {
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
      ignored: ['!**/node_modules/@hiyve/**'],
    },
    fs: {
      allow: [
        '.',
        ...(isDevMode ? [sdkPath] : []),
      ],
    },
  },
});
