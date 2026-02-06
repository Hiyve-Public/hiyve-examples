/**
 * AIPanel Component - AI-powered meeting intelligence using Hiyve Cloud.
 *
 * Provides an AI Assistant view and a Captions view with live transcription.
 */

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Chat as ChatIcon,
  ClosedCaption as CaptionsIcon,
} from '@mui/icons-material';
import {
  AIAssistant,
  useIntelligenceReadiness,
  IntelligenceReadinessStatus,
} from '@hiyve/ai-assistant';
import { useLiveContext, useMoodCloudSync } from '@hiyve/cloud-provider';
import { useTranscription, useRecording } from '@hiyve/client-provider';
import { useMoodAnalysisSafe } from '@hiyve/mood-analysis';
import { TranscriptViewer } from '@hiyve/transcription';

interface AIPanelProps {
  /** User ID (cleaned email) for API validation */
  userId: string;
  /** Room name for live context */
  roomName: string;
  /** Callback when the AI chat note is saved with the file ID */
  onNoteSaved?: (fileId: string) => void;
}

type ViewMode = 'assistant' | 'captions';

export function AIPanel({ userId, roomName, onNoteSaved }: AIPanelProps) {
  // View mode toggle
  const [viewMode, setViewMode] = useState<ViewMode>('assistant');

  // Track chat note file ID so we update the same file across saves
  // Using state (not ref) so component re-renders and AIAssistant sees updated fileId
  const [chatNoteFileId, setChatNoteFileId] = useState<string | undefined>(undefined);
  const handleNoteSaved = useCallback((fileId: string) => {
    setChatNoteFileId(fileId);
    onNoteSaved?.(fileId);
  }, [onNoteSaved]);

  // Get transcriptions from client provider for display
  const { transcriptions, isTranscribing, enrichTranscription } = useTranscription();

  // Get recording state for responseId (bot-created AI context)
  const { responseId, isRecording, isRecordingStarting } = useRecording();

  // Derive intelligence readiness state
  const hasTranscripts = Array.isArray(transcriptions) && transcriptions.length > 0;
  const readiness = useIntelligenceReadiness({
    responseId,
    isRecordingStarting,
    isIntelligenceActive: isRecording || isTranscribing,
    hasTranscriptions: hasTranscripts,
  });

  // Live context hook - bot manages context, we just query against it
  const {
    error: liveError,
    askWithResponseId,
    clearError: clearLiveError,
  } = useLiveContext(roomName, userId);

  // Mood analysis hook - client runs mood analysis on video streams
  const moodAnalysis = useMoodAnalysisSafe();

  // AI context is ready when we have a responseId from the bot
  const isAIContextReady = !!responseId;

  // Sync mood analysis data to cloud AI context
  useMoodCloudSync({
    roomName,
    userId,
    responseId,
    moodStates: moodAnalysis?.moodStates ?? null,
    moodEnabled: !!moodAnalysis?.enabled && !!moodAnalysis?.ready,
    transcriptionCount: transcriptions?.length ?? 0,
    enrichTranscription,
  });

  // Create onSend handler for AIAssistant
  // Uses askWithResponseId to query against the bot's accumulated transcript context
  const handleAIQuery = useCallback(async (message: string): Promise<string> => {
    if (!responseId) {
      throw new Error('No AI context available. Waiting for Intelligence Mode to initialize.');
    }
    const result = await askWithResponseId(responseId, message);
    if (!result?.success) {
      throw new Error(result?.content || 'Query failed');
    }
    return result.content;
  }, [responseId, askWithResponseId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon color="primary" />
          AI Intelligence
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          AI-powered meeting intelligence using Hiyve Cloud
        </Typography>

        {/* View Mode Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
          fullWidth
        >
          <ToggleButton value="assistant">
            <ChatIcon sx={{ mr: 1 }} fontSize="small" />
            Assistant
          </ToggleButton>
          <ToggleButton value="captions">
            <CaptionsIcon sx={{ mr: 1 }} fontSize="small" />
            Captions
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {liveError && (
        <Alert
          severity="error"
          onClose={clearLiveError}
          sx={{ mx: 2, mb: 1 }}
        >
          {liveError.message}
        </Alert>
      )}

      {/* Assistant View - AIAssistant always mounted to preserve note file ID */}
      {viewMode === 'assistant' && (
        <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <AIAssistant
            roomId={roomName}
            userId={userId}
            liveContextActive={isAIContextReady}
            hasTranscriptions={hasTranscripts}
            onSend={handleAIQuery}
            showHeader={false}
            showQuickActions
            quickActionsPosition="above-input"
            quickActions={[
              { id: 'summary', label: '📝 Summarize', query: 'Summarize what has been discussed so far', description: 'Get a summary of the meeting' },
              { id: 'actions', label: '✅ Action Items', query: 'What action items have been mentioned?', description: 'Extract action items' },
              { id: 'decisions', label: '🎯 Decisions', query: 'What decisions have been made?', description: 'List key decisions' },
            ]}
            suggestions={[
              'What topics have been discussed?',
              'Who has been most active?',
              'Are there any follow-up items?',
            ]}
            systemPrompt="You are a helpful meeting assistant. Use the meeting context to provide accurate and relevant responses."
            saveAsNote={{
              fileId: chatNoteFileId,
              onNoteSaved: handleNoteSaved,
            }}
            colors={{
              background: 'transparent',
            }}
            sx={{ height: '100%' }}
          />
          {/* Overlay readiness status when not ready */}
          {!readiness.isReady && (
            <Box sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'background.paper',
              zIndex: 1,
            }}>
              <IntelligenceReadinessStatus
                readiness={readiness}
                icon={<AIIcon sx={{ fontSize: 48, color: 'text.disabled' }} />}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Captions View - Live transcription viewer */}
      {viewMode === 'captions' && (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {hasTranscripts ? (
            <TranscriptViewer
              showTimestamps
              showSentiment
              autoScroll
              groupingWindowMs={3000}
              sx={{ height: '100%' }}
            />
          ) : (
            <IntelligenceReadinessStatus
              readiness={readiness}
              icon={<CaptionsIcon sx={{ fontSize: 48, color: 'text.disabled' }} />}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
