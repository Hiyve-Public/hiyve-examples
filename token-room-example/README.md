# Token Room Example

A minimal example demonstrating token-based room joining with shareable invite links using the Hiyve SDK.

## Features

- **Room Creation**: Owner creates a room and joins automatically
- **Invite Links**: Owner generates shareable invite links with configurable options
- **Token-Based Joining**: Guests join using invite links (no room name needed)
- **Password Protection**: Optional password protection for invite links
- **Simple Video Room**: Basic video grid with audio/video controls
- **Live Clock**: Auto-updating time display in room header
- **Responsive Layout**: Adaptive controls based on container size

## Quick Start

You can either run the root setup script (recommended) or set up manually:

### Option A: Root Setup Script (Recommended)

From the `hiyve-examples` root directory:

```bash
./setup.sh token-room-example
```

This handles authentication, dependencies, and environment setup automatically.

Then start the app:

```bash
cd token-room-example
pnpm run dev
```

### Option B: Manual Setup

1. **Authenticate with Hiyve**

   The `@hiyve/*` packages require authentication. If you haven't already:

   ```bash
   npx hiyve-cli login
   ```

   Enter your Hiyve API key when prompted. Get one at [console.hiyve.dev](https://console.hiyve.dev).

2. **Install dependencies**

   ```bash
   pnpm run setup
   ```

3. **Configure API credentials**

   Copy the example environment file and add your credentials:

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env` with your Hiyve API credentials:

   ```
   APIKEY=your-api-key
   CLIENT_SECRET=your-client-secret
   ```

4. **Start the application**

   ```bash
   pnpm run dev
   ```

   This starts both the frontend (port 5173) and backend (port 3001).

5. **Open in browser**

   Visit `http://localhost:5173`

## User Flows

### Owner Flow

1. Open the app at `/`
2. Enter your name and room name
3. Click "Create Room"
4. Once in the room, click the share icon to get an invite link
5. Configure link options (type, expiration, password)
6. Copy and share the link with guests

### Guest Flow

1. Receive an invite link from the owner
2. Open the link in your browser
3. Enter your display name (and password if required)
4. Click "Join Room"
5. You're in the video call!

## Invite Link Format

```
https://example.com/join?joinToken={token}&region={region}
```

- `joinToken`: Encoded token identifying the invite
- `region`: Server region (e.g., us-west-2)

The room name is NOT in the URL - it's retrieved server-side when validating the token.

## Token Options

When generating invite links, owners can configure:

- **Type**:
  - `group` - Anyone with the link can join (multiple uses)
  - `individual` - Only one person can use this link

- **Expiration**:
  - 1 hour
  - 1 day
  - 1 week

- **Password** (optional):
  - Add password protection for extra security

## Project Structure

```
token-room-example/
├── src/
│   ├── main.tsx              # App entry with ClientProvider
│   ├── App.tsx               # Routing based on URL and state
│   ├── hiyve.d.ts            # Type declarations for @hiyve packages
│   └── components/
│       ├── CreateRoom.tsx    # Owner: create room form
│       ├── JoinRoom.tsx      # Guest: join via token (uses SDK)
│       ├── VideoRoom.tsx     # Simple video room
│       └── InviteLinkDisplay.tsx  # Generate/share invite link (uses SDK)
├── server/
│   ├── server.js             # Room token generation API
│   └── .env.example          # Environment template
├── package.json
├── vite.config.ts
└── README.md
```

## SDK Components

This example uses reusable components from the Hiyve SDK:

### @hiyve/join-token

- **`InviteLinkDialog`** - Dialog for creating and sharing invite links
- **`JoinWithTokenForm`** - Form for joining rooms via invite tokens

These components handle all the complexity of token generation, validation, and error handling.

### @hiyve/client-provider

- Standard hooks: `useConnection`, `useRoom`, `useDevices`
- Error code constants: `TOKEN_NOT_FOUND`, `TOKEN_EXPIRED`, `INVALID_PASSWORD`, etc.

### @hiyve/utilities

- **`LiveClock`** - Auto-updating time display in the room header
- **`TooltipIconButton`** - Combines Tooltip and IconButton for cleaner code
- **`useContainerBreakpoint`** - Responsive container queries for adaptive layouts

```tsx
import { LiveClock, TooltipIconButton, useContainerBreakpoint } from '@hiyve/utilities';

// LiveClock in the header
<LiveClock variant="body2" sx={{ ml: 2, opacity: 0.7 }} />

// TooltipIconButton for the share button
<TooltipIconButton tooltip="Get invite link" onClick={openDialog} color="primary">
  <ShareIcon />
</TooltipIconButton>

// Responsive layout - hide layout selector on small screens
const { isBelowBreakpoint: isCompact, containerRef } = useContainerBreakpoint(600);
<ControlBar showLayoutSelector={!isCompact} />
```

## Dependencies

### Frontend
- `@hiyve/client-provider` - State management and hooks
- `@hiyve/join-token` - Invite link components
- `@hiyve/video-grid` - Video layout
- `@hiyve/control-bar` - Media controls
- `@hiyve/utilities` - Shared utilities (LiveClock, TooltipIconButton, useContainerBreakpoint)
- React 18, MUI 5

### Backend
- Express.js
- dotenv

## API Endpoints

### POST /api/generate-room-token

Generates a room token for Hiyve Client authentication.

**Response:**
```json
{
  "roomToken": "jwt-token-here",
  "region": "us-west-2"
}
```

### GET /api/health

Health check endpoint.

## Comparison with Full Example

| Feature | Token Room Example | Full Example |
|---------|-------------------|--------------|
| Room Creation | Yes | Yes |
| Invite Links | Yes (token-based) | No |
| Password Protection | Yes | No |
| Video Grid | Yes | Yes |
| Control Bar | Basic | Full |
| Sidebar | No | Yes |
| Chat | No | Yes |
| Recording | No | Yes |
| Transcription | No | Yes |
| Waiting Room | No | Yes |
| File Sharing | No | Yes |

This example demonstrates the token-based joining flow with minimal complexity.

## TypeScript Support

This example includes TypeScript type declarations for all `@hiyve/*` packages in `src/hiyve.d.ts`. These declarations provide type safety while the SDK packages are in development.

The declarations cover:
- `@hiyve/client-provider` - hooks and ClientProvider component
- `@hiyve/control-bar` - ControlBar component and LayoutMode type
- `@hiyve/join-token` - JoinWithTokenForm and InviteLinkDialog components
- `@hiyve/video-grid` - VideoGrid component
- `@hiyve/utilities` - LiveClock, TooltipIconButton, useContainerBreakpoint

## Troubleshooting

### "Invalid invite link"

- The token may be malformed - check the URL
- Try generating a new invite link

### "This invite link has expired"

- The token has passed its expiration time
- Ask the room owner for a new link

### "Incorrect password"

- The password entered doesn't match
- Check with the room owner for the correct password

### "You are not authorized"

- Individual tokens are restricted to a specific user ID
- Contact the room owner for a link meant for you

### "Failed to generate room token"

- Check that `APIKEY` and `CLIENT_SECRET` are set in `server/.env`
- Verify the credentials are correct

### Video/audio not working

- Check browser permissions for camera and microphone
- Try a different browser (Chrome recommended)
