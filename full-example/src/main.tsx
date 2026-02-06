/**
 * Entry point for the Hiyve full-example application.
 *
 * Provider hierarchy:
 * - ThemeProvider: MUI dark theme
 * - ClientProvider: WebRTC connection (requires generateRoomToken)
 * - CloudProvider: AI cloud features (requires generateCloudToken)
 * - FileCacheProvider: File management
 * - MoodAnalysisProvider: Sentiment detection
 *
 * See SDK documentation for detailed API reference.
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline, Snackbar, Alert } from '@mui/material';
import { ClientProvider } from '@hiyve/client-provider';
import { CloudProvider } from '@hiyve/cloud-provider';
import { MoodAnalysisProvider } from '@hiyve/mood-analysis';
import { FileCacheProvider } from '@hiyve/file-manager';
import App from './App';

// Cloud API configuration
// Environment determines which Hiyve Cloud server to connect to
const CLOUD_ENVIRONMENT = (import.meta.env.VITE_HIYVE_ENVIRONMENT || 'development') as 'production' | 'development';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

/** Generate a room token from your backend server. */
async function generateRoomToken(): Promise<string> {
  const response = await fetch('/api/generate-room-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to generate room token');
  }
  return data.roomToken;
}

/** Generate a cloud token from your backend server for AI features. */
async function generateCloudToken(): Promise<string> {
  const response = await fetch('/api/generate-cloud-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to generate cloud token');
  }
  return data.cloudToken;
}

// Wrapper component to show connection errors
function Root() {
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: string) => {
    const errLower = err.toLowerCase();
    if (errLower.includes('does not exist') || errLower.includes('not found') || errLower.includes('no room')) {
      return 'Unable to join room. The room name may be incorrect or the host hasn\'t started the meeting yet.';
    }
    return err;
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ClientProvider
        generateRoomToken={generateRoomToken}
        localVideoElementId="local-video"
        persistDeviceChanges
        onError={(err) => {
          console.error('[ClientProvider Error]', err);
          setError(err.message || String(err));
        }}
      >
        <CloudProvider generateCloudToken={generateCloudToken} environment={CLOUD_ENVIRONMENT}>
          <FileCacheProvider>
            <MoodAnalysisProvider analyzerType="human">
              <App />
            </MoodAnalysisProvider>
          </FileCacheProvider>
        </CloudProvider>
      </ClientProvider>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="warning" sx={{ width: '100%' }}>
          {error && getErrorMessage(error)}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
