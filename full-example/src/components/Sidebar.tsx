/**
 * Sidebar Component
 *
 * Wraps `@hiyve/sidebar` with application-specific tab configuration.
 *
 * Tabs:
 * - Participants list
 * - Chat panel
 * - Settings (audio gain, intelligence config)
 * - File manager
 * - Whiteboard
 * - Captions (owner only)
 *
 * @example
 * ```tsx
 * import { Sidebar } from './components/Sidebar';
 *
 * function VideoRoom() {
 *   const [showSidebar, setShowSidebar] = useState(true);
 *
 *   return (
 *     <Box sx={{ display: 'flex' }}>
 *       <VideoGrid />
 *       {showSidebar && (
 *         <Sidebar
 *           userName="John"
 *           intelligenceConfig={config}
 *           onIntelligenceConfigChange={setConfig}
 *         />
 *       )}
 *     </Box>
 *   );
 * }
 * ```
 *
 * ## Hooks Used
 * - `useRoom()` - isOwner state
 * - `useParticipants()` - participantCount
 * - `useChat()` - unreadCount, clearUnread
 * - `useAudioProcessing()` - setGain
 * - `useRecording()` - isRecording (to disable settings)
 * - `useTranscription()` - isTranscribing state
 */

import { useState, useCallback, useMemo } from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import {
  People as PeopleIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  ClosedCaption as CaptionsIcon,
  Folder as FolderIcon,
  Draw as WhiteboardIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  useRoom,
  useParticipants,
  useChat,
  useAudioProcessing,
  useRecording,
  useTranscription,
} from '@hiyve/client-provider';
import { Sidebar as HiyveSidebar, type SidebarTab } from '@hiyve/sidebar';
import { ParticipantList } from '@hiyve/participant-list';
import { ChatPanel } from '@hiyve/chat';
import { GainControl, type GainControlLabels } from '@hiyve/audio-monitor';
import { TranscriptViewer } from '@hiyve/transcription';
import { FileManager } from '@hiyve/file-manager';
import { IntelligenceSettings, type IntelligenceConfig } from '@hiyve/control-bar';
import { Whiteboard, CreateWhiteboardDialog, type WhiteboardFile } from '@hiyve/whiteboard';

interface SidebarProps {
  /** Local user's display name */
  userName: string;
  /** Intelligence mode configuration */
  intelligenceConfig: IntelligenceConfig;
  /** Callback when intelligence config changes */
  onIntelligenceConfigChange: (config: IntelligenceConfig) => void;
}

export function Sidebar({
  userName,
  intelligenceConfig,
  onIntelligenceConfigChange,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState('participants');
  const [micGain, setMicGain] = useState(100);
  const [whiteboardFileId, setWhiteboardFileId] = useState<string | null>(null);
  const [whiteboardFileData, setWhiteboardFileData] = useState<WhiteboardFile | null>(null);
  const [showCreateWhiteboardDialog, setShowCreateWhiteboardDialog] = useState(false);

  // Get state from ClientProvider
  const { isOwner, room } = useRoom();
  const { participantCount } = useParticipants();
  const { unreadCount, clearUnread } = useChat();
  const { setGain } = useAudioProcessing();
  const { isRecording } = useRecording();
  const { isTranscribing } = useTranscription();

  // Handle tab change
  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      // Clear unread count when switching to chat tab
      if (tabId === 'chat') {
        clearUnread();
      }
    },
    [clearUnread]
  );

  // Handle mic gain change
  const handleGainChange = useCallback(
    (value: number) => {
      setMicGain(value);
      setGain(value);
    },
    [setGain]
  );

  // Show create whiteboard dialog
  const handleShowCreateWhiteboard = useCallback(() => {
    setShowCreateWhiteboardDialog(true);
  }, []);

  // Handle whiteboard created
  const handleWhiteboardCreated = useCallback((fileId: string, _fileName: string, fileData: WhiteboardFile) => {
    setWhiteboardFileId(fileId);
    setWhiteboardFileData(fileData);
    setShowCreateWhiteboardDialog(false);
  }, []);

  // Custom labels for GainControl (demonstrates i18n support)
  const customGainLabels = useMemo<Partial<GainControlLabels>>(
    () => ({
      mute: 'Mute microphone',
      unmute: 'Unmute microphone',
      formatValue: (value: number) => `${Math.round(value)}%`,
    }),
    []
  );

  // Define tabs configuration
  const tabs = useMemo<SidebarTab[]>(() => {
    const baseTabs: SidebarTab[] = [
      {
        id: 'participants',
        label: `(${participantCount + 1})`,
        icon: <PeopleIcon />,
        tooltip: 'Participants',
      },
      {
        id: 'chat',
        label: 'Chat',
        icon: <ChatIcon />,
        badge: unreadCount,
        badgeColor: 'error',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
      },
      {
        id: 'files',
        label: 'Files',
        icon: <FolderIcon />,
      },
      {
        id: 'whiteboard',
        label: 'Whiteboard',
        icon: <WhiteboardIcon />,
      },
    ];

    // Add captions tab for owners only
    if (isOwner) {
      baseTabs.push({
        id: 'captions',
        label: 'Captions',
        icon: <CaptionsIcon color={isTranscribing ? 'primary' : 'inherit'} />,
        tooltip: 'Captions (owner only)',
      });
    }

    return baseTabs;
  }, [participantCount, unreadCount, isOwner, isTranscribing]);

  // Render content for each tab
  const renderContent = useCallback(
    (tabId: string) => {
      switch (tabId) {
        case 'participants':
          return (
            <ParticipantList
              localUserName={userName}
              showHeader={false}
              maxHeight="100%"
              sx={{ height: '100%' }}
            />
          );

        case 'chat':
          return (
            <ChatPanel
              showHeader={false}
              maxHeight="100%"
              sx={{ height: '100%' }}
            />
          );

        case 'settings':
          return (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Audio Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* GainControl with custom labels for i18n */}
              <GainControl
                value={micGain}
                onChange={handleGainChange}
                label="Mic Volume"
                size="100%"
                labels={customGainLabels}
                sx={{ mb: 2 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 3 }}
              >
                Adjust your microphone volume. Changes apply in real-time.
                Use the settings button in the control bar to change devices.
              </Typography>

              {/* Intelligence Settings - owner only */}
              {isOwner && (
                <IntelligenceSettings
                  config={intelligenceConfig}
                  onChange={onIntelligenceConfigChange}
                  disabled={isRecording}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          );

        case 'files':
          return (
            <FileManager
              showToolbar
              showBreadcrumbs
              enableDragDrop
              enableMultiSelect
              onFileOpen={(file) => console.log('Opening file:', file.fileName)}
            />
          );

        case 'whiteboard':
          if (!whiteboardFileId) {
            return (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header with Create button */}
                <Box sx={{ p: 2, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
                  <WhiteboardIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Whiteboards
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleShowCreateWhiteboard}
                    size="small"
                  >
                    Create New
                  </Button>
                </Box>

                {/* Flat view FileManager showing only whiteboards */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <FileManager
                    filterFileTypes={['whiteboard']}
                    onFileOpen={(file) => {
                      setWhiteboardFileId(file.fileId);
                      setWhiteboardFileData(null); // Let hook fetch from server
                    }}
                    showToolbar={false}
                    showBreadcrumbs={false}
                    enableDragDrop={false}
                    enableMultiSelect={false}
                  />
                </Box>

                {/* Create dialog */}
                <CreateWhiteboardDialog
                  open={showCreateWhiteboardDialog}
                  onClose={() => setShowCreateWhiteboardDialog(false)}
                  onCreate={handleWhiteboardCreated}
                  defaultName={`${room?.name || 'Room'} Whiteboard`}
                />
              </Box>
            );
          }
          return (
            <Whiteboard
              fileId={whiteboardFileId}
              initialFileData={whiteboardFileData ?? undefined}
              showToolbar
              showZoomControls
              enableAutoSave
              onClose={() => {
                setWhiteboardFileId(null);
                setWhiteboardFileData(null);
              }}
              sx={{ height: '100%' }}
            />
          );

        case 'captions':
          return (
            <TranscriptViewer
              showTimestamps
              autoScroll
              groupingWindowMs={3000}
              emptyMessage={
                isTranscribing
                  ? 'Waiting for transcriptions...'
                  : 'Start Intelligence Mode to see live captions'
              }
              sx={{ height: '100%' }}
            />
          );

        default:
          return null;
      }
    },
    [
      userName,
      micGain,
      handleGainChange,
      customGainLabels,
      isOwner,
      intelligenceConfig,
      onIntelligenceConfigChange,
      isRecording,
      isTranscribing,
      whiteboardFileId,
      whiteboardFileData,
      showCreateWhiteboardDialog,
      handleShowCreateWhiteboard,
      handleWhiteboardCreated,
      room?.name,
    ]
  );

  return (
    <HiyveSidebar
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      renderContent={renderContent}
      collapsible
      resizable
      styles={{
        defaultWidth: 600,
        minWidth: 280,
        maxWidth: 1200,
        tabLabelsMinWidth: 480,
        tabLabelsInlineMinWidth: 800,
      }}
      sx={{
        borderLeft: 1,
        borderColor: 'divider',
      }}
    />
  );
}

export default Sidebar;
