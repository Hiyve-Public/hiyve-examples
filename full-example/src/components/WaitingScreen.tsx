/**
 * WaitingScreen Component
 *
 * Displays waiting room states for guests:
 * - Waiting for host admission
 * - Rejected by host
 *
 * @example
 * ```tsx
 * import { WaitingScreen } from './components/WaitingScreen';
 *
 * function App() {
 *   const { isWaitingForAdmission, wasRejected } = useWaitingRoom();
 *
 *   if (isWaitingForAdmission || wasRejected) {
 *     return <WaitingScreen />;
 *   }
 *   // ...
 * }
 * ```
 *
 * ## Hooks Used
 * - `useWaitingRoom()` - isWaitingForAdmission, wasRejected state
 * - `useRoom()` - room name
 * - `useConnection()` - leaveRoom action
 */

import { useCallback } from 'react';
import { Container } from '@mui/material';
import { useConnection, useRoom, useWaitingRoom } from '@hiyve/client-provider';
import { WaitingRoomGuest } from '@hiyve/waiting-room';

export function WaitingScreen() {
  const { leaveRoom } = useConnection();
  const { room } = useRoom();
  const { isWaitingForAdmission, wasRejected } = useWaitingRoom();

  const handleLeave = useCallback(() => {
    leaveRoom();
  }, [leaveRoom]);

  // Waiting for host to admit
  if (isWaitingForAdmission) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <WaitingRoomGuest
          status="waiting"
          roomName={room?.name}
          onCancel={handleLeave}
        />
      </Container>
    );
  }

  // Rejected by host
  if (wasRejected) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <WaitingRoomGuest
          status="rejected"
          roomName={room?.name}
          onLeave={handleLeave}
        />
      </Container>
    );
  }

  return null;
}

export default WaitingScreen;
