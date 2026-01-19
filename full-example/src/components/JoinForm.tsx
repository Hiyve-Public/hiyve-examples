/**
 * JoinForm Component
 *
 * Displays the room join/create form with:
 * - Role selection (owner/guest)
 * - User name input
 * - Room name input
 * - Waiting room toggle (for owners)
 * - Device preview dialog
 *
 * @example
 * ```tsx
 * import { JoinForm } from './components/JoinForm';
 *
 * function App() {
 *   const { isInRoom } = useRoom();
 *   if (!isInRoom) return <JoinForm />;
 *   return <VideoRoom />;
 * }
 * ```
 *
 * ## Hooks Used
 * - `useConnection()` - createRoom, joinRoom, error state
 *
 * ## Features
 * - Form values persisted to localStorage
 * - Device preview before joining
 * - Waiting room configuration for owners
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Container,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useConnection } from '@hiyve/client-provider';
import { DevicePreview, type SelectedDevices } from '@hiyve/device-selector';
import { WaitingRoomSetup } from '@hiyve/waiting-room';

type UserRole = 'owner' | 'guest';

// localStorage keys for form persistence
const STORAGE_KEYS = {
  userName: 'hiyve-example-userName',
  roomName: 'hiyve-example-roomName',
  userRole: 'hiyve-example-userRole',
  enableWaitingRoom: 'hiyve-example-enableWaitingRoom',
} as const;

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
  const [selectedDevices, setSelectedDevices] = useState<SelectedDevices>({});

  // Get connection actions from ClientProvider
  const { error, createRoom, joinRoom } = useConnection();

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
    try {
      await createRoom(roomNameInput.trim(), userName.trim(), {
        requireWaitingRoom: enableWaitingRoom,
      });
    } catch (err) {
      console.error('Create room failed', err);
    }
  }, [roomNameInput, userName, createRoom, enableWaitingRoom]);

  // Handle room join (guest flow)
  const handleJoinRoom = useCallback(async () => {
    if (!roomNameInput.trim() || !userName.trim()) return;
    try {
      await joinRoom(roomNameInput.trim(), userName.trim());
    } catch (err) {
      console.error('Join room failed', err);
    }
  }, [roomNameInput, userName, joinRoom]);

  const isFormValid = userName.trim().length >= 4 && roomNameInput.trim().length > 0;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Video Room
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

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
            disabled={!isFormValid}
          >
            {userRole === 'owner' ? 'Create Room' : 'Join Room'}
          </Button>
          <Tooltip title="Test camera & microphone">
            <IconButton onClick={() => setShowDevicePreview(true)} color="default">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
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

export default JoinForm;
