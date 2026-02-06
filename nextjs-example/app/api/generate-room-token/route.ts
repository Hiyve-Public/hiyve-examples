import { NextResponse } from 'next/server';

/**
 * Generate Room Token API Route
 *
 * Generates a JWT room token by calling the Hiyve signaling server.
 * The token is used by the client to authenticate WebRTC connections.
 *
 * Environment variables required:
 * - APIKEY: Your Hiyve API key
 * - CLIENT_SECRET: Your Hiyve client secret
 * - SERVER_REGION: Optional, defaults to 'us-west-2'
 */
export async function POST() {
  const APIKEY = process.env.APIKEY;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const SERVER_REGION = process.env.SERVER_REGION || 'us-west-2';
  const SIGNALING_SERVER = `${SERVER_REGION}.rtc.muziemedia.com`;

  if (!APIKEY || !CLIENT_SECRET) {
    return NextResponse.json(
      {
        error: 'Server not configured',
        message: 'APIKEY and CLIENT_SECRET must be set in environment variables',
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        { message: 'Failed to generate room token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating room token:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
