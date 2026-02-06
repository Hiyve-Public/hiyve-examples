# Full Example

A complete video conferencing application demonstrating all `@hiyve/*` packages.

## Quick Start

You can either run the root setup script (recommended) or set up manually:

### Option A: Root Setup Script (Recommended)

From the `hiyve-examples` root directory:

```bash
./setup.sh full-example
```

This handles authentication, dependencies, and environment setup automatically.

### Option B: Manual Setup

#### 1. Authenticate with Hiyve

The `@hiyve/*` packages require authentication. If you haven't already:

```bash
npx hiyve-cli login
```

Enter your Hiyve API key when prompted. Get one at [console.hiyve.dev](https://console.hiyve.dev).

#### 2. Install Dependencies

```bash
pnpm run setup
```

This installs both frontend and server dependencies.

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

Get credentials at [console.hiyve.dev](https://console.hiyve.dev).

#### 4. Start the App

```bash
pnpm run dev
```

This starts both the frontend (port 5173) and backend (port 3001).

Open http://localhost:5173

## Features

- Create/join video rooms
- Real-time video/audio with WebRTC
- Mute/unmute audio and video
- Screen sharing
- Recording with auto-compose
- Live streaming to external platforms (YouTube, Twitch, etc.)
- Live transcription (captions)
- Mood/sentiment analysis with visual indicators
- Engagement tracking (attentive, distracted, looking away)
- Real-time chat
- Participant list with hand raising
- Hand raise notifications and queue
- Waiting room
- File management with custom viewers
- Q&A panel (questions, upvoting, answers, auto-save)
- Live polls with voting and real-time results
- Rich text notes with auto-save and PDF export
- Device selection & preview
- Audio gain control
- Collaborative whiteboard
- Customizable overlay order for video tiles
- Live clock display in header
- Responsive layout with container breakpoints
- **AI Intelligence** (cloud-powered)
  - Bot-managed transcript context via OpenAI Responses API
  - Client-side mood analysis pushed to shared context
  - Mood/sentiment indicators displayed alongside live captions
  - Conversation history persists across sidebar tab switches (sessionStorage)
  - Ad-hoc AI queries against accumulated meeting context
  - Meeting summary generation
  - Action items extraction

## SDK Packages Used

This example uses **20 SDK packages** with **45+ components and hooks** to create a complete video conferencing application.

### Core Providers (4 packages)

| Package | Component/Hook | Description |
|---------|---------------|-------------|
| `@hiyve/client-provider` | `ClientProvider` | Root provider that manages WebRTC client state, connection, and media |
| | `useConnection` | Hook for room create/join/leave and connection status |
| | `useRoom` | Hook for room info (name, isOwner, isInRoom) |
| | `useParticipants` | Hook for participant list, local user ID, participant count |
| | `useLocalMedia` | Hook for local audio/video mute controls |
| | `useDevices` | Hook for camera/mic device selection |
| | `useRecording` | Hook for recording state, duration, start/stop controls |
| | `useStreaming` | Hook for live streaming state and controls |
| | `useTranscription` | Hook for live transcription state and enrichment |
| | `useChat` | Hook for chat messages, unread count, send/clear |
| | `useWaitingRoom` | Hook for waiting room admission state |
| | `useAudioProcessing` | Hook for audio gain/feedback control |
| | `useLayout` | Hook for dominant speaker tracking |
| `@hiyve/file-manager` | `FileCacheProvider` | Provider for file system caching and sync |
| | `FileManager` | Full-featured file browser with drag/drop, multi-select |
| | `useFileCache` | Hook for file operations (upload, delete, create folder) |
| `@hiyve/mood-analysis` | `MoodAnalysisProvider` | Provider for real-time sentiment/emotion detection |

### Video & Layout Components (2 packages)

| Package | Component | Description |
|---------|-----------|-------------|
| `@hiyve/video-grid` | `VideoGrid` | Auto-layout video grid with multiple layout modes (grid, spotlight, side-by-side) |
| `@hiyve/control-bar` | `ControlBar` | Media controls bar with mute, recording, streaming, screen share, layout selector |
| | `IntelligenceSettings` | Settings panel for AI features (transcription, mood, post-meeting summary) |
| | `DEFAULT_LAYOUTS` | Pre-defined layout configurations |

### Sidebar & Panel Components (2 packages)

| Package | Component | Description |
|---------|-----------|-------------|
| `@hiyve/sidebar` | `Sidebar` | Collapsible, resizable tabbed sidebar container |
| `@hiyve/participant-list` | `ParticipantList` | List of room participants with status indicators |

### Communication Components (2 packages)

| Package | Component/Hook | Description |
|---------|----------------|-------------|
| `@hiyve/chat` | `ChatPanel` | Real-time text chat with message history |
| `@hiyve/transcription` | `TranscriptViewer` | Live captions display with timestamps, sentiment indicators, and auto-scroll |

### Device & Audio Components (2 packages)

| Package | Component | Description |
|---------|-----------|-------------|
| `@hiyve/device-selector` | `DevicePreview` | Camera/mic preview with device selection before joining |
| `@hiyve/audio-monitor` | `GainControl` | Microphone volume slider with mute toggle |

### Recording & Streaming Components (2 packages)

| Package | Component | Description |
|---------|-----------|-------------|
| `@hiyve/recording` | `RecordingIndicator` | Recording status indicator with duration timer |
| `@hiyve/streaming` | `StreamingIndicator` | Live streaming status indicator |
| | `StreamingUrlDisplay` | Displays streaming URL with copy button |
| | `StreamingSettingsForm` | Stream mode, RTMP URL, and MP4 creation settings |

### Waiting Room Components (1 package)

| Package | Component | Description |
|---------|-----------|-------------|
| `@hiyve/waiting-room` | `WaitingRoomSetup` | Toggle to enable/disable waiting room for owners |
| | `WaitingRoomAdmittance` | Popover for owners to admit/reject waiting users |
| | `WaitingRoomGuest` | Waiting/rejected state display for guests |
| | `WaitForHostScreen` | Waiting screen when guest joins before host starts |

### Collaboration Components (4 packages)

| Package | Component/Hook | Description |
|---------|----------------|-------------|
| `@hiyve/whiteboard` | `Whiteboard` | Collaborative drawing canvas with tools |
| | `CreateWhiteboardDialog` | Dialog for creating new whiteboards |
| `@hiyve/qa` | `QAPanel` | Q&A session with questions and answers |
| | `QASessionViewer` | Read-only viewer for saved Q&A sessions |
| | `useQAListener` | Hook for real-time Q&A sync across participants |
| `@hiyve/polls` | `PollsWindow` | Live polling with vote tracking and results |
| | `PollCreator` | Dialog for creating new polls |
| | `PollsSessionViewer` | Read-only viewer for saved poll sessions |
| | `usePollListener` | Hook for detecting new active polls |
| | `usePollSync` | Hook for real-time poll state synchronization |
| `@hiyve/notes` | `NoteEditor` | Rich text note-taking with auto-save and PDF export |

### Utility Components (1 package)

| Package | Component/Hook | Description |
|---------|----------------|-------------|
| `@hiyve/utilities` | `LiveClock` | Real-time clock display |
| | `TooltipIconButton` | Icon button with tooltip wrapper |
| | `useContainerBreakpoint` | Hook for responsive container-based breakpoints |

## Architecture

```
main.tsx
└── ClientProvider              # Manages WebRTC client state
    └── FileCacheProvider       # File system caching (@hiyve/file-manager)
        └── MoodAnalysisProvider    # Sentiment detection
            └── App.tsx             # Main application shell

src/
├── App.tsx                     # Routes between views based on state
├── main.tsx                    # Provider setup
└── components/
    ├── JoinForm.tsx            # Room name, user name, create/join
    ├── ConnectingScreen.tsx    # Loading state while connecting
    ├── WaitingScreen.tsx       # Waiting room for guests
    ├── WaitForHostScreen       # From @hiyve/waiting-room - shown when host hasn't started
    ├── VideoRoom.tsx           # Main in-room view
    │   ├── VideoGrid               # Video tiles
    │   ├── ControlBar              # Media controls
    │   └── Sidebar                 # Tabbed panel
    └── Sidebar.tsx             # Participants, chat, settings, files, Q&A, AI, captions
```

### Component Responsibilities

| Component | Hooks Used | Purpose |
|-----------|------------|---------|
| `JoinForm` | `useConnection` | Room creation/join form |
| `VideoRoom` | `useRoom`, `useConnection`, `useRecording`, `useStreaming`, `useChat`, `useWaitingRoom` | Main room layout |
| `Sidebar` | `useRoom`, `useParticipants`, `useChat`, `useAudioProcessing`, `useRecording`, `useTranscription`, `useStreaming` | Tabbed sidebar |
| `WaitingScreen` | `useWaitingRoom`, `useRoom`, `useConnection` | Waiting room UI |
| `WaitForHostScreen` | `useWaitForHost`, `useConnection` | Wait for host UI (from @hiyve/waiting-room) |
| `ConnectingScreen` | (none - presentational) | Loading state |

**Note:** ParticipantList has built-in owner controls for muting and removing participants. These controls automatically appear when the current user is the room owner.

## Hooks Reference

```tsx
// Connection & Room
const { isConnecting, error, createRoom, joinRoom, leaveRoom } = useConnection();
const { room, isOwner, isInRoom } = useRoom();

// Participants
const { participants, localUserId, participantCount } = useParticipants();

// Media Controls
const { isAudioMuted, isVideoMuted, toggleAudio, toggleVideo } = useLocalMedia();
const { setVideoDevice, setAudioInputDevice, setAudioOutputDevice } = useDevices();

// Features
const { isRecording, recordingDuration, startRecording, stopRecording } = useRecording();
const { isStreaming, streamingDuration, startStreaming, stopStreaming } = useStreaming();
const { isTranscribing, transcriptions, enrichTranscription } = useTranscription();
const { messages, unreadCount, sendMessage, clearUnread } = useChat();
const { waitingUsers, admitUser, rejectUser } = useWaitingRoom();
const { isWaiting, roomName, timeout, elapsedTime } = useWaitForHost();
const { raisedHandCount, lowerAllHands } = useHandRaise();

// Audio Processing
const { feedbackDetected, setGain } = useAudioProcessing();

// File Management (from @hiyve/file-manager)
import { useFileCache } from '@hiyve/file-manager';
const { isReady, getFileTree, uploadFile } = useFileCache();

// Q&A (from @hiyve/qa)
import { useQAListener } from '@hiyve/qa';
useQAListener({ isOwner, localUserId, questions, onQuestionsChange });
```

## Component Customization

All components support customization via props:

```tsx
// Custom labels (for i18n)
<GainControl
  labels={{
    mute: 'Silenciar',
    unmute: 'Activar sonido',
    formatValue: (v) => `${v}%`,
  }}
/>

// Custom colors (theming)
<RecordingIndicator
  colors={{
    indicator: '#ff0000',
    background: 'rgba(255,0,0,0.1)',
    text: '#ff0000',
  }}
/>

// Custom styles
<RecordingIndicator
  styles={{
    fontSize: '0.875rem',
    fontWeight: 700,
    animationDuration: '1.2s',
  }}
/>

// MUI sx prop
<VideoGrid sx={{ flex: 1, background: '#1a1a1a' }} />

// Custom overlay order (controls render order of elements at same position)
import { VideoGrid, type VideoTileOverlayElement, type LocalVideoTileOverlayElement } from '@hiyve/video-grid';

const tileOverlayOrder: VideoTileOverlayElement[] = ['engagement', 'mood', 'name', 'status', 'controls'];
const localTileOverlayOrder: LocalVideoTileOverlayElement[] = ['indicator', 'timer', 'engagement', 'mood', 'name', 'status', 'controls'];

<VideoGrid
  tileOverlayOrder={tileOverlayOrder}
  localTileOverlayOrder={localTileOverlayOrder}
/>

// Custom file viewers (for specialized file types)
import { FileManager, type CustomViewerMap } from '@hiyve/file-manager';
import { QASessionViewer, type QASessionFile } from '@hiyve/qa';

const customViewers: CustomViewerMap = {
  'qa-session': (data, file, onClose) => (
    <QASessionViewer sessionData={data as QASessionFile} onClose={onClose} />
  ),
};

<FileManager customViewers={customViewers} />

// Utilities - LiveClock, TooltipIconButton, responsive breakpoints
import { LiveClock, TooltipIconButton, useContainerBreakpoint } from '@hiyve/utilities';

// LiveClock - auto-updating time display
<LiveClock variant="body2" sx={{ ml: 2, opacity: 0.7 }} />

// TooltipIconButton - combines Tooltip and IconButton
<TooltipIconButton tooltip="Copy room name" onClick={handleCopy} color="primary">
  <CopyIcon />
</TooltipIconButton>

// useContainerBreakpoint - responsive container queries
const { isBelowBreakpoint: isCompact, containerRef } = useContainerBreakpoint(800);

<Box ref={containerRef}>
  {!isCompact && <LiveClock />}  {/* Hide clock on small screens */}
</Box>
```

## Q&A Feature

The Q&A panel allows participants to ask questions during a meeting:

- **Posting questions**: Any participant can post questions
- **Upvoting**: Participants can upvote questions to prioritize them
- **Answering**: Room owner/moderator can answer questions
- **Pinning**: Owner can pin important questions to the top
- **Sorting**: Sort by newest, most votes, or unanswered
- **Auto-save**: Q&A sessions are automatically saved to room files
- **Session viewer**: View saved Q&A sessions in the file manager

```tsx
import { QAPanel, useQAListener } from '@hiyve/qa';

// Keep Q&A state synced even when tab is hidden
useQAListener({
  isOwner,
  localUserId,
  questions,
  onQuestionsChange: setQuestions,
});

<QAPanel
  initialQuestions={questions}
  onQuestionsChange={setQuestions}
  enableAutoSave={true}
  onAutoSave={(fileId) => console.log('Saved to:', fileId)}
/>
```

## Intelligence Mode

The ControlBar includes an "Intelligence Mode" that enables:
- Recording with auto-compose
- Live transcription
- Mood/sentiment analysis with indicators in captions
- AI assistant chat with session persistence
- Post-meeting AI summary

```tsx
<ControlBar
  showRecordingMenu
  intelligenceConfig={{
    transcription: true,
    moodAnalysis: true,
    postMeetingSummary: true,
  }}
  onIntelligenceConfigChange={setConfig}
/>
```

### AI Panel Behavior

The AI panel shows contextual status messages as intelligence mode progresses:

1. **Starting** — "Starting Intelligence Mode..."
2. **Initializing** — "Initializing AI Context"
3. **Waiting** — "Waiting for Transcriptions..."
4. **Ready** — AI Assistant and Captions views become available
5. **Stopped** — Returns to "Intelligence Mode Required"

When intelligence mode is stopped, the panel resets to the inactive state regardless of any previously accumulated transcripts.

### Mood in Captions

When mood analysis is active, the captions view shows colored sentiment dots next to each speaker group, indicating positive, negative, or neutral mood.

## Server API

The backend server provides:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate-room-token` | POST | Generate Hiyve room token |
| `/api/generate-cloud-token` | POST | Generate Hiyve cloud token for AI features |
| `/api/health` | GET | Health check |

## Development

### Basic Commands

```bash
# Start both frontend and backend
pnpm run dev

# Frontend only (port 5173)
pnpm run dev:client

# Server only (port 3001)
pnpm run dev:server

# Build for production
pnpm run build
```

### Toggle Between Local and Registry Packages

For development with local `hiyve-sdk`:

```bash
# From the hiyve-examples root directory:

# Switch to local packages (builds hiyve-sdk first)
./toggle-packages.sh dev

# Switch to S3 packages
./toggle-packages.sh prod

# Check current mode
./toggle-packages.sh status
```

Or use pnpm scripts within full-example:

```bash
# Check current mode
pnpm run packages:status

# Switch to dev mode (local packages)
pnpm run packages:dev

# Switch to prod mode (S3 packages)
pnpm run packages:prod
```

**Important:** Always run `./toggle-packages.sh prod` before committing to the examples repo.

## Troubleshooting

### "Server not configured" error
Create `server/.env` with valid Hiyve API credentials.

### "Cannot connect to server" error
Ensure the server is running on port 3001. Run `pnpm run dev` to start both frontend and backend.

### Camera/microphone not working
Grant camera and microphone permissions in your browser settings.

### Transcriptions not appearing
Transcriptions are only sent to the room owner. Make sure you created the room (not joined as guest).

### "prop-types" or module errors
Clear Vite cache and restart:
```bash
rm -rf node_modules/.vite
pnpm run dev
```

### Integrity checksum errors during pnpm install
Clear pnpm store and lockfile:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm store prune
pnpm install
```

## Learn More

See the JSDoc comments in source files:
- `src/main.tsx` - Provider setup documentation
- `src/App.tsx` - Overview and component usage
- `src/components/JoinForm.tsx` - Room creation/join with `useConnection`
- `src/components/VideoRoom.tsx` - Main room view with customization examples
- `src/components/Sidebar.tsx` - Tabbed sidebar with multiple hooks
- `src/components/WaitingScreen.tsx` - Waiting room with `useWaitingRoom`

## API Documentation

Full component API documentation:
https://doawc2271w91z.cloudfront.net/docs/hiyve-sdk/latest/index.html
