# Basic Example

The simplest possible video conferencing application using the Hiyve SDK. This example demonstrates the minimum setup required to create a working video app.

## Quick Start

You can either run the root setup script (recommended) or set up manually:

### Option A: Root Setup Script (Recommended)

From the `hiyve-examples` root directory:

```bash
./setup.sh basic-example
```

This handles authentication, dependencies, and environment setup automatically.

### Option B: Manual Setup

#### 1. Authenticate with Hiyve

The `@hiyve/*` packages require authentication:

```bash
npx hiyve-cli login
```

Enter your Hiyve API key when prompted. Get one at [console.hiyve.dev](https://console.hiyve.dev).

#### 2. Install Dependencies

```bash
pnpm run setup
```

#### 3. Configure Server Credentials

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your Hiyve credentials:

```env
APIKEY=your-hiyve-api-key
CLIENT_SECRET=your-hiyve-secret
SERVER_REGION=us-west-2
```

#### 4. Start the App

```bash
pnpm run dev
```

Open http://localhost:5173

## Features

This is a minimal example with only essential features:

- Create or join video rooms by name
- Real-time video/audio with WebRTC
- Mute/unmute audio and video
- Screen sharing
- Layout switching (grid, speaker, sidebar)
- Device selection and preview before joining

## Packages Used

| Package | Purpose |
|---------|---------|
| `@hiyve/client-provider` | Core state management and WebRTC client |
| `@hiyve/video-grid` | Auto-layout video grid |
| `@hiyve/video-tile` | Individual video tiles |
| `@hiyve/control-bar` | Media controls |
| `@hiyve/device-selector` | Camera/microphone selection and preview |
| `@hiyve/utilities` | Shared utilities |

## Architecture

```
src/
├── main.tsx              # Provider setup with ClientProvider
├── App.tsx               # Routes between JoinForm and VideoRoom
├── hiyve.d.ts            # Type declarations for @hiyve packages
└── components/
    ├── JoinForm.tsx      # Room name input with device preview
    └── VideoRoom.tsx     # Video grid and control bar
```

### Component Flow

```
ClientProvider (main.tsx)
  └── App.tsx
      ├── JoinForm        # When not in room
      │   └── DevicePreview
      └── VideoRoom       # When in room
          ├── VideoGrid
          └── ControlBar
```

## Code Overview

### Provider Setup (main.tsx)

```tsx
import { ClientProvider } from '@hiyve/client-provider';

<ClientProvider
  generateRoomToken={generateRoomToken}
  localVideoElementId="local-video"
  persistDeviceChanges
>
  <App />
</ClientProvider>
```

### Join Form with Device Preview (JoinForm.tsx)

```tsx
import { useConnection } from '@hiyve/client-provider';
import { DevicePreview } from '@hiyve/device-selector';

const { createRoom, joinRoom } = useConnection();

<DevicePreview videoElementId="local-video" showDeviceSelectors />
<Button onClick={() => createRoom(roomName, userName)}>Create</Button>
<Button onClick={() => joinRoom(roomName, userName)}>Join</Button>
```

### Video Room (VideoRoom.tsx)

```tsx
import { useRoom, useConnection } from '@hiyve/client-provider';
import { VideoGrid } from '@hiyve/video-grid';
import { ControlBar } from '@hiyve/control-bar';

const { room, isOwner } = useRoom();
const { leaveRoom } = useConnection();

<VideoGrid layout={layout} localUserName={userName} />
<ControlBar onLeave={leaveRoom} showScreenShare />
```

## Hooks Reference

### Used in This Example

```tsx
// Connection - create/join/leave rooms
const { createRoom, joinRoom, leaveRoom, isConnecting } = useConnection();

// Room state - check room info and ownership
const { room, isOwner, isInRoom } = useRoom();
```

### Advanced (Not Used Here)

These hooks are available for more complex implementations:

```tsx
// Participants - access participant list
const { participants, localUserId, participantCount } = useParticipants();

// Media controls - programmatic mute control (ControlBar handles this)
const { isAudioMuted, isVideoMuted, toggleAudio, toggleVideo } = useLocalMedia();
```

## Development

```bash
# Start both frontend and backend
pnpm run dev

# Frontend only (port 5173)
pnpm run dev:client

# Server only (port 3001)
pnpm run dev:server
```

### Toggle Between Local and Registry Packages

For development with local `hiyve-sdk`:

```bash
# From the hiyve-examples root directory:
./toggle-packages.sh dev    # Use local packages
./toggle-packages.sh prod   # Use registry packages
./toggle-packages.sh status # Check current mode
```

## TypeScript Support

This example includes TypeScript type declarations for all `@hiyve/*` packages in `src/hiyve.d.ts`. These declarations provide type safety while the SDK packages are in development.

The declarations cover:
- `@hiyve/client-provider` - hooks and ClientProvider component
- `@hiyve/control-bar` - ControlBar component and LayoutMode type
- `@hiyve/device-selector` - DevicePreview component
- `@hiyve/video-grid` - VideoGrid component

## Troubleshooting

### "Server not configured" error
Create `server/.env` with valid Hiyve API credentials.

### Camera/microphone not working
Grant camera and microphone permissions in your browser settings.

### Module errors
Clear Vite cache and restart:
```bash
rm -rf node_modules/.vite
pnpm run dev
```

## Next Steps

Once you understand this basic example, check out:

- **full-example** - All features: chat, recording, transcription, file sharing, Q&A, whiteboard
- **token-room-example** - Invite links with token-based joining

## Learn More

- [Hiyve SDK Documentation](https://doawc2271w91z.cloudfront.net/docs/hiyve-sdk/latest/index.html)
- [Full Example README](../full-example/README.md)
