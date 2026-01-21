# Full Example

A complete video conferencing application demonstrating all `@hiyve/*` packages.

## Quick Start

### 1. Install Dependencies

```bash
npm run setup
```

This installs both frontend and server dependencies.

### 2. Configure Server Credentials

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your MuzieRTC credentials:

```env
APIKEY=your-muzie-api-key
CLIENT_SECRET=your-muzie-secret
SERVER_REGION=us-west-2
```

Contact MuzieRTC for API credentials if you don't have them.

### 3. Start the App

```bash
npm run dev
```

This starts both the frontend (port 5173) and backend (port 3001).

Open http://localhost:5173

## Features

- Create/join video rooms
- Real-time video/audio with WebRTC
- Mute/unmute audio and video
- Screen sharing
- Recording with auto-compose
- Live transcription (captions)
- Mood/sentiment analysis with visual indicators
- Engagement tracking (attentive, distracted, looking away)
- Real-time chat
- Participant list with hand raising
- Hand raise notifications and queue
- Waiting room
- File management with custom viewers
- Q&A panel (questions, upvoting, answers, auto-save)
- Device selection & preview
- Audio gain control
- Collaborative whiteboard
- Customizable overlay order for video tiles

## Packages Used

| Package | Components | Purpose |
|---------|------------|---------|
| `@hiyve/client-provider` | ClientProvider, hooks | State management |
| `@hiyve/video-grid` | VideoGrid | Video tile layout |
| `@hiyve/video-tile` | VideoTile, LocalVideoTile | Individual tiles |
| `@hiyve/control-bar` | ControlBar | Media controls |
| `@hiyve/chat` | ChatPanel | Text chat |
| `@hiyve/participant-list` | ParticipantList | User list |
| `@hiyve/transcription` | TranscriptViewer | Live captions |
| `@hiyve/recording` | RecordingIndicator | Recording UI |
| `@hiyve/device-selector` | DevicePreview | Camera/mic selection |
| `@hiyve/audio-monitor` | GainControl | Mic volume control |
| `@hiyve/waiting-room` | WaitingRoomSetup, WaitingRoomGuest | Waiting room UI |
| `@hiyve/file-manager` | FileManager, FileCacheProvider | File management |
| `@hiyve/mood-analysis` | MoodAnalysisProvider | Sentiment detection |
| `@hiyve/sidebar` | Sidebar | Tabbed sidebar container |
| `@hiyve/whiteboard` | Whiteboard, CreateWhiteboardDialog | Collaborative drawing |
| `@hiyve/qa` | QAPanel, QASessionViewer, useQAListener | Questions & answers |

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
    ├── VideoRoom.tsx           # Main in-room view
    │   ├── VideoGrid               # Video tiles
    │   ├── ControlBar              # Media controls
    │   └── Sidebar                 # Tabbed panel
    └── Sidebar.tsx             # Participants, chat, settings, files, Q&A, captions
```

### Component Responsibilities

| Component | Hooks Used | Purpose |
|-----------|------------|---------|
| `JoinForm` | `useConnection` | Room creation/join form |
| `VideoRoom` | `useRoom`, `useConnection`, `useRecording`, `useChat`, `useWaitingRoom` | Main room layout |
| `Sidebar` | `useRoom`, `useParticipants`, `useChat`, `useAudioProcessing`, `useRecording`, `useTranscription`, `useQAListener` | Tabbed sidebar |
| `WaitingScreen` | `useWaitingRoom`, `useRoom`, `useConnection` | Waiting room UI |
| `ConnectingScreen` | (none - presentational) | Loading state |

## Hooks Reference

```tsx
// Connection & Room
const { isConnecting, error, createRoom, joinRoom, leaveRoom } = useConnection();
const { room, isOwner, isInRoom } = useRoom();

// Participants
const { participants, localUserId, participantCount } = useParticipants();
const participant = useParticipant(userId);

// Media Controls
const { isAudioMuted, isVideoMuted, toggleAudio, toggleVideo } = useLocalMedia();
const { setVideoDevice, setAudioInputDevice, setAudioOutputDevice } = useDevices();

// Features
const { isRecording, recordingDuration, startRecording, stopRecording } = useRecording();
const { isTranscribing, transcriptions, enrichTranscription } = useTranscription();
const { messages, unreadCount, sendMessage, clearUnread } = useChat();
const { waitingUsers, admitUser, rejectUser } = useWaitingRoom();
const { isHandRaised, raiseHand, lowerHand, toggleHandRaise, raisedHands } = useHandRaise();

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
- Mood/sentiment analysis
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

## Server API

The backend server provides:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate-room-token` | POST | Generate MuzieRTC room token |
| `/api/health` | GET | Health check |

## Development

### Basic Commands

```bash
# Start both frontend and backend
npm run dev

# Frontend only (port 5173)
npm run dev:client

# Server only (port 3001)
npm run dev:server

# Build for production
npm run build
```

### Toggle Between Local and S3 Packages

For development with local `hiyve-components`:

```bash
# From the hiyve-examples root directory:

# Switch to local packages (builds hiyve-components first)
./toggle-packages.sh dev

# Switch to S3 packages
./toggle-packages.sh prod

# Check current mode
./toggle-packages.sh status
```

Or use npm scripts within full-example:

```bash
# Check current mode
npm run packages:status

# Switch to dev mode (local packages)
npm run packages:dev

# Switch to prod mode (S3 packages)
npm run packages:prod
```

**Important:** Always run `./toggle-packages.sh prod` before committing to the examples repo.

## Troubleshooting

### "Server not configured" error
Create `server/.env` with valid MuzieRTC API credentials.

### "Cannot connect to server" error
Ensure the server is running on port 3001. Run `npm run dev` to start both frontend and backend.

### Camera/microphone not working
Grant camera and microphone permissions in your browser settings.

### Transcriptions not appearing
Transcriptions are only sent to the room owner. Make sure you created the room (not joined as guest).

### "prop-types" or module errors
Clear Vite cache and restart:
```bash
rm -rf node_modules/.vite
npm run dev
```

### Integrity checksum errors during npm install
Clear npm cache and package-lock.json:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
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
https://doawc2271w91z.cloudfront.net/docs/hiyve-components/latest/index.html
