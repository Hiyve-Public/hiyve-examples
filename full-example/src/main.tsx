/**
 * @hiyve/components - Application Entry Point
 *
 * This file shows how to set up the provider hierarchy for a hiyve video app.
 *
 * ## Provider Hierarchy
 *
 * ```
 * ThemeProvider (MUI theming)
 *   └── ClientProvider (required - manages WebRTC client)
 *         ├── generateRoomToken - async function returning room token from your server
 *         ├── localVideoElementId - ID of local video element (default: 'local-video')
 *         ├── persistDeviceChanges - save device selections to localStorage
 *         └── onError - error callback for logging/user notification
 *
 *         └── FileCacheProvider (optional - for file management)
 *               └── MoodAnalysisProvider (optional - for sentiment detection)
 *                     └── App
 * ```
 *
 * ## ClientProvider Props
 *
 * | Prop | Type | Required | Description |
 * |------|------|----------|-------------|
 * | generateRoomToken | () => Promise<string> | Yes | Returns room token from your server |
 * | localVideoElementId | string | No | ID for local video element (default: 'local-video') |
 * | persistDeviceChanges | boolean | No | Save device selections to localStorage |
 * | connectOptions | { videoDeviceId?, audioDeviceId? } | No | Initial device IDs |
 * | onError | (error: Error) => void | No | Error callback |
 *
 * ## Room Token Generation
 *
 * Your server must generate room tokens by calling the MuzieRTC signaling server:
 *
 * ```javascript
 * // server.js
 * app.post('/api/generate-room-token', async (req, res) => {
 *   const response = await fetch(`https://${SERVER_REGION}.rtc.muziemedia.com/room-token`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       apiKey: process.env.APIKEY,
 *       secret: process.env.CLIENT_SECRET,
 *     }),
 *   });
 *   const { roomToken } = await response.json();
 *   res.json({ roomToken });
 * });
 * ```
 *
 * ## MoodAnalysisProvider Props
 *
 * | Prop | Type | Description |
 * |------|------|-------------|
 * | analyzerType | 'human' \| 'voice' | Type of mood analyzer |
 * | onMoodChange | (userId, moodState) => void | Called when mood changes |
 * | onMoodError | (error) => void | Called on analysis error |
 *
 * ## FileCacheProvider (from @hiyve/file-manager)
 *
 * Provides file system caching for file management components. Must be nested
 * inside ClientProvider to access the room context.
 *
 * **Features:**
 * - File browsing with folder navigation
 * - Upload, download, delete, rename, move operations
 * - Folder creation and deletion
 * - File sharing with room participants
 * - Automatic cache synchronization with server
 *
 * **Hook: `useFileCache()`**
 * ```tsx
 * const {
 *   isReady,          // Cache initialized
 *   cacheState,       // 'idle' | 'ready' | 'error'
 *   getFileTree,      // Get folder contents
 *   getFilesByType,   // Filter by resource type
 *   uploadFile,       // Upload a file
 *   deleteFile,       // Delete a file
 *   createFolder,     // Create folder
 *   moveFile,         // Move file to folder
 *   shareFile,        // Share with participants
 *   getPresignedUrl,  // Get download URL
 * } = useFileCache();
 * ```
 *
 * ## Example: Minimal Setup
 *
 * ```tsx
 * import { ClientProvider } from '@hiyve/client-provider';
 *
 * function App() {
 *   return (
 *     <ClientProvider
 *       generateRoomToken={async () => {
 *         const res = await fetch('/api/room-token', { method: 'POST' });
 *         return (await res.json()).roomToken;
 *       }}
 *     >
 *       <VideoRoom />
 *     </ClientProvider>
 *   );
 * }
 * ```
 *
 * ## Example: Full Setup with All Features
 *
 * ```tsx
 * import { ClientProvider } from '@hiyve/client-provider';
 * import { MoodAnalysisProvider } from '@hiyve/mood-analysis';
 * import { FileCacheProvider } from '@hiyve/file-manager';
 *
 * function App() {
 *   return (
 *     <ClientProvider
 *       generateRoomToken={generateToken}
 *       localVideoElementId="local-video"
 *       persistDeviceChanges
 *       onError={(err) => toast.error(err.message)}
 *     >
 *       <FileCacheProvider>
 *         <MoodAnalysisProvider
 *           analyzerType="human"
 *           onMoodChange={(userId, mood) => {
 *             // Optionally connect to transcription enrichment
 *             enrichTranscription(userId, { sentiment: mood.sentiment });
 *           }}
 *         >
 *           <VideoRoom />
 *         </MoodAnalysisProvider>
 *       </FileCacheProvider>
 *     </ClientProvider>
 *   );
 * }
 * ```
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ClientProvider } from '@hiyve/client-provider';
import { MoodAnalysisProvider } from '@hiyve/mood-analysis';
import { FileCacheProvider } from '@hiyve/file-manager';
import App from './App';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

/**
 * Generate a room token from your backend server.
 *
 * In production, this function should:
 * 1. Call your authenticated backend endpoint
 * 2. Your backend calls MuzieRTC signaling server with API credentials
 * 3. Return the roomToken to the client
 *
 * @returns Promise resolving to a room token string
 * @throws Error if token generation fails
 *
 * @example
 * ```ts
 * async function generateRoomToken(): Promise<string> {
 *   const response = await fetch('/api/room-token', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Authorization': `Bearer ${userToken}`, // Optional: add auth
 *     },
 *   });
 *   if (!response.ok) throw new Error('Failed to get room token');
 *   return (await response.json()).roomToken;
 * }
 * ```
 */
async function generateRoomToken(): Promise<string> {
  const response = await fetch('/api/generate-room-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to generate room token');
  }
  return (await response.json()).roomToken;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ClientProvider
        generateRoomToken={generateRoomToken}
        localVideoElementId="local-video"
        persistDeviceChanges
        onError={(err) => console.error('[ClientProvider Error]', err)}
      >
        <FileCacheProvider>
          <MoodAnalysisProvider analyzerType="human">
            <App />
          </MoodAnalysisProvider>
        </FileCacheProvider>
      </ClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
