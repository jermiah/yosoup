# Quick Cloud Run Setup Guide

## Step-by-Step Instructions

### 1. Run WhatsApp Bridge Locally

**Terminal 1:**
```powershell
cd E:\pioneer_hackathon\whatsapp-mcp\whatsapp-bridge
go run main.go
```

✅ Scan QR code with WhatsApp
✅ Bridge runs on port 8082

---

### 2. Start ngrok

**Terminal 2:**
```powershell
ngrok http 8082
```

✅ Copy the Forwarding URL (e.g., `https://abc123xyz.ngrok-free.app`)

---

### 3. Deploy WhatsApp MCP to Cloud Run

**In Google Cloud Console:**

1. Go to: https://console.cloud.google.com/run
2. Click **"Create Service"**
3. Settings:
   - **Service name**: `whatsapp-mcp`
   - **Region**: `us-central1`
   - **Source**: Upload `whatsapp-mcp/whatsapp-mcp-server/` folder
   - **Port**: `8000`
   - **Authentication**: Allow unauthenticated

4. **Environment Variables** (click "Variables & Secrets"):
   ```
   WHATSAPP_BRIDGE_URL = https://abc123xyz.ngrok-free.app
   WHATSAPP_PHONE_NUMBER = +1234567890
   ```

5. Click **"Create"**

6. **Copy the Cloud Run URL**: `https://whatsapp-mcp-xxxxx-uc.a.run.app`

---

### 4. Deploy Other MCP Servers (Optional)

Repeat for each MCP server:

**Gmail MCP:**
- Folder: `Gmail-MCP/`
- Env vars: `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD`

**Brave Search MCP:**
- Folder: `brave-search-mcp-server/`
- Env vars: `BRAVE_API_KEY`

**Google Maps MCP:**
- Folder: `google-maps-comprehensive-mcp/`
- Env vars: `GOOGLE_MAPS_API_KEY`

**Perplexity MCP:**
- Folder: `modelcontextprotocol/`
- Env vars: `PERPLEXITY_API_KEY`

**Firecrawl MCP:**
- Folder: `firecrawl-mcp-server/`
- Env vars: `FIRECRAWL_API_KEY`

**YouTube MCP:**
- Folder: `mcp-youtube-transcript/`
- No env vars needed

---

### 5. Update Frontend Configuration

Create/edit `E:\pioneer_hackathon\.env`:

```bash
# Mistral & ElevenLabs
VITE_MISTRAL_API_KEY=your_mistral_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key

# Emergency contacts
VITE_EMERGENCY_PHONE=+1234567890
VITE_EMERGENCY_EMAIL=emergency@example.com

# Cloud Run MCP Server URLs
VITE_WHATSAPP_MCP_URL=https://whatsapp-mcp-xxxxx-uc.a.run.app
VITE_GMAIL_MCP_URL=https://gmail-mcp-xxxxx-uc.a.run.app
VITE_BRAVE_MCP_URL=https://brave-mcp-xxxxx-uc.a.run.app
VITE_GOOGLE_MAPS_MCP_URL=https://google-maps-mcp-xxxxx-uc.a.run.app
VITE_PERPLEXITY_MCP_URL=https://perplexity-mcp-xxxxx-uc.a.run.app
VITE_FIRECRAWL_MCP_URL=https://firecrawl-mcp-xxxxx-uc.a.run.app
VITE_YOUTUBE_MCP_URL=https://youtube-mcp-xxxxx-uc.a.run.app
```

---

### 6. Run Frontend

**Terminal 3:**
```powershell
cd E:\pioneer_hackathon
npm install
npm run dev
```

Open: http://localhost:3000

---

## Environment Variable Locations

### ❌ NOT Needed Locally
- `.env.docker` - Only for Docker deployment
- `.env.docker.example` - Template only

### ✅ What You Need

**1. `.env.cloudrun`** - Template for Cloud Run env vars
   - Edit with your ngrok URL
   - Copy values to Cloud Run Console

**2. `.env`** - Frontend configuration
   - Add Mistral, ElevenLabs API keys
   - Add Cloud Run MCP URLs

**3. WhatsApp Bridge** - No env file needed
   - Runs on port 8082
   - No configuration required

---

## Where to Add ngrok URL

### ✅ Correct Location: Cloud Run Environment Variables

**In Google Cloud Console:**
1. Go to your WhatsApp MCP service
2. Click **"Edit & Deploy New Revision"**
3. Go to **"Variables & Secrets"** tab
4. Find or add variable:
   - **Name**: `WHATSAPP_BRIDGE_URL`
   - **Value**: `https://your-ngrok-url.ngrok-free.app`
5. Click **"Deploy"**

### ❌ Wrong Locations:
- Don't add to `.env.docker` (not used in Cloud Run)
- Don't add to frontend `.env` (frontend doesn't need bridge URL)
- Don't add to local bridge code (bridge doesn't need its own URL)

---

## Quick Reference

| Component | Location | Port | URL |
|-----------|----------|------|-----|
| WhatsApp Bridge | Local | 8082 | http://localhost:8082 |
| ngrok Tunnel | Local | - | https://abc123.ngrok-free.app |
| WhatsApp MCP | Cloud Run | 8000 | https://whatsapp-mcp-xxx.run.app |
| Gmail MCP | Cloud Run | 8000 | https://gmail-mcp-xxx.run.app |
| Frontend | Local | 3000 | http://localhost:3000 |

---

## Troubleshooting

### ngrok URL Changes
**Problem**: Free ngrok URL expires

**Solution**:
1. Get new URL from ngrok terminal
2. Update Cloud Run env var `WHATSAPP_BRIDGE_URL`
3. Redeploy Cloud Run service

### WhatsApp Not Connecting
**Problem**: Bridge can't connect

**Solution**:
1. Check bridge is running: http://localhost:8082/api/health
2. Check ngrok is forwarding: http://127.0.0.1:4040
3. Check Cloud Run logs for errors

### MCP Server Errors
**Problem**: Cloud Run service failing

**Solution**:
1. Check Cloud Run logs in Console
2. Verify environment variables are set
3. Check Dockerfile exists in source folder

---

**Need detailed setup?** See [CLOUD_RUN_NGROK_SETUP.md](./CLOUD_RUN_NGROK_SETUP.md)
