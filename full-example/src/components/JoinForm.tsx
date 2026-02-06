/**
 * JoinForm Component - Room creation/join form with device preview.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Container,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { TooltipIconButton } from '@hiyve/utilities';
import {
  VideoCall as VideoCallIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useConnection } from '@hiyve/client-provider';
import { DevicePreview, type SelectedDevices } from '@hiyve/device-selector';
import { WaitingRoomSetup } from '@hiyve/waiting-room';
import { STORAGE_KEYS } from '../constants';

type UserRole = 'owner' | 'guest';

export function JoinForm() {
  // Form state - load from localStorage for convenience
  const [roomNameInput, setRoomNameInput] = useState(
    () => localStorage.getItem(STORAGE_KEYS.roomName) || ''
  );
  const [userName, setUserName] = useState(
    () => localStorage.getItem(STORAGE_KEYS.userName) || ''
  );
  const [userRole, setUserRole] = useState<UserRole>(
    () => (localStorage.getItem(STORAGE_KEYS.userRole) as UserRole) || 'owner'
  );
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(
    () => localStorage.getItem(STORAGE_KEYS.enableWaitingRoom) === 'true'
  );

  // Device preview state
  const [showDevicePreview, setShowDevicePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<SelectedDevices>({});

  // Get connection actions from ClientProvider
  const { createRoom, joinRoom } = useConnection();

  // Persist form values to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.userName, userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.roomName, roomNameInput);
  }, [roomNameInput]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.userRole, userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.enableWaitingRoom, String(enableWaitingRoom));
  }, [enableWaitingRoom]);

  // Handle room creation (owner flow)
  const handleCreateRoom = useCallback(async () => {
    if (!roomNameInput.trim() || !userName.trim()) return;
    setIsLoading(true);
    try {
      await createRoom(roomNameInput.trim(), userName.trim(), {
        requireWaitingRoom: enableWaitingRoom,
      });
    } catch (err) {
      console.error('Failed to create room:', err);
    } finally {
      setIsLoading(false);
    }
  }, [roomNameInput, userName, createRoom, enableWaitingRoom]);

  // Handle room join (guest flow)
  const handleJoinRoom = useCallback(async () => {
    if (!roomNameInput.trim() || !userName.trim()) return;
    setIsLoading(true);
    try {
      await joinRoom(roomNameInput.trim(), userName.trim());
    } catch (err) {
      console.error('Failed to join room:', err);
    } finally {
      setIsLoading(false);
    }
  }, [roomNameInput, userName, joinRoom]);

  const isFormValid = userName.trim().length >= 4 && roomNameInput.trim().length > 0;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Video Room
        </Typography>

        {/* Role selection toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ToggleButtonGroup
            value={userRole}
            exclusive
            onChange={(_, value) => value && setUserRole(value)}
            size="small"
          >
            <ToggleButton value="owner">Create Room</ToggleButton>
            <ToggleButton value="guest">Join Room</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TextField
          fullWidth
          label="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          margin="normal"
          helperText="At least 4 characters"
        />

        <TextField
          fullWidth
          label="Room Name"
          value={roomNameInput}
          onChange={(e) => setRoomNameInput(e.target.value)}
          margin="normal"
          helperText={
            userRole === 'owner'
              ? 'Create a new room with this name'
              : 'Enter the room name to join'
          }
        />

        {/* Waiting Room toggle - only for owners */}
        {userRole === 'owner' && (
          <Box sx={{ mt: 2 }}>
            <WaitingRoomSetup
              enabled={enableWaitingRoom}
              onChange={setEnableWaitingRoom}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<VideoCallIcon />}
            onClick={userRole === 'owner' ? handleCreateRoom : handleJoinRoom}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (userRole === 'owner' ? 'Creating...' : 'Joining...') : (userRole === 'owner' ? 'Create Room' : 'Join Room')}
          </Button>
          <TooltipIconButton
            tooltip="Test camera & microphone"
            onClick={() => setShowDevicePreview(true)}
            color="default"
          >
            <SettingsIcon />
          </TooltipIconButton>
        </Box>
      </Paper>

      {/* Device Preview Dialog */}
      <Dialog
        open={showDevicePreview}
        onClose={() => setShowDevicePreview(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          Test Camera & Microphone
          <IconButton onClick={() => setShowDevicePreview(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {showDevicePreview && (
            <DevicePreview
              videoDeviceId={selectedDevices.videoInput}
              audioDeviceId={selectedDevices.audioInput}
              onDeviceChange={setSelectedDevices}
              width="100%"
              height={300}
              showAudioOutput
              showRefreshButton
              persistSelection
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
