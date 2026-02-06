/**
 * Basic Example - Server
 *
 * Minimal server that provides room token generation for the Hiyve SDK.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// TODO: Production - restrict CORS origins and add rate limiting:
// app.use(cors({ origin: 'https://your-domain.com' }));
// app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cors());
app.use(express.json());

// Environment variables
const APIKEY = process.env.APIKEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SERVER_REGION = process.env.SERVER_REGION || 'us-west-2';
const SERVER_REGION_URL = process.env.SERVER_REGION_URL || '.rtc.muziemedia.com';
const SIGNALING_SERVER = `${SERVER_REGION}${SERVER_REGION_URL}`;

if (!APIKEY || !CLIENT_SECRET) {
  console.warn('Warning: APIKEY and CLIENT_SECRET are not set.');
  console.warn('   Set them in server/.env file:');
  console.warn('   APIKEY=your-api-key');
  console.warn('   CLIENT_SECRET=your-client-secret');
}

/**
 * Generate a room token
 *
 * The room token is a JWT that allows the client to authenticate
 * with the Hiyve signaling server.
 */
app.post('/api/generate-room-token', async (req, res) => {
  if (!APIKEY || !CLIENT_SECRET) {
    return res.status(500).json({
      error: 'Server not configured',
      message: 'APIKEY and CLIENT_SECRET must be set in environment variables'
    });
  }

  try {
    const response = await fetch(`https://${SIGNALING_SERVER}/room-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: APIKEY,
        secret: CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Room token generation failed:', response.status, errorText);
      return res.status(response.status).json({ message: 'Failed to generate room token' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error generating room token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    configured: !!(APIKEY && CLIENT_SECRET),
    region: SERVER_REGION
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n Basic Example server running on http://localhost:${PORT}`);
  console.log(`\n Available endpoints:`);
  console.log(`   POST /api/generate-room-token - Generate room token`);
  console.log(`   GET  /api/health - Health check\n`);

  if (!APIKEY || !CLIENT_SECRET) {
    console.log(`   Server running but not fully configured.`);
    console.log(`   Create a .env file in the server folder with:`);
    console.log(`   APIKEY=your-api-key`);
    console.log(`   CLIENT_SECRET=your-client-secret\n`);
  }
});
