# Changelog

## [1.0.0] - 2025-11-15

### Initial Release

**Fall Detection Voice Agent** - A comprehensive iPhone web app combining fall detection with AI-powered voice assistance.

### Features Added

#### Fall Detection System
- Real-time accelerometer monitoring using Device Motion API
- Intelligent fall pattern detection (free-fall + impact + inactivity)
- iOS 13+ permission handling
- GPS location tracking
- 10-second emergency alert countdown with cancellation option

#### Voice Assistant
- LiveKit integration for real-time voice communication
- Mistral LLM for natural language understanding
- ElevenLabs text-to-speech for natural voice responses
- Web Speech API for speech-to-text

#### MCP Server Integrations (7 servers)
1. **Brave Search** - Web, image, news, and video search
2. **Perplexity** - AI-powered research and Q&A
3. **Gmail** - Email management and sending
4. **Google Maps** - Geocoding, directions, places search
5. **Firecrawl** - Web scraping and content extraction
6. **YouTube** - Video transcripts and information
7. **Airbnb** - Accommodation search (placeholder)

#### Emergency Response
- Email alerts via Gmail MCP
- Location sharing with Google Maps link
- Voice announcements of fall detection

#### UI/UX
- iPhone-optimized design with safe area support
- Dark mode interface
- Real-time acceleration display
- Responsive layout for mobile

#### Infrastructure
- Docker Compose configuration for all MCP servers
- LiveKit token generation server
- Deployment configurations for:
  - Vercel
  - Netlify
  - AWS S3 + CloudFront
  - Google Cloud Run
  - Kubernetes

### Removed
- **WhatsApp MCP integration** - Removed as the MCP server doesn't exist yet
  - Removed from `docker-compose.yml`
  - Removed from `.env.example` and `.env.docker.example`
  - Removed `sendWhatsAppMessage` method from `mcpService.js`
  - Updated `EmergencyAlert.jsx` to only send email alerts

### Technical Stack
- **Frontend**: React 18 + Vite
- **Voice**: LiveKit Client, Web Speech API
- **AI**: Mistral LLM, ElevenLabs TTS
- **Sensors**: Device Motion API, Geolocation API
- **MCP**: 7 different MCP servers for various integrations
- **Styling**: Custom CSS with iOS optimizations

### Documentation
- Comprehensive README with setup instructions
- Detailed DEPLOYMENT guide for multiple platforms
- Environment variable templates
- Docker Compose setup guide

### Notes
- Requires HTTPS for production (Device Motion API requirement)
- All API keys must be configured before use
- Emergency features are for demonstration purposes only
- Always call emergency services directly in real emergencies
