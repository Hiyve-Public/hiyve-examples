# Hiyve Examples

Example applications demonstrating how to build video conferencing apps with `@hiyve/*` components.

## Quick Start

```bash
# 1. Clone or download this repository
git clone https://github.com/AcmeRTC/hiyve-examples.git
cd hiyve-examples

# 2. Authenticate with Hiyve (required for @hiyve/* packages)
npx hiyve-cli login

# 3. Run the setup script
./setup.sh

# 4. Start the app
cd full-example
pnpm run dev
```

Open http://localhost:5173

The setup script will:
- Check Node.js version (18+ required)
- Verify Hiyve authentication (or prompt you to login)
- Install all dependencies
- Create the environment file
- Prompt for your Hiyve API credentials

## Overview

The `@hiyve/*` packages provide React components for building video conferencing applications. These examples show how to use the components to create fully-featured video apps.

## Prerequisites

- Node.js 18+
- pnpm
- **Hiyve API Key** - Get one at [console.hiyve.dev](https://console.hiyve.dev)

## Authentication

The `@hiyve/*` packages are hosted on a private npm registry. You must authenticate before installing:

```bash
# Login with your Hiyve API key
npx hiyve-cli login

# Verify your authentication
npx hiyve-cli whoami
```

This configures npm to access `@hiyve/*` packages from `https://console.hiyve.dev/api/registry/`.

## Available Packages

All `@hiyve/*` packages are hosted on S3 and referenced directly via URL in package.json:

| Package | Description |
|---------|-------------|
| `@hiyve/client-provider` | Core state management, hooks, and WebRTC client wrapper |
| `@hiyve/video-grid` | Auto-layout video grid with multiple layout modes |
| `@hiyve/video-tile` | Individual video tile components with mood indicators |
| `@hiyve/control-bar` | Media controls, recording, screen share, intelligence mode |
| `@hiyve/chat` | Real-time text chat |
| `@hiyve/participant-list` | Participant list with mute/hand raise indicators |
| `@hiyve/transcription` | Live transcription/captions display |
| `@hiyve/recording` | Recording indicator and controls |
| `@hiyve/device-selector` | Camera/microphone device selection and preview |
| `@hiyve/audio-monitor` | Audio level visualization and gain control |
| `@hiyve/waiting-room` | Waiting room setup and guest components |
| `@hiyve/file-manager` | File management with custom viewer support |
| `@hiyve/mood-analysis` | Real-time sentiment/mood detection |
| `@hiyve/sidebar` | Configurable tabbed sidebar container |
| `@hiyve/whiteboard` | Collaborative whiteboard with real-time sync |
| `@hiyve/qa` | Q&A panel with questions, voting, answers, and auto-save |
| `@hiyve/utilities` | Shared utilities: LiveClock, TooltipIconButton, useContainerBreakpoint |

### Package Installation

Packages are installed from the private Hiyve registry. After authenticating with `npx hiyve-cli login`, add packages to your project:

```json
{
  "dependencies": {
    "@hiyve/client-provider": "^1.0.0",
    "@hiyve/video-grid": "^1.0.0",
    "@hiyve/qa": "^1.0.0"
  }
}
```

Your project needs an `.npmrc` file to configure the registry:

```
@hiyve:registry=https://console.hiyve.dev/api/registry/
```

## Examples

### Basic Example

The simplest possible video conferencing application - ideal for getting started:

- Create/join video rooms by name
- Real-time video/audio with WebRTC
- Screen sharing
- Device selection and preview
- Layout switching

This example uses only 6 packages: `client-provider`, `video-grid`, `video-tile`, `control-bar`, `device-selector`, and `utilities`.

See [basic-example/README.md](basic-example/README.md) for details.

```bash
cd basic-example
pnpm run setup
pnpm run dev
```

### Full Example

A complete video conferencing application demonstrating all features:

- Create/join video rooms
- Real-time video/audio with WebRTC
- Screen sharing
- Recording with auto-compose
- Live transcription (captions)
- Mood/sentiment analysis
- Real-time chat
- Participant list with hand raising
- Waiting room
- File management with custom viewers
- Q&A panel (questions, upvoting, answers, auto-save)
- Device selection & preview
- Collaborative whiteboard

See [full-example/README.md](full-example/README.md) for details.

### Token Room Example

A minimal example demonstrating token-based room joining with shareable invite links:

- Room creation with invite links
- Token-based joining (no room name needed for guests)
- Simple video grid and controls
- No advanced features (chat, recording, etc.)

This example is ideal for understanding the invite link flow:
1. Owner creates a room
2. Owner generates an invite link with a join token
3. Guest opens the link and joins directly

See [token-room-example/README.md](token-room-example/README.md) for details.

```bash
cd token-room-example
pnpm run setup
pnpm run dev
```

### Next.js Example

A minimal video conferencing app built with **Next.js 14** App Router:

- Next.js App Router with API routes (no separate Express server)
- Server-side rendering with 'use client' directives
- Device preview with camera/microphone selection
- Create or join video rooms
- Video grid with layout switching

This example shows how to integrate Hiyve SDK with Next.js and demonstrates the differences from Vite-based examples.

See [nextjs-example/README.md](nextjs-example/README.md) for details.

```bash
cd nextjs-example
pnpm run setup
pnpm run dev
# Open http://localhost:3000
```

## Architecture

### Provider Setup

All `@hiyve/*` components work inside a `ClientProvider`:

```tsx
import { ClientProvider } from '@hiyve/client-provider';
import { FileCacheProvider } from '@hiyve/file-manager';
import { MoodAnalysisProvider } from '@hiyve/mood-analysis';
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
      <FileCacheProvider>
        <MoodAnalysisProvider>
          <VideoRoom />
        </MoodAnalysisProvider>
      </FileCacheProvider>
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

// Q&A (from @hiyve/qa)
import { useQAListener } from '@hiyve/qa';
useQAListener({ isOwner, localUserId, questions, onQuestionsChange });

// File Management (from @hiyve/file-manager)
import { useFileCache } from '@hiyve/file-manager';
const { isReady, getFileTree, uploadFile } = useFileCache();
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

// Custom file viewers (extensible viewer system)
import { FileManager, type CustomViewerMap } from '@hiyve/file-manager';
import { QASessionViewer, type QASessionFile } from '@hiyve/qa';

const customViewers: CustomViewerMap = {
  'qa-session': (data, file, onClose) => (
    <QASessionViewer sessionData={data as QASessionFile} onClose={onClose} />
  ),
};

<FileManager customViewers={customViewers} />
```

## Server Setup

Your server must generate room tokens by calling the Hiyve signaling server:

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

## Development Workflow

For developers working on `hiyve-sdk` alongside examples:

### Toggle Between Local and S3 Packages

```bash
# From hiyve-examples directory:

# Switch to local packages (for development)
./toggle-packages.sh dev

# Switch to S3 packages (for production/testing)
./toggle-packages.sh prod

# Check current mode
./toggle-packages.sh status
```

**Important:** Always run `./toggle-packages.sh prod` before committing to ensure the examples reference S3 packages.

### Package Scripts

```bash
# Per-example toggle (from inside an example directory):
pnpm run packages:status
pnpm run packages:dev
pnpm run packages:prod
```

## Documentation

- [Basic Example README](basic-example/README.md) - Simplest video app with minimal packages
- [Full Example README](full-example/README.md) - Feature-rich example with all components
- [Token Room Example README](token-room-example/README.md) - Token-based joining with invite links
- [Next.js Example README](nextjs-example/README.md) - Next.js App Router integration
- [API Documentation](https://doawc2271w91z.cloudfront.net/docs/hiyve-sdk/latest/index.html) - Component API reference

## License

Commercial - IWantToPractice, LLC 2026
