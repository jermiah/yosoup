# Quick Start Guide

Get up and running with the Fall Detection Voice Agent in 5 minutes!

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Phone with WhatsApp (for emergency alerts)

## 1. Clone Repository

```bash
git clone https://github.com/jermiah/yosoup.git
cd yosoup
```

## 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env
cp .env.docker.example .env.docker

# Edit .env with your API keys (required)
nano .env
```

### Minimum Required Variables

```bash
# .env (Frontend)
VITE_MISTRAL_API_KEY=your_mistral_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_EMERGENCY_PHONE=+1234567890
VITE_EMERGENCY_EMAIL=emergency@example.com

# .env.docker (MCP Servers)
WHATSAPP_PHONE_NUMBER=+1234567890
GMAIL_ADDRESS=your@gmail.com
GMAIL_APP_PASSWORD=your_app_password
BRAVE_API_KEY=your_brave_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key
```

## 3. Start MCP Servers

```bash
# Start all MCP servers
docker-compose --env-file .env.docker up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 4. Setup WhatsApp (Important!)

```bash
# View WhatsApp logs to get QR code
docker-compose logs -f whatsapp

# Scan QR code with your phone:
# WhatsApp → Settings → Linked Devices → Link a Device
```

## 5. Install Frontend Dependencies

```bash
npm install
```

## 6. Start Development Server

```bash
npm run dev
```

App runs at: http://localhost:3000

## 7. Test on iPhone

### Find Your IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

### Access from iPhone

1. Connect iPhone to same Wi-Fi network
2. Open Safari
3. Go to: `http://YOUR_IP:3000`
4. Grant permissions:
   - Motion & Orientation
   - Microphone
   - Location

### Add to Home Screen (Optional)

1. Tap Share button
2. Select "Add to Home Screen"
3. App runs in full-screen mode

## 8. Test Fall Detection

1. Tap "Start Monitoring"
2. Shake phone vigorously
3. Emergency alert should trigger
4. Cancel within 10 seconds

## Quick Commands Reference

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart WhatsApp (after QR scan)
docker-compose restart whatsapp

# View specific logs
docker-compose logs -f [service-name]

# Rebuild after code changes
docker-compose build [service-name]
docker-compose up -d [service-name]

# Frontend development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Available MCP Servers

| Service | Port | Status Command |
|---------|------|----------------|
| WhatsApp | 8089 | `docker-compose logs whatsapp` |
| Airbnb | 8090 | `docker-compose logs airbnb` |
| Brave Search | 8091 | `docker-compose logs brave-search` |
| Perplexity | 8092 | `docker-compose logs perplexity` |
| Gmail | 8093 | `docker-compose logs gmail` |
| Google Maps | 8094 | `docker-compose logs google-maps` |
| Firecrawl | 8095 | `docker-compose logs firecrawl` |
| YouTube | 8096 | `docker-compose logs youtube` |

## Get API Keys

### Free/Trial Available
- **Mistral**: https://console.mistral.ai/ (Free tier)
- **Brave Search**: https://brave.com/search/api/ (Free tier)
- **ElevenLabs**: https://elevenlabs.io/ (Free tier)

### Google Services
- **Google Maps**: https://console.cloud.google.com/
  - Enable: Geocoding, Places, Directions, Distance Matrix APIs

### Email
- **Gmail**: Use App Password
  1. Enable 2FA on Google account
  2. Generate app password: https://myaccount.google.com/apppasswords

### AI Services
- **Perplexity**: https://www.perplexity.ai/settings/api (Paid)
- **Firecrawl**: https://firecrawl.dev/ (Free tier)

## Common Issues

### WhatsApp QR Code Not Showing
```bash
docker-compose restart whatsapp
docker-compose logs -f whatsapp
```

### MCP Server Not Responding
```bash
# Check if running
docker-compose ps

# Restart specific service
docker-compose restart [service-name]

# Check logs
docker-compose logs [service-name]
```

### iPhone Permissions Denied
1. Settings → Safari → Motion & Orientation Access
2. Enable for the website
3. Refresh page

### Fall Detection Not Working
- Use actual iPhone device (not simulator)
- Ensure HTTPS in production (required for Device Motion API)
- Check browser console for errors

## Production Deployment

### Quick Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard.

### Deploy MCP Servers

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Docker deployment
- Cloud Run (Google Cloud)
- AWS ECS
- Kubernetes

## Using with ngrok

For remote WhatsApp bridge access:

```bash
# Terminal 1: Start bridge
cd whatsapp-mcp/whatsapp-bridge
go run main.go

# Terminal 2: Expose with ngrok
ngrok http 8080

# Update .env.docker
WHATSAPP_BRIDGE_URL=https://your-url.ngrok.io

# Restart MCP server
docker-compose restart whatsapp
```

See [NGROK_SETUP.md](./NGROK_SETUP.md) for details.

## Documentation

- **[README.md](./README.md)** - Complete documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[MCP_SERVERS.md](./MCP_SERVERS.md)** - MCP server details
- **[WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)** - WhatsApp setup
- **[NGROK_SETUP.md](./NGROK_SETUP.md)** - ngrok configuration

## Support

- **Issues**: https://github.com/jermiah/yosoup/issues
- **Discussions**: https://github.com/jermiah/yosoup/discussions

## Security Notice

⚠️ **For Development/Demo Only**

This app is for demonstration purposes. In real emergencies:
- Call emergency services directly (911, 112, etc.)
- Don't rely solely on automated systems
- Test thoroughly before actual use

## Next Steps

1. ✅ Test fall detection
2. ✅ Test voice assistant
3. ✅ Configure emergency contacts
4. ✅ Deploy to production with HTTPS
5. ✅ Set up monitoring
6. ✅ Configure backup emergency contacts

---

**Repository**: https://github.com/jermiah/yosoup
**Last Updated**: 2025-11-15
**Version**: 1.0.0

Need help? Check the [full documentation](./README.md)!
