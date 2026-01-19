/**
 * VideoRoom Component
 *
 * Main in-room view containing:
 * - Header with room info, recording indicator, waiting room controls
 * - Video grid with all participants
 * - Control bar for media, recording, screen share
 * - Collapsible sidebar (participants, chat, settings, files, captions)
 *
 * @example
 * ```tsx
 * import { VideoRoom } from './components/VideoRoom';
 *
 * function App() {
 *   const { isInRoom } = useRoom();
 *
 *   if (isInRoom) {
 *     return <VideoRoom userName="John" />;
 *   }
 *   return <JoinForm />;
 * }
 * ```
 *
 * ## Hooks Used
 * - `useRoom()` - room info, isOwner
 * - `useConnection()` - leaveRoom
 * - `useRecording()` - isRecording, recordingDuration
 * - `useChat()` - unreadCount
 * - `useWaitingRoom()` - waitingUsers
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Snackbar,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  MeetingRoom as WaitingRoomIcon,
  Slideshow as PresentationIcon,
} from '@mui/icons-material';
import {
  useRoom,
  useConnection,
  useRecording,
  useWaitingRoom,
} from '@hiyve/client-provider';
import {
  ControlBar,
  defaultIntelligenceConfig,
  DEFAULT_LAYOUTS,
  type LayoutMode,
  type IntelligenceConfig,
  type LayoutDefinition,
} from '@hiyve/control-bar';
import { VideoGrid, type CustomLayoutHandler, type TilePosition } from '@hiyve/video-grid';
import { WaitingRoomAdmittance } from '@hiyve/waiting-room';
import {
  RecordingIndicator,
  type RecordingIndicatorColors,
  type RecordingIndicatorStyles,
} from '@hiyve/recording';
import { Sidebar } from './Sidebar';

interface VideoRoomProps {
  /** Local user's display name */
  userName: string;
}

export function VideoRoom({ userName }: VideoRoomProps) {
  // UI state
  const [layout, setLayout] = useState<LayoutMode>('grid');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [waitingRoomAnchorEl, setWaitingRoomAnchorEl] = useState<HTMLElement | null>(null);

  // Intelligence configuration
  const [intelligenceConfig, setIntelligenceConfig] = useState<IntelligenceConfig>(
    defaultIntelligenceConfig
  );

  // Get state from ClientProvider
  const { room, isOwner } = useRoom();
  const { leaveRoom } = useConnection();
  const { isRecording, recordingDuration } = useRecording();
  const { waitingUsers } = useWaitingRoom();

  // ============================================================================
  // Customization Examples
  // These demonstrate how to customize component labels, colors, and styles.
  // ============================================================================

  // Custom layouts - demonstrates extending DEFAULT_LAYOUTS with custom layouts
  // Note: Custom layouts require a customLayoutHandler in VideoGrid
  const customLayouts = useMemo<LayoutDefinition[]>(
    () => [
      ...DEFAULT_LAYOUTS,
      {
        id: 'presentation',
        label: 'Presentation',
        icon: <PresentationIcon />,
      },
    ],
    []
  );

  // Custom layout handler for the "presentation" layout
  // This demonstrates how developers can create their own layout algorithms
  const presentationLayoutHandler = useMemo<CustomLayoutHandler>(
    () =>
      ({ availableWidth, availableHeight, participants, padding, gap, isLocalDominant, dominantSpeaker }) => {
        const positions: Record<string, TilePosition> = {};

        // Presentation layout: Large main area with small thumbnails at bottom
        const thumbnailHeight = 100;
        const thumbnailWidth = 150;
        const mainHeight = availableHeight - thumbnailHeight - gap;

        // Main presentation area (dominant speaker or local)
        const mainPosition: TilePosition = {
          left: padding,
          top: padding,
          width: availableWidth,
          height: mainHeight,
        };

        if (isLocalDominant || !dominantSpeaker) {
          // Local user is presenting
          positions['local'] = mainPosition;

          // Thumbnails for remote participants at bottom
          participants.forEach((p, index) => {
            positions[p.userId] = {
              left: padding + index * (thumbnailWidth + gap),
              top: padding + mainHeight + gap,
              width: thumbnailWidth,
              height: thumbnailHeight,
            };
          });
        } else {
          // Remote participant is presenting
          const presenter = participants.find((p) => p.userId === dominantSpeaker);
          if (presenter) {
            positions[presenter.userId] = mainPosition;
          }

          // Local user in first thumbnail slot
          positions['local'] = {
            left: padding,
            top: padding + mainHeight + gap,
            width: thumbnailWidth,
            height: thumbnailHeight,
          };

          // Other participants in remaining thumbnail slots
          let thumbnailIndex = 1;
          participants.forEach((p) => {
            if (p.userId !== dominantSpeaker) {
              positions[p.userId] = {
                left: padding + thumbnailIndex * (thumbnailWidth + gap),
                top: padding + mainHeight + gap,
                width: thumbnailWidth,
                height: thumbnailHeight,
              };
              thumbnailIndex++;
            }
          });
        }

        return positions;
      },
    []
  );

  // Custom colors for RecordingIndicator (demonstrates theming)
  const customRecordingColors = useMemo<Partial<RecordingIndicatorColors>>(
    () => ({
      background: 'rgba(255, 0, 0, 0.15)',
      indicator: '#ff1744',
      text: '#ff1744',
    }),
    []
  );

  // Custom styles for RecordingIndicator
  const customRecordingStyles = useMemo<Partial<RecordingIndicatorStyles>>(
    () => ({
      animationDuration: '1.2s',
      fontWeight: 700,
    }),
    []
  );

  // Copy room name to clipboard
  const handleCopyRoomName = useCallback(() => {
    if (room?.name) {
      navigator.clipboard.writeText(room.name);
      setSnackbarOpen(true);
    }
  }, [room]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {room?.name}
            {isOwner && (
              <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                (Owner)
              </Typography>
            )}
          </Typography>

          {/* Recording Indicator
              - Owners see the timer with duration
              - Guests see "Recording" text */}
          {isRecording && (
            <RecordingIndicator
              isRecording={isRecording}
              duration={recordingDuration}
              showDuration={isOwner}
              label={isOwner ? 'REC' : 'Recording'}
              size="small"
              colors={customRecordingColors}
              styles={customRecordingStyles}
              sx={{ mr: 2 }}
            />
          )}

          {/* Copy room name button - owner only */}
          {isOwner && (
            <Tooltip title="Copy room name to share">
              <IconButton onClick={handleCopyRoomName} color="primary">
                <CopyIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Waiting Room button - owner only */}
          {isOwner && (
            <>
              <Tooltip title="Waiting Room">
                <IconButton
                  onClick={(e) => setWaitingRoomAnchorEl(e.currentTarget)}
                  color={waitingUsers.length > 0 ? 'warning' : 'default'}
                >
                  <Badge badgeContent={waitingUsers.length} color="warning">
                    <WaitingRoomIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <WaitingRoomAdmittance
                variant="popover"
                anchorEl={waitingRoomAnchorEl}
                open={Boolean(waitingRoomAnchorEl)}
                onClose={() => setWaitingRoomAnchorEl(null)}
                autoAdmitSystemUsers={true}
                playNotificationSound={true}
              />
            </>
          )}

        </Toolbar>
      </AppBar>

      {/* Main content area */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Video area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Video Grid */}
          <VideoGrid
            localVideoElementId="local-video"
            localUserName={userName}
            layout={layout}
            customLayoutHandler={layout === 'presentation' ? presentationLayoutHandler : undefined}
            showLocalFlip
            showTimer
            showZoom
            showNames
            labelPosition="bottom-left"
            statusPosition="top-right"
            controlPosition="bottom-right"
            indicatorPosition="top-left"
            timerPosition="top-right"
            sx={{ flex: 1 }}
          />

          {/* Control Bar */}
          <ControlBar
            onLeave={leaveRoom}
            showLeaveConfirmation
            showScreenShare
            showSettings
            showLayoutSelector
            showRecordingMenu
            intelligenceConfig={intelligenceConfig}
            onIntelligenceConfigChange={setIntelligenceConfig}
            layout={layout}
            onLayoutChange={setLayout}
            layouts={customLayouts}
          />
        </Box>

        {/* Sidebar */}
        <Sidebar
          userName={userName}
          intelligenceConfig={intelligenceConfig}
          onIntelligenceConfigChange={setIntelligenceConfig}
        />
      </Box>

      {/* Snackbar for copy confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Room name copied!"
      />
    </Box>
  );
}

export default VideoRoom;
