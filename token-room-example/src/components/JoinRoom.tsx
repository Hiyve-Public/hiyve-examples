/**
 * JoinRoom - Guest entry point for joining via invite link.
 *
 * Uses `JoinWithTokenForm` from @hiyve/join-token SDK which handles:
 * - Token validation
 * - Password prompts when required
 * - User-friendly error messages
 * - Loading states
 */

import { JoinWithTokenForm } from '@hiyve/join-token';

interface JoinRoomProps {
  joinToken: string;
  region: string;
  onUserNameChange?: (name: string) => void;
}

export function JoinRoom({ joinToken, region, onUserNameChange }: JoinRoomProps) {
  return (
    <JoinWithTokenForm
      joinToken={joinToken}
      region={region}
      onUserNameChange={onUserNameChange}
      userNameStorageKey="hiyve-token-example-userName"
      onCreateRoom={() => {
        window.history.replaceState({}, '', '/');
        window.location.reload();
      }}
    />
  );
}

export default JoinRoom;
