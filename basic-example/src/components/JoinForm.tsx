/**
 * @fileoverview JoinForm Component - Room Entry Interface
 * @module basic-example/components/JoinForm
 *
 * A simple form for creating or joining video rooms. Includes:
 *
 * - **Device Preview** - Camera/mic preview with device selection
 * - **Room Name Input** - Name of the room to create or join
 * - **User Name Input** - Display name for the participant
 * - **Create/Join Buttons** - Create a new room or join existing
 *
 * ## Component Dependencies
 *
 * - `@hiyve/client-provider` - useConnection hook for room actions
 * - `@hiyve/device-selector` - DevicePreview component
 *
 * ## Create vs Join
 *
 * - **Create Room**: Makes you the room owner with additional privileges
 * - **Join Room**: Joins as a participant (room must already exist)
 *
 * @see {@link VideoRoom} - Component shown after joining
 */

import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
} from '@mui/material';
import { useConnection } from '@hiyve/client-provider';
import { DevicePreview } from '@hiyve/device-selector';

/**
 * Props for the JoinForm component.
 */
interface JoinFormProps {
  /**
   * Callback when user name changes (called on create/join).
   * Used to pass the user name to VideoRoom for display.
   *
   * @param name - The user's display name
   */
  onUserNameChange: (name: string) => void;
}

/**
 * Room entry form with device preview.
 *
 * Allows users to preview their camera/microphone and select devices
 * before joining a room. Supports both creating new rooms and joining
 * existing ones.
 *
 * @param props - Component props
 * @param props.onUserNameChange - Callback when user submits their name
 *
 * @example
 * ```tsx
 * function App() {
 *   const [userName, setUserName] = useState('');
 *   const { isInRoom } = useRoom();
 *
 *   if (isInRoom) {
 *     return <VideoRoom userName={userName} />;
 *   }
 *
 *   return <JoinForm onUserNameChange={setUserName} />;
 * }
 * ```
 */
export function JoinForm({ onUserNameChange }: JoinFormProps) {
  // Form state
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * useConnection provides room management functions:
   * - createRoom(roomName, userName) - Create and join a new room as owner
   * - joinRoom(roomName, userName) - Join an existing room as participant
   */
  const { createRoom, joinRoom } = useConnection();

  /**
   * Handle room creation.
   * Creates a new room with the current user as owner.
   */
  const handleCreate = useCallback(async () => {
    if (!roomName.trim() || !userName.trim()) {
      setError('Please enter both room name and your name');
      return;
    }
    setError(null);
    setIsLoading(true);
    onUserNameChange(userName);
    try {
      await createRoom(roomName.trim(), userName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  }, [roomName, userName, createRoom, onUserNameChange]);

  /**
   * Handle room join.
   * Joins an existing room as a participant.
   */
  const handleJoin = useCallback(async () => {
    if (!roomName.trim() || !userName.trim()) {
      setError('Please enter both room name and your name');
      return;
    }
    setError(null);
    setIsLoading(true);
    onUserNameChange(userName);
    try {
      await joinRoom(roomName.trim(), userName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  }, [roomName, userName, joinRoom, onUserNameChange]);

  /**
   * Handle Enter key to join room.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleJoin();
      }
    },
    [handleJoin]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          Hiyve Video
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Create or join a video room
        </Typography>

        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/*
          DevicePreview from @hiyve/device-selector
          - Shows camera preview
          - Allows device selection (camera, microphone, speaker)
          - Mute buttons for camera/mic
          - Uses same videoElementId as VideoGrid for seamless transition
        */}
        <Box sx={{ mb: 3 }}>
          <DevicePreview
            videoElementId="local-video"
            showDeviceSelectors
            showMuteButtons
            aspectRatio="16/9"
          />
        </Box>

        <Stack spacing={2}>
          <TextField
            label="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            autoFocus
            placeholder="Enter room name"
          />

          <TextField
            label="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            placeholder="Enter your name"
          />

          <Stack direction="row" spacing={2}>
            {/* Create Room - becomes room owner */}
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={isLoading}
              fullWidth
              size="large"
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </Button>
            {/* Join Room - joins as participant */}
            <Button
              variant="outlined"
              onClick={handleJoin}
              disabled={isLoading}
              fullWidth
              size="large"
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
