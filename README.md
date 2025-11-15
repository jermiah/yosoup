# EcoCare

A lightweight React-based web application that combines fall detection with an AI-powered voice assistant. Built for iPhone with LiveKit, Mistral LLM, ElevenLabs TTS, and multiple MCP (Model Context Protocol) servers.

## Features

### 🛡️ Fall Detection
- Real-time accelerometer monitoring using Device Motion API
- Intelligent fall pattern detection (free-fall + impact + inactivity)
- iOS 13+ permission handling
- Automatic emergency alert system with 10-second cancellation window
- GPS location tracking for emergency response

### 🎤 Voice Assistant
- LiveKit integration for real-time voice communication
- Mistral LLM for natural language understanding
- ElevenLabs text-to-speech for natural voice responses
- Web Speech API for speech recognition

### 🛠️ MCP Server Integrations
The app integrates with 8 different MCP servers running on different ports:

1. **WhatsApp** (Port 8089) - Send messages, images, and audio via WhatsApp
2. **Airbnb** (Port 8090) - Search accommodations (placeholder)
3. **Brave Search** (Port 8091) - Web, image, news, and video search
4. **Perplexity** (Port 8092) - AI-powered research and Q&A
5. **Gmail** (Port 8093) - Email management
6. **Google Maps** (Port 8094) - Geocoding, directions, places search
7. **Firecrawl** (Port 8095) - Web scraping and content extraction
8. **YouTube** (Port 8096) - Video transcripts and information

## Prerequisites

- Node.js 18+ and npm
- LiveKit server (cloud or self-hosted)
- API keys for:
  - Mistral AI
  - ElevenLabs
  - Brave Search
  - Perplexity
  - Google Maps
  - Firecrawl
  - Gmail (app password)

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pioneer_hackathon
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys and configuration:

```env
# LiveKit Configuration
VITE_LIVEKIT_URL=wss://your-livekit-server.com
VITE_LIVEKIT_API_KEY=your_livekit_api_key
VITE_LIVEKIT_API_SECRET=your_livekit_api_secret

# LLM Configuration (Mistral)
VITE_MISTRAL_API_KEY=your_mistral_api_key
VITE_MISTRAL_MODEL=mistral-large-latest

# TTS Configuration (ElevenLabs)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# MCP Server URLs
VITE_MCP_AIRBNB_URL=http://localhost:8090/mcp
VITE_MCP_BRAVE_SEARCH_URL=http://localhost:8091/mcp
VITE_MCP_PERPLEXITY_URL=http://localhost:8092/mcp
VITE_MCP_GMAIL_URL=http://localhost:8093/mcp
VITE_MCP_GOOGLE_MAPS_URL=http://localhost:8094/mcp
VITE_MCP_FIRECRAWL_URL=http://localhost:8095/mcp
VITE_MCP_YOUTUBE_URL=http://localhost:8096/mcp

# Emergency Contact Configuration
VITE_EMERGENCY_PHONE=+1234567890
VITE_EMERGENCY_EMAIL=emergency@example.com
```

4. **Set up MCP Servers**

You'll need to run the MCP servers on different ports. Here's an example using Docker:

```bash
# Brave Search (Port 8091)
docker run -d -p 8091:8080 -e BRAVE_API_KEY=your_key mcp/brave-search

# Perplexity (Port 8092)
docker run -d -p 8092:8080 -e PERPLEXITY_API_KEY=your_key mcp/perplexity-ask

# Gmail (Port 8093)
docker run -d -p 8093:8080 \
  -e EMAIL_ADDRESS=your@gmail.com \
  -e EMAIL_PASSWORD=your_app_password \
  yashtekwani/gmail-mcp

# Google Maps (Port 8094)
docker run -d -p 8094:8080 -e GOOGLE_MAPS_API_KEY=your_key mcp/google-maps-comprehensive

# Firecrawl (Port 8095)
docker run -d -p 8095:8080 -e FIRECRAWL_API_KEY=your_key mcp/firecrawl

# YouTube (Port 8096)
docker run -d -p 8096:8080 mcp/youtube-transcript
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Testing on iPhone

1. **Connect to the same Wi-Fi network** as your development machine

2. **Find your local IP address**
   - On Windows: `ipconfig`
   - On Mac/Linux: `ifconfig` or `ip addr`

3. **Access the app on your iPhone**
   - Open Safari and navigate to `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`

4. **Enable permissions**
   - Motion & Orientation access
   - Microphone access
   - Location services

5. **Add to Home Screen** (for full-screen PWA experience)
   - Tap the Share button
   - Select "Add to Home Screen"

## Production Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

### Option 1: Vercel

```bash
npm i -g vercel
vercel
```

### Option 2: Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Option 3: Static Hosting

Deploy the `dist/` folder to any static hosting service:
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- Firebase Hosting

## Project Structure

```
pioneer_hackathon/
├── src/
│   ├── components/
│   │   ├── EmergencyAlert.jsx      # Emergency alert UI
│   │   └── VoiceInterface.jsx      # Voice assistant UI
│   ├── hooks/
│   │   └── useFallDetection.js     # Fall detection logic
│   ├── services/
│   │   ├── livekitService.js       # LiveKit integration
│   │   ├── mcpService.js           # MCP servers client
│   │   └── voiceAgentService.js    # Mistral + ElevenLabs
│   ├── App.jsx                     # Main app component
│   ├── App.css                     # App styles
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── public/                         # Static assets
├── index.html                      # HTML template
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
└── .env.example                    # Environment template
```

## Usage

### Fall Detection

1. Tap "Start Monitoring" to activate fall detection
2. The app monitors accelerometer data in real-time
3. If a fall is detected:
   - An emergency alert appears with a 10-second countdown
   - You can cancel if it's a false alarm
   - After countdown, emergency contacts are notified via WhatsApp and email
   - Your location is included in the alert

### Voice Assistant

1. Tap "Connect to Voice Agent" to start LiveKit session
2. Tap the microphone button and speak your request
3. The assistant will respond with voice using ElevenLabs
4. Available commands:
   - "Send a WhatsApp message to [number]"
   - "Search for [query] on the web"
   - "Check my emails"
   - "Send an email to [address]"
   - "Get directions to [place]"
   - "Find Airbnb listings in [location]"
   - "Get the transcript of [YouTube URL]"

## Security Considerations

- All API keys should be kept secret and never committed to version control
- Use environment variables for all sensitive data
- In production, implement a backend to handle API calls and token generation
- Never expose API keys in client-side code
- Consider implementing rate limiting for API calls

## Troubleshooting

### Fall detection not working on iPhone
- Ensure motion permissions are granted
- Use HTTPS in production (iOS requires secure context for Device Motion API)
- Some older iPhone models may have limited sensor support

### Voice assistant not responding
- Check microphone permissions
- Verify API keys are correct
- Ensure LiveKit server is running and accessible
- Check browser console for errors

### MCP servers not responding
- Verify all Docker containers are running
- Check port mappings are correct
- Ensure firewall allows connections to MCP ports
- Test MCP endpoints with curl or Postman

## License

MIT

## Disclaimer

This app is for demonstration purposes only. In case of a real emergency, always call emergency services directly (911 in the US, 112 in EU, etc.). The fall detection algorithm may produce false positives or miss actual falls. Do not rely on this app as your only safety measure.

## Support

For issues or questions, please open an issue on the GitHub repository.
