/**
 * Token Room Example - Application Entry Point
 *
 * Demonstrates token-based room joining with invite links.
 * This is a minimal example - no sidebar, no advanced features.
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline, Snackbar, Alert } from '@mui/material';
import { ClientProvider } from '@hiyve/client-provider';
import App from './App';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

/**
 * Generate a room token from the backend server.
 * This token allows the client to authenticate with the signaling server.
 */
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

/**
 * Convert error to user-friendly message.
 */
function getErrorMessage(err: string): string {
  const errLower = err.toLowerCase();
  if (errLower.includes('does not exist') || errLower.includes('not found') || errLower.includes('no room')) {
    return 'Unable to join room. The room name may be incorrect or the host hasn\'t started the meeting yet.';
  }
  if (errLower.includes('token') || errLower.includes('expired')) {
    return 'The invite link is invalid or has expired. Please request a new invite link from the host.';
  }
  return err;
}

/**
 * Root component with error handling.
 */
function Root() {
  const [error, setError] = useState<string | null>(null);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ClientProvider
        generateRoomToken={generateRoomToken}
        localVideoElementId="local-video"
        persistDeviceChanges
        onError={(err: unknown) => {
          console.error('[ClientProvider Error]', err);
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
        }}
      >
        <App />
      </ClientProvider>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
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
