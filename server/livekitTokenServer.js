/**
 * LiveKit Token Generation Server
 *
 * This is a simple Express server that generates LiveKit access tokens.
 * In production, this should be a secure backend service.
 *
 * Setup:
 * 1. npm install express cors livekit-server-sdk dotenv
 * 2. Create a .env file with LIVEKIT_API_KEY and LIVEKIT_API_SECRET
 * 3. Run: node server/livekitTokenServer.js
 */

import express from 'express';
import cors from 'cors';
import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.TOKEN_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Token generation endpoint
app.post('/api/livekit/token', async (req, res) => {
  try {
    const { roomName, participantName } = req.body;

    // Validate input
    if (!roomName || !participantName) {
      return res.status(400).json({
        error: 'Missing required fields: roomName and participantName'
      });
    }

    // Get API credentials from environment
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('LiveKit API credentials not configured');
      return res.status(500).json({
        error: 'Server configuration error'
      });
    }

    // Create access token
    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: '6h', // Token valid for 6 hours
    });

    // Grant permissions
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    // Generate JWT
    const jwt = await token.toJwt();

    console.log(`Generated token for ${participantName} in room ${roomName}`);

    res.json({
      token: jwt,
      roomName,
      participantName,
      expiresIn: '6h'
    });

  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({
      error: 'Failed to generate token',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`LiveKit token server running on port ${PORT}`);
  console.log(`Token endpoint: http://localhost:${PORT}/api/livekit/token`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
