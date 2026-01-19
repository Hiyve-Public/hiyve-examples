/**
 * @hiyve/components Example Application
 *
 * A complete video conferencing application demonstrating all hiyve-components.
 * Use this as a reference for building your own video conferencing UI.
 *
 * ## Quick Start
 *
 * 1. Wrap your app with `ClientProvider` (see main.tsx)
 * 2. Use hooks to access state: `useRoom()`, `useParticipants()`, etc.
 * 3. Use Connected components for automatic state binding
 *
 * ## Architecture
 *
 * ```
 * ClientProvider (main.tsx)
 *   └── App
 *       ├── JoinForm              - Room name, user name, create/join
 *       ├── ConnectingScreen      - Loading state while connecting
 *       ├── WaitingScreen         - Waiting room for guests
 *       └── VideoRoom             - Main in-room view
 *           ├── VideoGrid               - Video tiles for all participants
 *           ├── ControlBar              - Media controls, recording, screen share
 *           └── Sidebar                 - Tabbed panel
 *               ├── ParticipantList
 *               ├── ChatPanel
 *               ├── Settings (GainControl, IntelligenceSettings)
 *               ├── FileManager
 *               └── TranscriptViewer (owner only)
 * ```
 *
 * ## Available Packages
 *
 * | Package | Components | Purpose |
 * |---------|------------|---------|
 * | @hiyve/client-provider | ClientProvider, hooks | State management |
 * | @hiyve/video-grid | VideoGrid | Video tile layout |
 * | @hiyve/video-tile | VideoTile, LocalVideoTile | Individual video display |
 * | @hiyve/control-bar | ControlBar | Media controls |
 * | @hiyve/chat | ChatPanel | Text chat |
 * | @hiyve/participant-list | ParticipantList | User list |
 * | @hiyve/transcription | TranscriptViewer, TranscriptionControls | Live captions |
 * | @hiyve/recording | RecordingIndicator, RecordingControls | Recording UI |
 * | @hiyve/device-selector | DeviceSelector, DevicePreview | Camera/mic selection |
 * | @hiyve/audio-monitor | AudioLevelMonitor, GainControl | Audio visualization |
 * | @hiyve/waiting-room | WaitingRoomSetup, WaitingRoomAdmittance, WaitingRoomGuest | Waiting room UI |
 * | @hiyve/file-manager | FileManager | File management |
 * | @hiyve/mood-analysis | MoodAnalysisProvider | Sentiment detection |
 *
 * ## Hooks Reference
 *
 * ```tsx
 * // Connection & Room
 * const { isConnecting, error, createRoom, joinRoom, leaveRoom } = useConnection();
 * const { room, isOwner, isInRoom } = useRoom();
 *
 * // Participants
 * const { participants, localUserId, participantCount } = useParticipants();
 * const participant = useParticipant(userId);
 *
 * // Media Controls
 * const { isAudioMuted, isVideoMuted, toggleAudio, toggleVideo } = useLocalMedia();
 * const { setVideoDevice, setAudioInputDevice, setAudioOutputDevice } = useDevices();
 *
 * // Features
 * const { isRecording, recordingDuration, startRecording, stopRecording } = useRecording();
 * const { isStreaming, startStreaming, stopStreaming } = useStreaming();
 * const { isTranscribing, transcriptions, startTranscription, stopTranscription, enrichTranscription } = useTranscription();
 * const { messages, unreadCount, sendMessage, clearUnread } = useChat();
 * const { waitingUsers, isWaitingForAdmission, admitUser, rejectUser } = useWaitingRoom();
 *
 * // Audio Processing
 * const { feedbackDetected, setGain } = useAudioProcessing();
 *
 * // File Management (from @hiyve/file-manager)
 * import { useFileCache } from '@hiyve/file-manager';
 * const { isReady, getFileTree, uploadFile, deleteFile, createFolder } = useFileCache();
 * ```
 *
 * ## Component Customization
 *
 * All components support customization via props:
 * - `labels` - Text strings for i18n
 * - `colors` - Color theming
 * - `styles` - Size, spacing, fonts
 * - `icons` - Custom icons
 * - `sx` - MUI sx prop for additional styling
 *
 * Example:
 * ```tsx
 * <RecordingIndicator
 *   isRecording={true}
 *   duration={120}
 *   labels={{ recording: 'LIVE', stopped: 'OFF' }}
 *   colors={{ indicator: '#ff0000', background: 'rgba(255,0,0,0.1)' }}
 *   styles={{ fontSize: '0.875rem', fontWeight: 700 }}
 * />
 * ```
 *
 * ## Context-Aware Components
 *
 * All components are **context-aware** - they automatically integrate with
 * ClientProvider when used inside it:
 *
 * ```tsx
 * // Inside ClientProvider - auto-connected
 * import { VideoGrid } from '@hiyve/video-grid';
 * <VideoGrid layout="grid" />  // participants auto-populated from context
 * ```
 *
 * **Outside ClientProvider** (manual props):
 *
 * ```tsx
 * import { VideoGrid } from '@hiyve/video-grid';
 * <VideoGrid participants={myParticipants} localUserId={myUserId} layout="grid" />
 * ```
 *
 * ## Intelligence Mode (Recording + Transcription + Mood)
 *
 * The ControlBar's recording menu includes "Intelligence Mode" which enables:
 * - Recording with auto-compose
 * - Live transcription
 * - Mood/sentiment analysis
 * - Post-meeting AI summary
 *
 * Configure defaults via `intelligenceConfig` prop:
 * ```tsx
 * <ControlBar
 *   showRecordingMenu
 *   intelligenceConfig={{
 *     transcription: true,
 *     moodAnalysis: true,
 *     postMeetingSummary: true,
 *   }}
 *   onIntelligenceConfigChange={setConfig}
 * />
 * ```
 *
 * ## Mood Analysis + Transcription Integration
 *
 * To display sentiment indicators in transcriptions:
 *
 * ```tsx
 * import { useTranscription } from '@hiyve/client-provider';
 * import { MoodAnalysisProvider } from '@hiyve/mood-analysis';
 *
 * function App() {
 *   const { enrichTranscription } = useTranscription();
 *
 *   // Called when mood is detected for a user
 *   const handleMoodChange = (userId, moodState) => {
 *     const sentiment = moodState.emotion === 'happy' ? 'positive'
 *       : ['sad', 'angry'].includes(moodState.emotion) ? 'negative'
 *       : 'neutral';
 *
 *     enrichTranscription(userId, {
 *       sentiment,
 *       emotion: moodState.emotion,
 *       engagement: moodState.engagement,
 *     });
 *   };
 *
 *   return (
 *     <MoodAnalysisProvider onMoodChange={handleMoodChange}>
 *       <ConnectedTranscriptViewer showSentiment />
 *     </MoodAnalysisProvider>
 *   );
 * }
 * ```
 *
 * ## File Management
 *
 * File management is provided by `@hiyve/file-manager`. Wrap your app with
 * `FileCacheProvider` (inside ClientProvider) to enable file caching:
 *
 * ```tsx
 * // main.tsx - Provider setup
 * import { FileCacheProvider } from '@hiyve/file-manager';
 *
 * <ClientProvider generateRoomToken={getToken}>
 *   <FileCacheProvider>
 *     <App />
 *   </FileCacheProvider>
 * </ClientProvider>
 *
 * // App.tsx - FileManager component (auto-binds to FileCacheProvider)
 * import { FileManager } from '@hiyve/file-manager';
 *
 * <FileManager
 *   showToolbar
 *   showBreadcrumbs
 *   enableDragDrop
 *   onFileOpen={(file) => console.log('Opening:', file.fileName)}
 * />
 *
 * // Or use the hook for custom UI
 * import { useFileCache } from '@hiyve/file-manager';
 *
 * function MyFileUI() {
 *   const { isReady, getFileTree, uploadFile, deleteFile } = useFileCache();
 *   // Build custom file management UI
 * }
 * ```
 *
 * ## Waiting Room
 *
 * Enable waiting room when creating a room:
 *
 * ```tsx
 * // Owner creates room with waiting room
 * await createRoom(roomName, userName, { requireWaitingRoom: true });
 *
 * // Owner manages waiting users
 * <ConnectedWaitingRoomAdmittance
 *   variant="popover"
 *   anchorEl={anchorEl}
 *   open={Boolean(anchorEl)}
 *   onClose={() => setAnchorEl(null)}
 * />
 *
 * // Guest sees waiting screen
 * const { isWaitingForAdmission, wasRejected } = useWaitingRoom();
 * if (isWaitingForAdmission) {
 *   return <WaitingRoomGuest status="waiting" onCancel={leaveRoom} />;
 * }
 * ```
 *
 * ## Room Flows
 *
 * **Owner flow:**
 * 1. Call `createRoom(roomName, userName, options)`
 * 2. Share room name with guests
 * 3. Manage participants, recording, etc.
 *
 * **Guest flow:**
 * 1. Call `joinRoom(roomName, userName)`
 * 2. If waiting room enabled, wait for admission
 * 3. Participate in the meeting
 *
 * ## Component Structure
 *
 * This example app is organized into focused components:
 *
 * - **JoinForm** - Room creation/join form with device preview
 * - **VideoRoom** - Main in-room view with video grid and controls
 * - **Sidebar** - Tabbed panel for participants, chat, settings, files
 * - **WaitingScreen** - Waiting room display for guests
 * - **ConnectingScreen** - Loading state while connecting
 *
 * See each component file for detailed documentation and hook usage.
 */

import { useState, useEffect } from 'react';
import { useConnection, useRoom, useWaitingRoom } from '@hiyve/client-provider';
import {
  JoinForm,
  VideoRoom,
  WaitingScreen,
  ConnectingScreen,
} from './components';

// localStorage key for user role (needed for connecting screen message)
const USER_ROLE_KEY = 'hiyve-example-userRole';

/**
 * App Component
 *
 * Main application shell that routes between views based on connection state.
 * This is intentionally simple - all the complexity lives in the child components.
 *
 * ## State Flow
 *
 * ```
 * Not Connected → JoinForm
 * Connecting    → ConnectingScreen
 * Waiting       → WaitingScreen
 * Rejected      → WaitingScreen (rejected state)
 * In Room       → VideoRoom
 * ```
 */
function App() {
  // Track user role for the connecting screen message
  const [userRole, setUserRole] = useState<'owner' | 'guest'>(() =>
    (localStorage.getItem(USER_ROLE_KEY) as 'owner' | 'guest') || 'owner'
  );

  // Get connection state from ClientProvider
  const { isConnecting } = useConnection();
  const { isInRoom } = useRoom();
  const { isWaitingForAdmission, wasRejected } = useWaitingRoom();

  // Track user name from localStorage for VideoRoom
  const [userName, setUserName] = useState(() =>
    localStorage.getItem('hiyve-example-userName') || ''
  );

  // Keep userName in sync with localStorage
  useEffect(() => {
    const handleStorage = () => {
      setUserName(localStorage.getItem('hiyve-example-userName') || '');
      setUserRole((localStorage.getItem(USER_ROLE_KEY) as 'owner' | 'guest') || 'owner');
    };

    // Listen for storage changes (from JoinForm)
    window.addEventListener('storage', handleStorage);

    // Also check on mount and periodically
    const interval = setInterval(handleStorage, 500);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Waiting room states (guest waiting or rejected)
  if (isWaitingForAdmission || wasRejected) {
    return <WaitingScreen />;
  }

  // Connecting state
  if (isConnecting) {
    return <ConnectingScreen isCreating={userRole === 'owner'} />;
  }

  // In room - show the main video room
  if (isInRoom) {
    return <VideoRoom userName={userName} />;
  }

  // Not in room - show join form
  return <JoinForm />;
}

export default App;
