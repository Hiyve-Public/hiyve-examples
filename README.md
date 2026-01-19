# Hiyve Examples

Example applications demonstrating how to build video conferencing apps with `@hiyve/*` components.

## Overview

The `@hiyve/*` packages provide React components for building video conferencing applications powered by MuzieRTC infrastructure. These examples show how to use the components to create fully-featured video apps.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- MuzieRTC API credentials (get from your MuzieRTC account)

### Install @hiyve Packages

All `@hiyve/*` packages are hosted on the Hiyve npm registry:

```
https://s3.amazonaws.com/muzie.media/npm-registry
```

Packages are referenced directly via URL in package.json:

```json
{
  "dependencies": {
    "@hiyve/client-provider": "https://s3.amazonaws.com/muzie.media/npm-registry/@hiyve/client-provider/client-provider-latest.tgz",
    "@hiyve/video-grid": "https://s3.amazonaws.com/muzie.media/npm-registry/@hiyve/video-grid/video-grid-latest.tgz"
  }
}
```

### Available Packages

| Package | Description |
|---------|-------------|
| `@hiyve/client-provider` | Core state management, hooks, and WebRTC client wrapper |
| `@hiyve/video-grid` | Auto-layout video grid with multiple layout modes |
| `@hiyve/video-tile` | Individual video tile components |
| `@hiyve/control-bar` | Media controls, recording, screen share |
| `@hiyve/chat` | Real-time text chat |
| `@hiyve/participant-list` | Participant list with mute indicators |
| `@hiyve/transcription` | Live transcription/captions display |
| `@hiyve/recording` | Recording indicator and controls |
| `@hiyve/device-selector` | Camera/microphone device selection |
| `@hiyve/audio-monitor` | Audio level visualization and gain control |
| `@hiyve/waiting-room` | Waiting room components |
| `@hiyve/file-manager` | File management in rooms |
| `@hiyve/mood-analysis` | Sentiment/mood detection |

## Examples

### Full Example

A complete video conferencing application demonstrating all features:

- Create/join video rooms
- Real-time video/audio with WebRTC
- Screen sharing
- Recording with auto-compose
- Live transcription (captions)
- Mood/sentiment analysis
- Real-time chat
- Participant list
- Waiting room
- File management
- Device selection & preview

**Run the example:**

```bash
cd full-example

# Install dependencies
npm run setup

# Configure your MuzieRTC credentials
cp server/.env.example server/.env
# Edit server/.env with your API key and secret

# Start development server
npm run dev
```

Open http://localhost:5173

## Architecture

### Provider Setup

All `@hiyve/*` components work inside a `ClientProvider`:

```tsx
import { ClientProvider } from '@hiyve/client-provider';
import { VideoGrid } from '@hiyve/video-grid';
import { ControlBar } from '@hiyve/control-bar';

function App() {
  return (
    <ClientProvider
      generateRoomToken={async () => {
        // Get room token from your server
        const res = await fetch('/api/room-token', { method: 'POST' });
        return (await res.json()).roomToken;
      }}
    >
      <VideoRoom />
    </ClientProvider>
  );
}

function VideoRoom() {
  return (
    <div>
      <VideoGrid layout="grid" />
      <ControlBar />
    </div>
  );
}
```

### Context-Aware Components

All components automatically connect to `ClientProvider` context:

```tsx
// Inside ClientProvider - auto-connected
<VideoGrid layout="grid" />  // participants auto-populated from context

// Outside ClientProvider - manual props
<VideoGrid
  participants={myParticipants}
  localUserId={myUserId}
  layout="grid"
/>
```

### Available Hooks

```tsx
// Connection & Room
const { isConnecting, error, createRoom, joinRoom, leaveRoom } = useConnection();
const { room, isOwner, isInRoom } = useRoom();

// Participants
const { participants, localUserId, participantCount } = useParticipants();

// Media Controls
const { isAudioMuted, isVideoMuted, toggleAudio, toggleVideo } = useLocalMedia();
const { setVideoDevice, setAudioInputDevice } = useDevices();

// Features
const { isRecording, startRecording, stopRecording } = useRecording();
const { isTranscribing, transcriptions } = useTranscription();
const { messages, sendMessage } = useChat();
const { waitingUsers, admitUser, rejectUser } = useWaitingRoom();
```

## Customization

All components support customization via props:

```tsx
// Custom labels (i18n)
<ControlBar
  labels={{
    mute: 'Silenciar',
    unmute: 'Activar',
  }}
/>

// Custom colors (theming)
<RecordingIndicator
  colors={{
    indicator: '#ff0000',
    background: 'rgba(255,0,0,0.1)',
  }}
/>

// Custom styles
<VideoGrid
  styles={{
    padding: 16,
    gap: 8,
    borderRadius: 8,
  }}
/>

// MUI sx prop
<ChatPanel sx={{ height: '100%', background: '#1a1a1a' }} />
```

## Server Setup

Your server must generate room tokens by calling the MuzieRTC signaling server:

```javascript
// server.js
app.post('/api/room-token', async (req, res) => {
  const response = await fetch(`https://${REGION}.rtc.muziemedia.com/room-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: process.env.APIKEY,
      secret: process.env.CLIENT_SECRET,
    }),
  });
  const { roomToken } = await response.json();
  res.json({ roomToken });
});
```

## Documentation

See the JSDoc comments in each example component for detailed documentation:

- `src/main.tsx` - Provider setup
- `src/App.tsx` - Component overview and hooks reference
- `src/components/VideoRoom.tsx` - Customization examples
- `src/components/Sidebar.tsx` - Multiple hooks usage

## License

Commercial IWantToPractice, LLC 2025
