# MCP Servers Documentation

This repository includes 8 complete MCP server implementations, all self-contained and ready to use.

## Overview

All MCP servers are included directly in this repository. No external cloning required!

### Included MCP Servers

1. **WhatsApp MCP** - Python + Go
2. **Gmail MCP** - TypeScript
3. **Brave Search MCP** - TypeScript
4. **Firecrawl MCP** - TypeScript
5. **Google Maps MCP** - TypeScript
6. **YouTube Transcript MCP** - Python
7. **Perplexity MCP** - TypeScript
8. **Airbnb MCP** - Placeholder (to be implemented)

---

## 1. WhatsApp MCP Server

**Location**: `whatsapp-mcp/`
**Language**: Python + Go
**Port**: 8089

### Features
- Send text messages via WhatsApp Web
- Send images with captions
- Send audio messages
- QR code authentication
- Persistent session storage

### Setup
```bash
docker-compose up -d whatsapp
docker-compose logs -f whatsapp  # Scan QR code
```

### Tools
- `send_message` - Send text message
- `send_image` - Send image with caption
- `send_audio` - Send audio file

### Documentation
See [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md) for detailed setup instructions.

---

## 2. Gmail MCP Server

**Location**: `Gmail-MCP/`
**Language**: TypeScript
**Port**: 8093

### Features
- List recent emails
- Search emails
- Send emails
- Full IMAP/SMTP support

### Setup
```bash
# Configure in .env.docker
GMAIL_ADDRESS=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

docker-compose up -d gmail
```

### Tools
- `listMessages` - List recent messages
- `findMessage` - Search for messages
- `sendMessage` - Send email

### API Keys Required
- Gmail App Password (not your regular password)
- Enable 2FA on your Google account
- Generate app-specific password

---

## 3. Brave Search MCP Server

**Location**: `brave-search-mcp-server/`
**Language**: TypeScript
**Port**: 8091

### Features
- Web search
- Image search
- News search
- Video search
- Local search
- AI summarizer

### Setup
```bash
# Configure in .env.docker
BRAVE_API_KEY=your_brave_api_key

docker-compose up -d brave-search
```

### Tools
- `brave_web_search` - Web search
- `brave_image_search` - Image search
- `brave_news_search` - News search
- `brave_video_search` - Video search
- `brave_local_search` - Local business search
- `brave_summarizer` - AI-powered summaries

### API Keys Required
- Brave Search API key (free tier available)
- Get it at: https://brave.com/search/api/

---

## 4. Firecrawl MCP Server

**Location**: `firecrawl-mcp-server/`
**Language**: TypeScript
**Port**: 8095

### Features
- Web scraping
- Content extraction
- Site mapping
- Batch scraping
- Structured data extraction

### Setup
```bash
# Configure in .env.docker
FIRECRAWL_API_KEY=your_firecrawl_api_key

docker-compose up -d firecrawl
```

### Tools
- `firecrawl_scrape` - Scrape single URL
- `firecrawl_search` - Search and scrape
- `firecrawl_map` - Map website URLs
- `firecrawl_crawl` - Crawl entire site
- `firecrawl_extract` - Extract structured data

### API Keys Required
- Firecrawl API key
- Get it at: https://firecrawl.dev/

---

## 5. Google Maps Comprehensive MCP

**Location**: `google-maps-comprehensive-mcp/`
**Language**: TypeScript
**Port**: 8094

### Features
- Geocoding & reverse geocoding
- Places search
- Place details
- Directions
- Distance matrix
- Elevation data

### Setup
```bash
# Configure in .env.docker
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

docker-compose up -d google-maps
```

### Tools
- `maps_geocode` - Address to coordinates
- `maps_reverse_geocode` - Coordinates to address
- `maps_search_places` - Search for places
- `maps_place_details` - Get place information
- `maps_directions` - Get directions
- `maps_distance_matrix` - Calculate distances
- `maps_elevation` - Get elevation data
- `maps_ping` - Health check

### API Keys Required
- Google Maps API key
- Enable these APIs in Google Cloud Console:
  - Geocoding API
  - Places API
  - Directions API
  - Distance Matrix API
  - Elevation API

---

## 6. YouTube Transcript MCP Server

**Location**: `mcp-youtube-transcript/`
**Language**: Python
**Port**: 8096

### Features
- Get video transcripts
- Timed transcripts with timestamps
- Multi-language support
- Video information retrieval

### Setup
```bash
docker-compose up -d youtube
```

### Tools
- `get_transcript` - Get full transcript
- `get_timed_transcript` - Get transcript with timestamps
- `get_video_info` - Get video metadata

### No API Key Required
This server uses public YouTube data and doesn't require authentication.

---

## 7. Perplexity MCP Server

**Location**: `modelcontextprotocol/`
**Language**: TypeScript
**Port**: 8092

### Features
- AI-powered web research
- Real-time information
- Reasoning capabilities
- Citation-backed answers

### Setup
```bash
# Configure in .env.docker
PERPLEXITY_API_KEY=your_perplexity_api_key

docker-compose up -d perplexity
```

### Tools
- `perplexity_ask` - Ask questions
- `perplexity_research` - Deep research
- `perplexity_reason` - Reasoning tasks

### API Keys Required
- Perplexity API key
- Get it at: https://www.perplexity.ai/settings/api

---

## 8. Airbnb MCP Server

**Location**: Not implemented (placeholder)
**Port**: 8090

### Status
This is a placeholder. You can implement your own Airbnb MCP server or use an alternative accommodation search service.

### Alternative Solutions
- Use Google Maps Places API to find accommodations
- Integrate with Booking.com API
- Use TripAdvisor API

---

## Running All MCP Servers

### Using Docker Compose (Recommended)

1. **Configure environment variables**:
```bash
cp .env.docker.example .env.docker
# Edit .env.docker with your API keys
```

2. **Start all servers**:
```bash
docker-compose up -d
```

3. **Check status**:
```bash
docker-compose ps
```

4. **View logs**:
```bash
docker-compose logs -f
```

5. **Stop all servers**:
```bash
docker-compose down
```

### Individual Server Management

Start/stop individual servers:
```bash
# Start only WhatsApp
docker-compose up -d whatsapp

# Start only Gmail
docker-compose up -d gmail

# Stop WhatsApp
docker-compose stop whatsapp

# View WhatsApp logs
docker-compose logs -f whatsapp
```

---

## Port Mapping

| MCP Server | Port | Protocol |
|------------|------|----------|
| WhatsApp | 8089 | HTTP |
| Airbnb | 8090 | HTTP |
| Brave Search | 8091 | HTTP |
| Perplexity | 8092 | HTTP |
| Gmail | 8093 | HTTP |
| Google Maps | 8094 | HTTP |
| Firecrawl | 8095 | HTTP |
| YouTube | 8096 | HTTP |

---

## Environment Variables Reference

### Required for All
```bash
# No global environment variables required
```

### WhatsApp
```bash
WHATSAPP_PHONE_NUMBER=+1234567890
```

### Gmail
```bash
GMAIL_ADDRESS=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Brave Search
```bash
BRAVE_API_KEY=your_brave_api_key
BRAVE_MCP_TRANSPORT=stdio
```

### Perplexity
```bash
PERPLEXITY_API_KEY=your_perplexity_api_key
```

### Google Maps
```bash
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Firecrawl
```bash
FIRECRAWL_API_KEY=your_firecrawl_api_key
FIRECRAWL_API_URL=https://api.firecrawl.dev/v1
```

### YouTube
```bash
# No API key required
```

---

## Troubleshooting

### MCP Server Won't Start

1. **Check Docker is running**:
```bash
docker ps
```

2. **Check logs**:
```bash
docker-compose logs [service-name]
```

3. **Rebuild container**:
```bash
docker-compose build [service-name]
docker-compose up -d [service-name]
```

### API Authentication Errors

1. **Verify API keys** in `.env.docker`
2. **Check API key validity** on provider's dashboard
3. **Ensure no rate limits** exceeded

### Port Conflicts

If ports are already in use:
```bash
# Check what's using a port
netstat -ano | findstr :8089  # Windows
lsof -i :8089  # macOS/Linux

# Change port in docker-compose.yml
ports:
  - "8089:8000"  # Change 8089 to available port
```

---

## Development

### Local Development (Without Docker)

Each MCP server can be run locally for development:

#### TypeScript Servers
```bash
cd [server-directory]
npm install
npm run build
npm start
```

#### Python Servers
```bash
cd [server-directory]
pip install -r requirements.txt
python main.py
```

### Building Custom MCP Servers

See individual server README files for development instructions:
- `Gmail-MCP/README.md`
- `brave-search-mcp-server/README.md`
- `firecrawl-mcp-server/README.md`
- `google-maps-comprehensive-mcp/README.md`
- `mcp-youtube-transcript/README.md`
- `whatsapp-mcp/README.md`

---

## Security Best Practices

### Do's ✅
- Store API keys in environment variables
- Use `.env.docker` for local development
- Use secrets management in production (AWS Secrets, etc.)
- Rotate API keys regularly
- Monitor API usage
- Set up rate limiting

### Don'ts ❌
- Don't commit API keys to git
- Don't share `.env.docker` files
- Don't expose MCP servers to public internet without authentication
- Don't use production API keys in development
- Don't hardcode sensitive data

---

## API Key Resources

### Free Tier Available
- **Brave Search**: https://brave.com/search/api/
- **YouTube**: No API key needed
- **Gmail**: Free with Google account

### Paid/Limited Free Tier
- **Perplexity**: https://www.perplexity.ai/settings/api
- **Google Maps**: https://console.cloud.google.com/
- **Firecrawl**: https://firecrawl.dev/

### Custom Implementation Needed
- **WhatsApp**: Uses WhatsApp Web (Terms of Service apply)
- **Airbnb**: No official API (implement custom solution)

---

## Contributing

To add a new MCP server to this repository:

1. Create a new directory: `your-mcp-server/`
2. Add implementation files
3. Create a Dockerfile
4. Add service to `docker-compose.yml`
5. Update this documentation
6. Add environment variables to `.env.docker.example`
7. Test locally before committing

---

## License

Each MCP server may have its own license. Check individual directories for LICENSE files.

The main Fall Detection Voice Agent application is MIT licensed.

---

## Support

For issues with specific MCP servers:
- Check the server's README in its directory
- Check Docker logs: `docker-compose logs [service-name]`
- Verify API keys and environment variables
- Check the official MCP server repository for updates

For issues with the Fall Detection app integration:
- See main [README.md](./README.md)
- Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- Review [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)

---

**Last Updated**: 2025-11-15
**Total MCP Servers**: 8 (7 implemented + 1 placeholder)
**Total Files**: 191
