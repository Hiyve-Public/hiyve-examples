# Full Example

A complete video conferencing application demonstrating all `@hiyve/*` packages.

## Features

- ✅ Create/join video rooms
- ✅ Real-time video/audio with WebRTC
- ✅ Mute/unmute audio and video
- ✅ Screen sharing
- ✅ Recording with auto-compose
- ✅ Live transcription (captions)
- ✅ Mood/sentiment analysis
- ✅ Real-time chat
- ✅ Participant list
- ✅ Waiting room
- ✅ File management
- ✅ Device selection & preview
- ✅ Audio gain control

## Quick Start

```bash
# 1. Install dependencies
npm run setup

# 2. Configure server credentials
cp server/.env.example server/.env
# Edit server/.env with your MuzieRTC API key and secret

# 3. Start dev server (frontend + backend)
npm run dev
```

Open http://localhost:5173

## Packages Used

| Package | Components | Purpose |
|---------|------------|---------|
| `@hiyve/client-provider` | ClientProvider, hooks | State management |
| `@hiyve/video-grid` | VideoGrid | Video tile layout |
| `@hiyve/control-bar` | ControlBar | Media controls |
| `@hiyve/chat` | ChatPanel | Text chat |
| `@hiyve/participant-list` | ParticipantList | User list |
| `@hiyve/transcription` | TranscriptViewer | Live captions |
| `@hiyve/recording` | RecordingIndicator | Recording UI |
| `@hiyve/device-selector` | DevicePreview | Camera/mic selection |
| `@hiyve/audio-monitor` | GainControl | Mic volume control |
| `@hiyve/waiting-room` | WaitingRoomSetup, WaitingRoomGuest | Waiting room UI |
| `@hiyve/file-manager` | FileManager | File management |
| `@hiyve/mood-analysis` | MoodAnalysisProvider | Sentiment detection |

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
    └── Sidebar.tsx             # Participants, chat, settings, files, captions
```

### Component Responsibilities

| Component | Hooks Used | Purpose |
|-----------|------------|---------|
| `JoinForm` | `useConnection` | Room creation/join form |
| `VideoRoom` | `useRoom`, `useConnection`, `useRecording`, `useChat`, `useWaitingRoom` | Main room layout |
| `Sidebar` | `useRoom`, `useParticipants`, `useChat`, `useAudioProcessing`, `useRecording`, `useTranscription` | Tabbed sidebar |
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

// Audio Processing
const { feedbackDetected, setGain } = useAudioProcessing();

// File Management (from @hiyve/file-manager)
import { useFileCache } from '@hiyve/file-manager';
const { isReady, getFileTree, uploadFile } = useFileCache();
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

## Server Setup

Create `server/.env`:

```env
APIKEY=your-muzie-api-key
CLIENT_SECRET=your-muzie-secret
SERVER_REGION=us-west-2
```

The server provides:
- `POST /api/generate-room-token` - Generate room token
- `GET /api/health` - Health check

## Troubleshooting

### "Server not configured" error
Create `server/.env` with valid API credentials.

### "Cannot connect to server" error
Ensure server is running on port 3001. Run `npm run dev` from this directory.

### Camera/microphone not working
Grant camera and microphone permissions in browser settings.

### Transcriptions not appearing
Transcriptions are only sent to the room owner. Make sure you created the room (not joined).

## Development

```bash
# Frontend only
npm run dev:client

# Server only
npm run dev:server

# Build for production
npm run build
```

## Learn More

See the JSDoc comments in:
- `src/main.tsx` - Provider setup documentation
- `src/App.tsx` - Overview and component usage documentation
- `src/components/JoinForm.tsx` - Room creation/join with `useConnection`
- `src/components/VideoRoom.tsx` - Main room view with customization examples
- `src/components/Sidebar.tsx` - Tabbed sidebar with multiple hooks
- `src/components/WaitingScreen.tsx` - Waiting room with `useWaitingRoom`

Each component file documents:
- What hooks it uses
- Props it accepts
- Example usage
