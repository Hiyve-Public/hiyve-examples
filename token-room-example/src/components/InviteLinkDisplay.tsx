/**
 * InviteLinkDisplay - Share button that opens the invite link dialog.
 *
 * Uses `InviteLinkDialog` from @hiyve/join-token SDK.
 */

import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Share as ShareIcon } from '@mui/icons-material';
import { InviteLinkDialog } from '@hiyve/join-token';

interface InviteLinkDisplayProps {
  roomName: string;
  onCopySuccess?: () => void;
}

export function InviteLinkDisplay({ roomName, onCopySuccess }: InviteLinkDisplayProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Get invite link">
        <IconButton onClick={() => setOpen(true)} color="primary">
          <ShareIcon />
        </IconButton>
      </Tooltip>

      <InviteLinkDialog
        roomName={roomName}
        open={open}
        onClose={() => setOpen(false)}
        onCopySuccess={onCopySuccess}
      />
    </>
  );
}

export default InviteLinkDisplay;
