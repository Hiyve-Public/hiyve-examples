/**
 * Hiyve Example - Server
 *
 * This server provides:
 * - Room token generation for Hiyve Client
 * - Join link generation for inviting participants
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

// Environment variables validation
const APIKEY = process.env.APIKEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SERVER_REGION = process.env.SERVER_REGION || 'us-west-2';
const SERVER_REGION_URL = process.env.SERVER_REGION_URL || '.rtc.muziemedia.com';
const SIGNALING_SERVER = `${SERVER_REGION}${SERVER_REGION_URL}`;

// Hiyve Cloud API configuration (uses same APIKEY as signaling server)
const HIYVE_CLOUD_URL = process.env.HIYVE_CLOUD_URL || 'https://api.muziemedia.com';

if (!APIKEY || !CLIENT_SECRET) {
  console.warn('⚠️  Warning: APIKEY and CLIENT_SECRET are not set.');
  console.warn('   Set them in server/.env file:');
  console.warn('   APIKEY=your-api-key');
  console.warn('   CLIENT_SECRET=your-client-secret');
  console.warn('   You can get these from your Hiyve account.');
}

/**
 * Generate a room token
 *
 * The room token is used by Hiyve Client to authenticate with the signaling server.
 * This token should be generated server-side to keep the API key and secret secure.
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
    // Include region so client can build proper join links
    res.json({ ...data, region: SERVER_REGION });
  } catch (error) {
    console.error('Error generating room token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Generate a cloud token for Hiyve Cloud AI features
 *
 * The cloud token is used by Hiyve Cloud Provider to authenticate with the AI service.
 * This token should be generated server-side to keep the API key secure.
 * Uses the same APIKEY as the signaling server.
 *
 * @returns {Object} { cloudToken: string, expiresAt: string }
 */
app.post('/api/generate-cloud-token', async (req, res) => {
  if (!APIKEY) {
    return res.status(500).json({
      error: 'Server not configured',
      message: 'APIKEY must be set in environment variables for cloud features'
    });
  }

  try {
    const response = await fetch(`${HIYVE_CLOUD_URL}/cloud-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hiyve-Api-Key': APIKEY,
      },
      body: JSON.stringify({
        expiresIn: '24h',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloud token generation failed:', response.status, errorText);
      return res.status(response.status).json({ message: 'Failed to generate cloud token' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error generating cloud token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Example server running on http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST /api/generate-room-token  - Generate room token for Hiyve Client`);
  console.log(`   POST /api/generate-cloud-token - Generate cloud token for AI features`);
  console.log(`   GET  /api/health               - Health check\n`);
  console.log(`☁️  Cloud API: ${HIYVE_CLOUD_URL}\n`);

  if (!APIKEY || !CLIENT_SECRET) {
    console.log(`⚠️  Server running but not fully configured.`);
    console.log(`   Create a .env file in the server folder with:`);
    console.log(`   APIKEY=your-api-key`);
    console.log(`   CLIENT_SECRET=your-client-secret\n`);
  }
});
