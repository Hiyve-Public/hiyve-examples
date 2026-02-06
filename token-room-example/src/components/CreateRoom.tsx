/**
 * CreateRoom Component
 *
 * Owner flow: Create a room and get an invite link to share.
 *
 * ## Flow
 * 1. Enter room name and display name
 * 2. Click "Create Room"
 * 3. Room is created, owner joins automatically
 * 4. InviteLinkDisplay shows the shareable link
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  Container,
} from '@mui/material';
import { VideoCall as VideoCallIcon } from '@mui/icons-material';
import { useConnection } from '@hiyve/client-provider';

interface CreateRoomProps {
  onUserNameChange?: (name: string) => void;
}

const STORAGE_KEYS = {
  userName: 'hiyve-token-example-userName',
  roomName: 'hiyve-token-example-roomName',
} as const;

export function CreateRoom({ onUserNameChange }: CreateRoomProps) {
  const [roomName, setRoomName] = useState(
    () => localStorage.getItem(STORAGE_KEYS.roomName) || ''
  );
  const [userName, setUserName] = useState(
    () => localStorage.getItem(STORAGE_KEYS.userName) || ''
  );

  const [isLoading, setIsLoading] = useState(false);

  const { createRoom } = useConnection();

  // Persist form values
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.userName, userName);
    onUserNameChange?.(userName);
  }, [userName, onUserNameChange]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.roomName, roomName);
  }, [roomName]);

  const handleCreateRoom = useCallback(async () => {
    if (!roomName.trim() || !userName.trim()) return;
    setIsLoading(true);
    try {
      await createRoom(roomName.trim(), userName.trim());
    } catch (err) {
      console.error('Create room failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [roomName, userName, createRoom]);

  const isFormValid = userName.trim().length >= 3 && roomName.trim().length > 0;

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create a Room
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Create a room and share the invite link with others
        </Typography>

        <TextField
          fullWidth
          label="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          margin="normal"
          helperText="At least 3 characters"
        />

        <TextField
          fullWidth
          label="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          margin="normal"
          helperText="Name for your room (e.g., team-standup)"
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<VideoCallIcon />}
          onClick={handleCreateRoom}
          disabled={!isFormValid || isLoading}
          sx={{ mt: 3 }}
        >
          {isLoading ? 'Creating...' : 'Create Room'}
        </Button>
      </Paper>
    </Container>
  );
}
