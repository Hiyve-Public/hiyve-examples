# Hiyve SDK - Next.js Example

A minimal video conferencing application built with **Next.js 14** and the **Hiyve SDK**.

## Features

- Next.js App Router with API routes
- Device preview with camera/microphone selection
- Create or join video rooms
- Video grid with layout switching
- Screen sharing support

## Quick Start

You can either run the root setup script (recommended) or set up manually:

### Option A: Root Setup Script (Recommended)

From the `hiyve-examples` root directory:

```bash
./setup.sh nextjs-example
```

This handles authentication, dependencies, and environment setup automatically.

Then start the app:

```bash
cd nextjs-example
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Manual Setup

#### 1. Install Dependencies

```bash
pnpm run setup
```

#### 2. Configure Environment

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Hiyve API credentials from [console.hiyve.dev](https://console.hiyve.dev):

```env
APIKEY=your-api-key
CLIENT_SECRET=your-client-secret
SERVER_REGION=us-west-2
```

#### 3. Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nextjs-example/
├── app/
│   ├── api/
│   │   └── generate-room-token/
│   │       └── route.ts       # API route for token generation
│   ├── layout.tsx             # Root layout with MUI theme
│   └── page.tsx               # Main page with ClientProvider
├── components/
│   ├── JoinForm.tsx           # Room entry form with device preview
│   └── VideoRoom.tsx          # Video grid and controls
├── types/
│   └── hiyve.d.ts             # Type declarations for @hiyve packages
├── theme.ts                   # MUI dark theme configuration
├── next.config.mjs            # Next.js configuration
└── package.json
```

## Key Differences from Vite Example

| Feature | Vite Example | Next.js Example |
|---------|--------------|-----------------|
| Server | Separate Express server | Next.js API routes |
| Routing | React state-based | App Router (single page) |
| SSR | Client-only | SSR with 'use client' |
| Theme | ThemeProvider in main.tsx | AppRouterCacheProvider |

## SDK Components Used

- `@hiyve/client-provider` - React context for WebRTC state
- `@hiyve/device-selector` - Camera/microphone preview and selection
- `@hiyve/video-grid` - Participant video layout
- `@hiyve/control-bar` - Media controls and leave button

## TypeScript Support

This example includes TypeScript type declarations for all `@hiyve/*` packages in `types/hiyve.d.ts`. These declarations provide type safety while the SDK packages are in development.

The declarations cover:
- `@hiyve/client-provider` - hooks and ClientProvider component
- `@hiyve/control-bar` - ControlBar component and LayoutMode type
- `@hiyve/device-selector` - DevicePreview component
- `@hiyve/video-grid` - VideoGrid component

## Development Mode

To use local SDK packages during development:

```bash
# Switch to local packages
pnpm run packages:dev

# Switch back to registry packages
pnpm run packages:prod

# Check current mode
pnpm run packages:status
```

## Learn More

- [Hiyve SDK Documentation](https://doawc2271w91z.cloudfront.net/docs/hiyve-sdk/latest/index.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [MUI Documentation](https://mui.com/material-ui/getting-started/)
