# WhatsApp MCP Server Setup Guide

This guide explains how to set up and use the WhatsApp MCP server for the Fall Detection Voice Agent.

## Overview

The WhatsApp MCP server allows the app to:
- Send text messages via WhatsApp
- Send images with captions
- Send audio messages
- Maintain persistent WhatsApp sessions

## Architecture

The WhatsApp MCP consists of two components:

1. **whatsapp-bridge** (Go) - Handles WhatsApp Web protocol and QR code authentication
2. **whatsapp-mcp-server** (Python) - Provides MCP interface and HTTP API

## Prerequisites

- Docker and Docker Compose
- Phone with WhatsApp installed
- Internet connection

## Setup Instructions

### Option 1: Using Docker Compose (Recommended)

1. **Configure Environment Variables**

Edit `.env.docker` (or create it from `.env.docker.example`):

```bash
WHATSAPP_PHONE_NUMBER=+1234567890  # Your phone number with country code

# For local development (default - using Docker bridge network)
WHATSAPP_BRIDGE_URL=http://whatsapp-bridge:8080

# For remote/ngrok deployment (if whatsapp-bridge is on different machine)
# WHATSAPP_BRIDGE_URL=https://your-ngrok-url.ngrok.io
```

2. **Start WhatsApp Services**

```bash
# Start both WhatsApp bridge and MCP server
docker-compose up -d whatsapp-bridge whatsapp

# Or start all MCP servers
docker-compose up -d
```

**Note**: The WhatsApp bridge is now included in docker-compose.yml, so you don't need to run it separately with `go run main.go`. This solves the gcc dependency issue on Windows!

3. **Authenticate with QR Code**

```bash
# View the logs to see the QR code
docker-compose logs -f whatsapp
```

You'll see a QR code in ASCII art in the terminal. Scan this with your WhatsApp mobile app:

- Open WhatsApp on your phone
- Go to Settings → Linked Devices
- Tap "Link a Device"
- Scan the QR code displayed in the terminal

4. **Verify Connection**

Once scanned, the logs should show:
```
✅ WhatsApp connected successfully
```

The session will be persisted in the `./whatsapp-mcp/store` directory.

### Option 2: Running Locally (Development)

1. **Start WhatsApp Bridge**

```bash
cd whatsapp-mcp/whatsapp-bridge
go run main.go
```

2. **Start MCP Server**

```bash
cd whatsapp-mcp/whatsapp-mcp-server
pip install -r requirements.txt
python http_server.py
```

3. **Scan QR Code**

The QR code will be displayed in the whatsapp-bridge terminal.

### Option 3: Using ngrok for Remote Access

If you need to access the WhatsApp bridge from a different machine or over the internet:

1. **Install ngrok**

```bash
# Download from https://ngrok.com/download
# Or install via package manager:
brew install ngrok  # macOS
choco install ngrok  # Windows
```

2. **Start WhatsApp Bridge Locally**

```bash
cd whatsapp-mcp/whatsapp-bridge
go run main.go
```

3. **Expose Bridge with ngrok**

```bash
# In a new terminal
ngrok http 8080
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8080
```

4. **Configure WhatsApp MCP Server**

Update `.env.docker` with your ngrok URL:

```bash
WHATSAPP_BRIDGE_URL=https://abc123.ngrok.io
```

5. **Start WhatsApp MCP Server**

```bash
docker-compose up -d whatsapp
```

Now the WhatsApp MCP server will connect to the bridge via ngrok!

**Note**: Free ngrok URLs expire after 2 hours. For production, use:
- ngrok paid plan with reserved domains
- Self-hosted tunnel (frp, localtunnel, etc.)
- Deploy both bridge and MCP server on same machine

## Usage in the App

### Sending Messages

The app automatically uses WhatsApp for:

1. **Emergency Alerts**: When a fall is detected, an alert is sent via WhatsApp
2. **Voice Commands**: Users can say "Send a WhatsApp message to [number]"

### Emergency Contact Configuration

Set your emergency contact in `.env`:

```bash
VITE_EMERGENCY_PHONE=+1234567890  # Number to receive emergency alerts
```

⚠️ **Important**: The phone number must be in international format with country code (e.g., +1 for US).

## API Endpoints

The WhatsApp MCP server exposes the following endpoints:

### Send Text Message

```bash
POST http://localhost:8089/mcp/tools/send_message
Content-Type: application/json

{
  "arguments": {
    "to": "+1234567890",
    "message": "Hello from Fall Detection App!"
  }
}
```

### Send Image

```bash
POST http://localhost:8089/mcp/tools/send_image
Content-Type: application/json

{
  "arguments": {
    "to": "+1234567890",
    "image_url": "https://example.com/image.jpg",
    "caption": "Check out this image"
  }
}
```

### Send Audio

```bash
POST http://localhost:8089/mcp/tools/send_audio
Content-Type: application/json

{
  "arguments": {
    "to": "+1234567890",
    "audio_url": "https://example.com/audio.mp3"
  }
}
```

## Troubleshooting

### QR Code Not Displaying

**Problem**: QR code doesn't appear in logs

**Solution**:
```bash
# Restart the container
docker-compose restart whatsapp

# Check logs
docker-compose logs -f whatsapp
```

### Connection Lost

**Problem**: WhatsApp session expires or disconnects

**Solution**:
1. Stop the container: `docker-compose stop whatsapp`
2. Clear session data: `rm -rf whatsapp-mcp/store/*`
3. Restart and scan QR code again: `docker-compose up -d whatsapp`

### Messages Not Sending

**Problem**: Messages fail to send

**Solution**:
1. Verify phone number format (must include country code with +)
2. Check if WhatsApp session is still active
3. Ensure the recipient has WhatsApp
4. Check Docker logs: `docker-compose logs whatsapp`

### Rate Limiting

**Problem**: Too many messages cause blocking

**Solution**:
- WhatsApp has rate limits to prevent spam
- Wait a few hours before sending more messages
- Reduce message frequency in the app

## Session Persistence

WhatsApp sessions are stored in `./whatsapp-mcp/store/`:

```
whatsapp-mcp/
  store/
    session.db        # Session data
    *.enc            # Encrypted credentials
```

⚠️ **Security**: Keep this directory secure. It contains your WhatsApp session tokens.

## Production Deployment

For production:

1. **Use Persistent Volume**

```yaml
services:
  whatsapp:
    volumes:
      - whatsapp-session:/app/store

volumes:
  whatsapp-session:
```

2. **Set Environment Variables Securely**

Use secrets management instead of .env files:
- AWS Secrets Manager
- Google Cloud Secret Manager
- HashiCorp Vault
- Kubernetes Secrets

3. **Monitor Connection Status**

Implement health checks:

```yaml
services:
  whatsapp:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

4. **Backup Session Data**

Regularly backup the `store/` directory to prevent re-authentication.

## Security Considerations

### Do's ✅
- Use strong authentication for the MCP server
- Implement rate limiting
- Validate phone numbers before sending
- Monitor for unusual activity
- Keep session data encrypted
- Use HTTPS in production

### Don'ts ❌
- Don't commit session data to git
- Don't share QR codes publicly
- Don't use for spam or unsolicited messages
- Don't expose MCP server to public internet without authentication
- Don't send sensitive data without encryption

## WhatsApp Terms of Service

⚠️ **Important**: This implementation uses WhatsApp Web protocol, which is intended for personal use. For business use, consider:

- [WhatsApp Business API](https://business.whatsapp.com/products/business-api) (official)
- [Twilio WhatsApp Business API](https://www.twilio.com/whatsapp)

Using WhatsApp Web for automated messaging may violate WhatsApp's Terms of Service. Use at your own risk.

## Alternative Messaging Solutions

If WhatsApp doesn't meet your needs, consider:

1. **Twilio SMS/WhatsApp**
   - Official API
   - Pay-per-message
   - Business-grade reliability

2. **Telegram Bot**
   - Free API
   - Easy to set up
   - Good for automation

3. **Discord Webhook**
   - Free
   - Instant notifications
   - Good for team alerts

4. **Email (Gmail MCP)**
   - Already integrated
   - Reliable
   - Works everywhere

## Support

For issues specific to WhatsApp MCP:
- Check [whatsapp-mcp README](./whatsapp-mcp/README.md)
- Review logs: `docker-compose logs whatsapp`

For issues with the app integration:
- Check main [README.md](./README.md)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md)

## Credits

The WhatsApp MCP implementation is based on the whatsmeow library for Go, which provides a clean interface to WhatsApp Web.

---

**Last Updated**: 2025-11-15
**Version**: 1.0.0
