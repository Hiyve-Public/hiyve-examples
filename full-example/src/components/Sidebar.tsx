/**
 * Sidebar Component
 *
 * Tabbed sidebar with:
 * - Participants list
 * - Chat panel
 * - Settings (audio gain, intelligence config)
 * - File manager
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
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Badge,
  Typography,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  ClosedCaption as CaptionsIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import {
  useRoom,
  useParticipants,
  useChat,
  useAudioProcessing,
  useRecording,
  useTranscription,
} from '@hiyve/client-provider';
import { ParticipantList } from '@hiyve/participant-list';
import { ChatPanel } from '@hiyve/chat';
import { GainControl, type GainControlLabels } from '@hiyve/audio-monitor';
import { TranscriptViewer } from '@hiyve/transcription';
import { FileManager } from '@hiyve/file-manager';
import { IntelligenceSettings, type IntelligenceConfig } from '@hiyve/control-bar';

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
  const [activeTab, setActiveTab] = useState(0);
  const [micGain, setMicGain] = useState(100);

  // Get state from ClientProvider
  const { isOwner } = useRoom();
  const { participantCount } = useParticipants();
  const { unreadCount, clearUnread } = useChat();
  const { setGain } = useAudioProcessing();
  const { isRecording } = useRecording();
  const { isTranscribing } = useTranscription();

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Clear unread count when switching to chat tab
    if (newValue === 1) {
      clearUnread();
    }
  };

  // Handle mic gain change
  const handleGainChange = useCallback(
    (value: number) => {
      setMicGain(value);
      setGain(value);
    },
    [setGain]
  );

  // Custom labels for GainControl (demonstrates i18n support)
  const customGainLabels = useMemo<Partial<GainControlLabels>>(
    () => ({
      mute: 'Mute microphone',
      unmute: 'Unmute microphone',
      formatValue: (value: number) => `${Math.round(value)}%`,
    }),
    []
  );

  return (
    <Paper
      elevation={2}
      sx={{
        width: '50%',
        minWidth: 320,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 1,
        borderColor: 'divider',
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          icon={<PeopleIcon />}
          label={`(${participantCount + 1})`}
          iconPosition="start"
        />
        <Tab
          icon={
            <Badge badgeContent={unreadCount} color="error">
              <ChatIcon />
            </Badge>
          }
          label="Chat"
          iconPosition="start"
        />
        <Tab icon={<SettingsIcon />} label="Settings" iconPosition="start" />
        <Tab icon={<FolderIcon />} label="Files" iconPosition="start" />
        {/* Captions tab - owner only (transcriptions are only sent to room owner) */}
        {isOwner && (
          <Tab
            icon={<CaptionsIcon color={isTranscribing ? 'primary' : 'inherit'} />}
            label="Captions"
            iconPosition="start"
          />
        )}
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Participants Tab */}
        {activeTab === 0 && (
          <ParticipantList
            localUserName={userName}
            showHeader={false}
            maxHeight="100%"
            sx={{ height: '100%' }}
          />
        )}

        {/* Chat Tab */}
        {activeTab === 1 && (
          <ChatPanel
            showHeader={false}
            maxHeight="100%"
            sx={{ height: '100%' }}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 2 && (
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
        )}

        {/* Files Tab */}
        {activeTab === 3 && (
          <FileManager
            showToolbar
            showBreadcrumbs
            enableDragDrop
            enableMultiSelect
            onFileOpen={(file) => console.log('Opening file:', file.fileName)}
          />
        )}

        {/* Captions Tab - owner only */}
        {isOwner && activeTab === 4 && (
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
        )}
      </Box>
    </Paper>
  );
}

export default Sidebar;
