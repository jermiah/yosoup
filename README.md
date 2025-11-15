# EcoCare - AI-Powered Voice Assistant for the Visually Impaired

> **Built in 5 hours. Designed for independence. Powered by voice.**

AI should be accessible to everyone. EcoCare is an edge device that combines fall detection with voice-driven AI agents, giving blind and visually-impaired users the same independence we enjoy every day.

---

## 🌟 Vision

There are more than eight billion people in the world, each with a different way of interacting with information. **AI should adapt to all of them, not the other way around.**

Our responsibility is to build technology that includes everyone. This project is a step toward making AI a responsible presence in daily life, especially for people with disabilities.

---

## ✨ Features

### 🎤 Voice-Driven AI Agents

With nothing but their voice, users can:

- **📱 WhatsApp Messaging** - Send and receive messages hands-free
- **📧 Gmail Management** - Read emails, compose, and send
- **🤖 Generative AI** - Ask questions to Mistral LLM
- **🔍 Internet Search** - Powered by Brave Search
- **📹 YouTube Summaries** - Get video transcripts and summaries
- **📍 Location Services** - Check current location via Google Maps
- **🗺️ Nearby Places** - Explore restaurants, shops, and services
- **🏠 Airbnb Bookings** - Book accommodations through voice alone

### 🛡️ Safety & Independence

- **⚠️ Fall Detection** - Accelerometer-based automatic detection
- **🚨 Emergency Alerts** - Automatic SOS to emergency contacts via WhatsApp & Email
- **📄 Legal Document Assistant** - Highlights key points in contracts to prevent exploitation
- **🌐 Complete Independence** - Travel, communicate, and learn without assistance

---

## 🏗️ Tech Stack

### Frontend
- **React 18.3** - Modern, accessible UI
- **Vite 6.0** - Lightning-fast development
- **LiveKit Client** - Real-time voice communication
- **Device Motion API** - Accelerometer access for fall detection

### AI & Voice
- **Mistral LLM** (`mistral-large-latest`) - Natural language understanding
- **ElevenLabs** - High-quality text-to-speech
- **Web Speech API** - Speech recognition

### MCP Servers (8 Total)
1. **WhatsApp MCP** - Python + Go with WhatsApp Web integration
2. **Gmail MCP** - TypeScript with IMAP/SMTP
3. **Brave Search MCP** - TypeScript web search
4. **Perplexity MCP** - AI-powered research
5. **Google Maps MCP** - Location and places API
6. **Firecrawl MCP** - Web scraping and content extraction
7. **YouTube Transcript MCP** - Video transcript retrieval
8. **Airbnb MCP** - Accommodation booking

### Infrastructure
- **Google Cloud Run** - Serverless MCP server hosting
- **ngrok** - Secure tunnel for WhatsApp bridge
- **Docker** - Containerized deployment
- **FastAPI** - REST API for MCP servers

---

## 🎯 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        iPhone Device                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Accelerometer (Fall Detection)                      │   │
│  │  • Monitors motion continuously                      │   │
│  │  • Detects free-fall + impact patterns              │   │
│  │  • Triggers 10-second emergency countdown           │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Voice Interface (LiveKit + Speech Recognition)      │   │
│  │  • User speaks commands                              │   │
│  │  • Mistral LLM processes intent                      │   │
│  │  • Routes to appropriate MCP server                  │   │
│  │  • ElevenLabs speaks response                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Cloud Run MCP Servers                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ WhatsApp   │  │   Gmail    │  │   Brave    │  ...       │
│  │    MCP     │  │    MCP     │  │  Search    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              ngrok → WhatsApp Bridge (Local)                 │
│  • Maintains WhatsApp Web connection                         │
│  • Stores session data securely                              │
│  • Exposes API via ngrok tunnel                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (for frontend)
- **Docker & Docker Compose** (for MCP servers)
- **Go 1.25+** (for WhatsApp bridge)
- **gcc/TDM-GCC** (Windows) for building WhatsApp bridge
- **iPhone** (for accelerometer and voice input)
- **Google Cloud account** (for Cloud Run deployment)

### 1. Clone Repository

```bash
git clone https://github.com/jermiah/yosoup.git
cd yosoup
```

### 2. Setup WhatsApp Bridge

```bash
cd whatsapp-mcp/whatsapp-bridge
go run main.go
```

Scan the QR code with WhatsApp mobile app.

### 3. Setup ngrok

```bash
ngrok http 8082
# Copy the forwarding URL (e.g., https://abc123.ngrok-free.app)
```

### 4. Deploy MCP Servers to Cloud Run

```bash
gcloud run deploy whatsapp-mcp \
  --source ./whatsapp-mcp/whatsapp-mcp-server \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars WHATSAPP_BRIDGE_URL=https://your-ngrok-url.ngrok-free.app
```

Repeat for other MCP servers (Gmail, Brave Search, etc.).

### 5. Configure Frontend

Create `.env`:

```bash
VITE_MISTRAL_API_KEY=your_mistral_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_EMERGENCY_PHONE=+1234567890
VITE_EMERGENCY_EMAIL=emergency@example.com

# Cloud Run MCP URLs
VITE_WHATSAPP_MCP_URL=https://whatsapp-mcp-xxxxx-uc.a.run.app
VITE_GMAIL_MCP_URL=https://gmail-mcp-xxxxx-uc.a.run.app
# ... other MCP URLs
```

### 6. Run Frontend

```bash
npm install
npm run dev
```

### 7. Test on iPhone

1. Connect iPhone to same Wi-Fi
2. Get your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Open Safari on iPhone: `http://YOUR_IP:3000`
4. Grant permissions (Motion, Microphone, Location)
5. Add to Home Screen for full-screen experience

---

## 📱 Usage Examples

### Voice Commands

**WhatsApp:**
```
"Send a WhatsApp message to John saying I'll be there in 10 minutes"
```

**Gmail:**
```
"Read my latest emails"
"Send an email to boss@company.com about the meeting"
```

**Web Search:**
```
"Search for Italian restaurants near me"
"What's the weather today?"
```

**YouTube:**
```
"Summarize the latest video from TechCrunch"
```

**Location:**
```
"Where am I right now?"
"Find coffee shops nearby"
```

**Airbnb:**
```
"Find Airbnb listings in San Francisco for next weekend"
```

### Fall Detection

1. Device monitors accelerometer continuously
2. Detects free-fall pattern (< 0.6g) followed by impact (> 3.2g)
3. Shows 10-second countdown with cancel option
4. If not cancelled, sends emergency alerts:
   - WhatsApp message to emergency contact
   - Email to emergency contact
   - Includes location and timestamp

---

## 🏗️ Architecture

### Frontend (React + Vite)

```
src/
├── hooks/
│   └── useFallDetection.js       # Accelerometer monitoring
├── services/
│   ├── livekitService.js         # Voice communication
│   └── mcpService.js             # MCP server client
├── components/
│   ├── EmergencyAlert.jsx        # Fall detection UI
│   ├── VoiceInterface.jsx        # Voice assistant UI
│   └── PermissionsHandler.jsx    # iOS permissions
└── App.jsx
```

### MCP Servers (Cloud Run)

```
whatsapp-mcp/           # WhatsApp messaging
Gmail-MCP/              # Email management
brave-search-mcp/       # Web search
modelcontextprotocol/   # Perplexity AI
google-maps-mcp/        # Location services
firecrawl-mcp/          # Web scraping
mcp-youtube-transcript/ # YouTube summaries
mcp-server-airbnb/      # Accommodation booking
```

### WhatsApp Bridge (Local + ngrok)

```
whatsapp-mcp/whatsapp-bridge/
├── main.go              # WhatsApp Web client
├── store/               # Session persistence
└── Dockerfile           # Container config
```

---

## 🎬 Demo Flow

1. **User wears device** - iPhone in pocket or bag
2. **User speaks**: *"Send WhatsApp to Mom saying I arrived safely"*
3. **Device processes**:
   - Speech recognition captures command
   - Mistral LLM extracts intent: `send_whatsapp(to="Mom", message="I arrived safely")`
   - Routes to WhatsApp MCP server on Cloud Run
   - MCP calls bridge via ngrok
   - Bridge sends WhatsApp message
4. **Device responds**: *"Message sent to Mom"* (via ElevenLabs TTS)

**Fall Detection:**
1. User trips and falls
2. Accelerometer detects free-fall + impact
3. 10-second countdown begins: *"Fall detected! Press cancel if you're okay"*
4. If no response, emergency alerts sent automatically
5. WhatsApp & Email sent with location: *"🚨 EMERGENCY: Fall detected at [GPS coordinates]"*

---

## 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- **[Cloud Run Setup](./CLOUD_RUN_NGROK_SETUP.md)** - Deploy MCP servers to Cloud
- **[WhatsApp Setup](./WHATSAPP_SETUP.md)** - Configure WhatsApp integration
- **[ngrok Setup](./NGROK_SETUP.md)** - Remote access configuration
- **[MCP Servers](./MCP_SERVERS.md)** - All 8 server implementations
- **[Cloud Run Fix](./CLOUD_RUN_FIX.md)** - Troubleshooting deployment issues
- **[Next Steps](./NEXT_STEPS.md)** - Complete setup checklist

---

## 🗺️ Roadmap

### Phase 1: Core Functionality ✅
- [x] Fall detection with accelerometer
- [x] Voice interface with LiveKit
- [x] WhatsApp integration
- [x] Gmail integration
- [x] Web search capabilities
- [x] Emergency alert system

### Phase 2: Enhanced Safety 🚧
- [ ] Multi-contact emergency cascade
- [ ] Location tracking history
- [ ] Medical information quick access
- [ ] Fall pattern analysis
- [ ] False positive reduction

### Phase 3: Expanded Services 📋
- [ ] Uber/Lyft ride booking
- [ ] Food delivery ordering
- [ ] Calendar management
- [ ] Medication reminders
- [ ] News briefings

### Phase 4: Community & Learning 🌱
- [ ] Peer-to-peer assistance network
- [ ] Educational content library
- [ ] Skill-building tutorials
- [ ] Community forum integration
- [ ] Volunteer connection system

### Phase 5: Advanced AI 🤖
- [ ] Context-aware responses
- [ ] Proactive suggestions
- [ ] Habit learning
- [ ] Personalized voice profiles
- [ ] Multi-language support

---

## 🔒 Security & Privacy

- **Local Processing**: Fall detection runs on-device
- **Encrypted Sessions**: WhatsApp uses end-to-end encryption
- **No Data Storage**: Voice commands not logged
- **User Control**: Emergency alerts require confirmation
- **Session Persistence**: WhatsApp sessions stored locally only

---

## ⚠️ Important Disclaimers

### For Development/Demo Only

This application is for demonstration purposes. In real emergencies:
- ✅ Call emergency services directly (911, 112, etc.)
- ✅ Don't rely solely on automated systems
- ✅ Test thoroughly before actual use
- ✅ Inform emergency contacts about the system

### WhatsApp Terms of Service

This implementation uses WhatsApp Web protocol for personal use. For production/business use, consider:
- [WhatsApp Business API](https://business.whatsapp.com/products/business-api) (official)
- [Twilio WhatsApp Business API](https://www.twilio.com/whatsapp)

### Accessibility Compliance

While designed for accessibility, this project:
- Requires iOS 13+ for Device Motion API
- Needs stable internet connection
- Requires API keys (some paid services)
- Best used as supplementary tool, not primary safety device

---

## 🤝 Contributing

We welcome contributions! This project aims to make AI accessible to everyone.

**Priority areas:**
- Improving fall detection accuracy
- Adding more language support
- Enhancing voice recognition
- Expanding MCP server integrations
- Documentation improvements

**How to contribute:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details.

Individual MCP servers may have their own licenses. Check respective directories.

---

## 🙏 Acknowledgments

Built with:
- **Mistral AI** - LLM for natural language understanding
- **ElevenLabs** - Text-to-speech synthesis
- **LiveKit** - Real-time voice communication
- **whatsmeow** - WhatsApp Web client library
- **MCP Community** - Model Context Protocol servers

---

## 📞 Support

- **Issues**: https://github.com/jermiah/yosoup/issues
- **Discussions**: https://github.com/jermiah/yosoup/discussions
- **Documentation**: See docs folder for detailed guides

---

## 💡 The Bigger Picture

This project is about more than code. It's about **responsibility**.

Technology should:
- ✅ **Include everyone**, not just the majority
- ✅ **Adapt to users**, not force adaptation
- ✅ **Empower independence**, not create dependency
- ✅ **Respect dignity**, not exploit vulnerability

When we build AI, we're not just writing algorithms. We're shaping how billions of people interact with information, communicate with loved ones, and navigate their world.

**AI should be accessible to everyone. This is our step toward that future.**

---

**Built in 5 hours during a hackathon.**
**Designed to last a lifetime.**

---

**Repository**: https://github.com/jermiah/yosoup
**Version**: 1.0.0
**Last Updated**: 2025-11-15

Made with ❤️ for accessibility and independence.
