/**
 * ConnectingScreen Component
 *
 * Displays a loading indicator while connecting to a room.
 *
 * @example
 * ```tsx
 * import { ConnectingScreen } from './components/ConnectingScreen';
 *
 * function App() {
 *   const { isConnecting } = useConnection();
 *
 *   if (isConnecting) {
 *     return <ConnectingScreen isCreating={userRole === 'owner'} />;
 *   }
 *   // ...
 * }
 * ```
 *
 * ## Hooks Used
 * None - this is a presentational component
 */

import { Box, Typography, CircularProgress } from '@mui/material';

interface ConnectingScreenProps {
  /** Whether user is creating (true) or joining (false) a room */
  isCreating?: boolean;
}

export function ConnectingScreen({ isCreating = false }: ConnectingScreenProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 3 }}>
        {isCreating ? 'Creating room...' : 'Joining room...'}
      </Typography>
    </Box>
  );
}

export default ConnectingScreen;
