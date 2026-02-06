/**
 * Main app component - routes between views based on connection state:
 *
 * - Not connected → JoinForm
 * - Connecting → ConnectingScreen
 * - Waiting for host → WaitForHostScreen
 * - Waiting for admission → WaitingScreen
 * - In room → VideoRoom
 */

import { useState } from 'react';
import { useConnection, useRoom, useWaitingRoom, useWaitForHost } from '@hiyve/client-provider';
import { WaitForHostScreen } from '@hiyve/waiting-room';
import {
  JoinForm,
  VideoRoom,
  WaitingScreen,
  ConnectingScreen,
} from './components';
import { STORAGE_KEYS } from './constants';

function App() {
  // Get connection state from ClientProvider
  const { isConnecting } = useConnection();
  const { isInRoom } = useRoom();
  const { isWaitingForAdmission, wasRejected } = useWaitingRoom();
  const { isWaiting: isWaitingForHost } = useWaitForHost();

  // Read user data from localStorage (persisted by JoinForm)
  const [userName] = useState(() => localStorage.getItem(STORAGE_KEYS.userName) || '');
  const [userRole] = useState(() => (localStorage.getItem(STORAGE_KEYS.userRole) as 'owner' | 'guest') || 'owner');

  // Waiting for host state (guest joins before host starts)
  if (isWaitingForHost) {
    return <WaitForHostScreen />;
  }

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
