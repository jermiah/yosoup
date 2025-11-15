# Using ngrok with WhatsApp MCP Server

This guide explains how to use ngrok to expose your WhatsApp bridge for remote access.

## Why Use ngrok?

- **Remote Access**: Access WhatsApp bridge from different machines
- **Cloud Deployment**: Deploy MCP server on cloud while bridge runs locally
- **Testing**: Test webhooks and external integrations
- **Development**: Work from multiple locations

## Quick Start

### 1. Install ngrok

**macOS:**
```bash
brew install ngrok
```

**Windows:**
```bash
choco install ngrok
```

**Linux:**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok
```

Or download from: https://ngrok.com/download

### 2. Sign Up & Authenticate

1. Create account at: https://dashboard.ngrok.com/signup
2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
3. Authenticate ngrok:

```bash
ngrok authtoken YOUR_AUTHTOKEN_HERE
```

### 3. Start WhatsApp Bridge

```bash
cd whatsapp-mcp/whatsapp-bridge
go run main.go
```

The bridge will start on port 8080.

### 4. Start ngrok Tunnel

In a new terminal:

```bash
ngrok http 8080
```

You'll see output like:

```
ngrok

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       50ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:8080

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS forwarding URL** (e.g., `https://abc123.ngrok.io`)

### 5. Configure WhatsApp MCP Server

Edit `.env.docker`:

```bash
WHATSAPP_PHONE_NUMBER=+1234567890
WHATSAPP_BRIDGE_URL=https://abc123.ngrok.io
```

### 6. Start WhatsApp MCP Server

```bash
docker-compose up -d whatsapp
```

### 7. Test the Connection

```bash
# Check logs
docker-compose logs -f whatsapp

# Test API endpoint
curl https://abc123.ngrok.io/api/health
```

## ngrok Dashboard

Access the ngrok web interface at: http://127.0.0.1:4040

Features:
- **Inspect Requests**: See all HTTP requests/responses
- **Replay Requests**: Replay requests for debugging
- **Request Details**: View headers, body, timing

## Production Setup

### Free Tier Limitations

- URL changes every restart
- 2-hour session timeout
- Rate limits

### Paid Plans (Recommended for Production)

**ngrok Pro** ($10/month):
- Reserved domains (e.g., `yourapp.ngrok.io`)
- Custom domains
- No session timeout
- Higher rate limits

**Setup with Reserved Domain:**

1. Purchase plan at: https://dashboard.ngrok.com/billing/plan
2. Reserve domain: https://dashboard.ngrok.com/cloud-edge/domains
3. Update ngrok command:

```bash
ngrok http 8080 --domain=yourapp.ngrok.io
```

4. Update `.env.docker`:
```bash
WHATSAPP_BRIDGE_URL=https://yourapp.ngrok.io
```

## Alternative Solutions

### 1. Self-Hosted Tunnel (frp)

**Free and open-source alternative:**

```bash
# Install frp
wget https://github.com/fatedier/frp/releases/download/v0.52.0/frp_0.52.0_linux_amd64.tar.gz
tar -xzf frp_0.52.0_linux_amd64.tar.gz
cd frp_0.52.0_linux_amd64

# Configure frpc.ini
./frpc -c frpc.ini
```

### 2. Cloudflare Tunnel

**Free alternative:**

```bash
# Install cloudflared
brew install cloudflared  # macOS
winget install --id Cloudflare.cloudflared  # Windows

# Start tunnel
cloudflared tunnel --url http://localhost:8080
```

### 3. Deploy Both Together

**Best for production:**

Deploy both WhatsApp bridge and MCP server on the same machine:

```yaml
# docker-compose.yml
services:
  whatsapp-bridge:
    build: ./whatsapp-mcp/whatsapp-bridge
    ports:
      - "8080:8080"
    volumes:
      - ./whatsapp-mcp/store:/app/store

  whatsapp:
    build: ./whatsapp-mcp/whatsapp-mcp-server
    ports:
      - "8089:8000"
    environment:
      - WHATSAPP_BRIDGE_URL=http://whatsapp-bridge:8080
    depends_on:
      - whatsapp-bridge
```

## Troubleshooting

### ngrok not connecting

**Problem**: `ERR_NGROK_108 - Session not authenticated`

**Solution**:
```bash
ngrok authtoken YOUR_AUTHTOKEN
```

### Connection refused

**Problem**: WhatsApp MCP can't connect to ngrok URL

**Solution**:
1. Verify bridge is running: `curl http://localhost:8080/api/health`
2. Verify ngrok is running: `curl https://your-url.ngrok.io/api/health`
3. Check HTTPS (not HTTP)
4. Restart MCP server: `docker-compose restart whatsapp`

### Slow responses

**Problem**: High latency through ngrok

**Solution**:
- Use regional endpoint closer to you
- Upgrade to paid plan for better performance
- Consider deploying bridge and MCP server together

### ngrok URL expired

**Problem**: Session expired after 2 hours

**Solution**:
- Restart ngrok
- Copy new URL to `.env.docker`
- Restart WhatsApp MCP: `docker-compose restart whatsapp`
- Or upgrade to paid plan with reserved domains

## Environment Variables

### Local Development
```bash
WHATSAPP_BRIDGE_URL=http://localhost:8080
```

### ngrok Free Tier
```bash
WHATSAPP_BRIDGE_URL=https://abc123.ngrok.io
```

### ngrok Reserved Domain
```bash
WHATSAPP_BRIDGE_URL=https://yourapp.ngrok.io
```

### Production (Same Machine)
```bash
WHATSAPP_BRIDGE_URL=http://whatsapp-bridge:8080
```

## Security Considerations

### Do's ✅
- Use HTTPS ngrok URLs
- Keep ngrok authtoken secret
- Monitor ngrok dashboard for suspicious activity
- Use ngrok's IP restrictions (paid plans)
- Implement authentication in your bridge

### Don'ts ❌
- Don't share ngrok URLs publicly
- Don't commit authtoken to git
- Don't use free tier in production
- Don't expose sensitive data without encryption

## Monitoring

### Check Bridge Status
```bash
curl https://your-url.ngrok.io/api/health
```

### View ngrok Logs
```bash
# In terminal running ngrok
# Or access: http://127.0.0.1:4040
```

### Monitor MCP Server
```bash
docker-compose logs -f whatsapp
```

## Cost Comparison

| Solution | Cost | Pros | Cons |
|----------|------|------|------|
| ngrok Free | $0 | Easy setup, Quick start | URL changes, 2hr timeout |
| ngrok Pro | $10/mo | Reserved domain, No timeout | Monthly cost |
| Cloudflare Tunnel | $0 | Free, Reliable | More complex setup |
| Self-hosted (frp) | $0 | Full control, Free | Requires server |
| Same Machine | $0 | Fastest, No tunnel | Less flexible |

## Recommended Setup by Use Case

### Development
```bash
# Use ngrok free tier
ngrok http 8080
```

### Testing
```bash
# Use Cloudflare Tunnel (free)
cloudflared tunnel --url http://localhost:8080
```

### Production
```bash
# Deploy together or use ngrok Pro
docker-compose up -d whatsapp-bridge whatsapp
```

---

**Last Updated**: 2025-11-15
**Version**: 1.0.0
