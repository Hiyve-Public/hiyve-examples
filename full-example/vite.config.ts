import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Path to hiyve-sdk packages for alias resolution (dev mode only)
const sdkPackages = path.resolve(__dirname, '../../hiyve-sdk/packages');
const isDevMode = fs.existsSync(sdkPackages);

// Build aliases for SDK packages when in dev mode
// This is needed when SDK packages import from each other (e.g., qa imports utilities)
function getDevAliases() {
  if (!isDevMode) return {};

  return {
    '@hiyve/utilities': path.join(sdkPackages, 'utilities'),
    '@hiyve/session-common': path.join(sdkPackages, 'session-common'),
    '@hiyve/file-manager': path.join(sdkPackages, 'file-manager'),
    '@hiyve/client-provider': path.join(sdkPackages, 'client-provider'),
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Include dependencies used by @hiyve packages so they're properly pre-bundled
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'prop-types',
    ],
  },
  resolve: {
    // Alias @hiyve/* packages in dev mode so Vite can resolve internal SDK imports
    alias: getDevAliases(),
    // Dedupe dependencies to ensure single instance resolution
    // This prevents "multiple instances" warnings for packages shared between
    // hiyve-sdk and full-example
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
      // Watch hiyve-sdk for changes
      ignored: ['!**/node_modules/@hiyve/**'],
    },
    fs: {
      // Allow serving files from hiyve-sdk (dev mode only)
      allow: [
        '.',
        ...(isDevMode ? [path.resolve(__dirname, '../../hiyve-sdk')] : []),
      ],
    },
  },
});
