# Cloud Run + Local WhatsApp Bridge Setup with ngrok

This guide explains how to run WhatsApp bridge locally with ngrok and deploy MCP servers to Google Cloud Run.

## Architecture

```
[iPhone App]
    ↓
[Cloud Run: WhatsApp MCP Server] ← Port 8089
    ↓ (via ngrok)
[Local: WhatsApp Bridge] ← Port 8082
    ↓
[WhatsApp Web]
```

## Prerequisites

- Google Cloud account with Cloud Run enabled
- ngrok account (free tier works)
- Local machine running WhatsApp bridge
- gcc installed (TDM-GCC on Windows)

---

## Part 1: Setup WhatsApp Bridge Locally

### Step 1: Run WhatsApp Bridge

The bridge now runs on **port 8082** (avoiding port 8080 conflict).

**Open PowerShell** (close and reopen if you just installed gcc):

```powershell
cd E:\pioneer_hackathon\whatsapp-mcp\whatsapp-bridge
gcc --version  # Verify gcc is available
go run main.go
```

You should see:
```
🚀 WhatsApp bridge is starting...
Starting REST API server on :8082...
```

**Scan the QR code** with your WhatsApp mobile app.

---

## Part 2: Setup ngrok

### Step 1: Install ngrok

**Download**: https://ngrok.com/download

Or use direct link:
```powershell
# Download to Downloads folder, then extract
```

### Step 2: Sign up and Authenticate

1. Create account at: https://dashboard.ngrok.com/signup
2. Get authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
3. Authenticate ngrok:

```powershell
ngrok authtoken YOUR_AUTHTOKEN_HERE
```

### Step 3: Start ngrok Tunnel

**Open a NEW PowerShell window** (keep the bridge running in the first one):

```powershell
ngrok http 8082
```

You'll see output like:
```
ngrok

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:8082

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the Forwarding URL** (e.g., `https://abc123xyz.ngrok-free.app`)

---

## Part 3: Deploy MCP Server to Cloud Run

### Step 1: Prepare WhatsApp MCP Server for Cloud Run

The WhatsApp MCP server is in: `whatsapp-mcp/whatsapp-mcp-server/`

Check the Dockerfile exists:
```powershell
ls whatsapp-mcp/whatsapp-mcp-server/Dockerfile
```

### Step 2: Configure Environment Variables

Edit `.env.cloudrun` and add your ngrok URL:

```bash
WHATSAPP_BRIDGE_URL=https://abc123xyz.ngrok-free.app
WHATSAPP_PHONE_NUMBER=+1234567890
GMAIL_ADDRESS=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
# ... other API keys
```

### Step 3: Deploy to Cloud Run

**Option A: Using gcloud CLI**

```bash
# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Deploy WhatsApp MCP Server
cd whatsapp-mcp/whatsapp-mcp-server

gcloud run deploy whatsapp-mcp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars WHATSAPP_BRIDGE_URL=https://abc123xyz.ngrok-free.app \
  --set-env-vars WHATSAPP_PHONE_NUMBER=+1234567890
```

**Option B: Using Google Cloud Console**

1. Go to: https://console.cloud.google.com/run
2. Click **"Create Service"**
3. Select **"Continuously deploy from a repository"** or **"Deploy one revision from an existing container image"**
4. Configure:
   - **Container image URL**: Build from source
   - **Source location**: Upload `whatsapp-mcp/whatsapp-mcp-server/`
   - **Region**: us-central1
   - **Authentication**: Allow unauthenticated invocations
5. **Environment Variables**:
   - Click **"Variables & Secrets"** → **"Add Variable"**
   - Add each variable from `.env.cloudrun`:
     ```
     WHATSAPP_BRIDGE_URL = https://abc123xyz.ngrok-free.app
     WHATSAPP_PHONE_NUMBER = +1234567890
     GMAIL_ADDRESS = your-email@gmail.com
     GMAIL_APP_PASSWORD = your_app_password
     ```
6. Click **"Create"**

### Step 4: Get Cloud Run URL

After deployment, you'll get a URL like:
```
https://whatsapp-mcp-abc123-uc.a.run.app
```

**Copy this URL** - you'll use it in your frontend app.

---

## Part 4: Deploy Other MCP Servers to Cloud Run

You can deploy the other MCP servers similarly:

### Gmail MCP Server

```bash
cd Gmail-MCP

gcloud run deploy gmail-mcp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GMAIL_ADDRESS=your@gmail.com \
  --set-env-vars GMAIL_APP_PASSWORD=your_password
```

### Brave Search MCP Server

```bash
cd brave-search-mcp-server

gcloud run deploy brave-search-mcp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars BRAVE_API_KEY=your_api_key
```

### Google Maps MCP Server

```bash
cd google-maps-comprehensive-mcp

gcloud run deploy google-maps-mcp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_MAPS_API_KEY=your_api_key
```

---

## Part 5: Update Frontend Configuration

Update your frontend `.env` file with Cloud Run URLs:

```bash
# Frontend .env
VITE_MISTRAL_API_KEY=your_mistral_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_EMERGENCY_PHONE=+1234567890
VITE_EMERGENCY_EMAIL=emergency@example.com

# MCP Server URLs (Cloud Run)
VITE_WHATSAPP_MCP_URL=https://whatsapp-mcp-abc123-uc.a.run.app
VITE_GMAIL_MCP_URL=https://gmail-mcp-abc123-uc.a.run.app
VITE_BRAVE_MCP_URL=https://brave-search-mcp-abc123-uc.a.run.app
VITE_GOOGLE_MAPS_MCP_URL=https://google-maps-mcp-abc123-uc.a.run.app
# ... other MCP URLs
```

---

## Environment Variables Summary

### Local WhatsApp Bridge
- **No environment variables needed**
- Runs on port 8082
- Accessible via ngrok

### Cloud Run WhatsApp MCP Server
```
WHATSAPP_BRIDGE_URL=https://your-ngrok-url.ngrok-free.app
WHATSAPP_PHONE_NUMBER=+1234567890
```

### Cloud Run Gmail MCP Server
```
GMAIL_ADDRESS=your@gmail.com
GMAIL_APP_PASSWORD=your_app_password
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Cloud Run Brave Search MCP Server
```
BRAVE_API_KEY=your_api_key
```

### Cloud Run Google Maps MCP Server
```
GOOGLE_MAPS_API_KEY=your_api_key
```

---

## Running the Complete Setup

### Terminal 1: WhatsApp Bridge
```powershell
cd E:\pioneer_hackathon\whatsapp-mcp\whatsapp-bridge
go run main.go
```

### Terminal 2: ngrok
```powershell
ngrok http 8082
```

### Terminal 3: Frontend Dev Server
```powershell
cd E:\pioneer_hackathon
npm run dev
```

---

## Monitoring and Troubleshooting

### Check ngrok Traffic
Open: http://127.0.0.1:4040

This shows all HTTP requests going through ngrok.

### Check Cloud Run Logs
```bash
gcloud run services logs read whatsapp-mcp --region us-central1
```

Or in Console: https://console.cloud.google.com/run

### Test WhatsApp Bridge
```bash
# Test health endpoint
curl https://your-ngrok-url.ngrok-free.app/api/health
```

### Test Cloud Run MCP Server
```bash
# Test WhatsApp MCP
curl https://whatsapp-mcp-abc123-uc.a.run.app/health
```

---

## Cost Considerations

### Free Tier

**ngrok Free:**
- URL changes every restart
- 2-hour session limit
- Need to update Cloud Run env vars after each restart

**Cloud Run Free Tier:**
- 2 million requests/month
- 360,000 GB-seconds
- 180,000 vCPU-seconds

### Production (Recommended)

**ngrok Pro ($10/month):**
- Reserved domain (e.g., `yourapp.ngrok.io`)
- No session timeout
- Set once in Cloud Run

**Cloud Run:**
- Pay per use
- Auto-scales to zero
- ~$0.10/day for low traffic

---

## Security Best Practices

### ngrok
- Don't share ngrok URLs publicly
- Use ngrok IP restrictions (paid plan)
- Rotate URLs regularly (free tier)

### Cloud Run
- Use Secret Manager for API keys
- Enable authentication for sensitive endpoints
- Set up VPC for private networking

### WhatsApp Bridge
- Keep session data (`store/`) secure
- Regular backups of session data
- Monitor for unusual activity

---

## Updating ngrok URL

When ngrok restarts (free tier), you need to update the URL:

### Step 1: Get New ngrok URL
```powershell
ngrok http 8082
# Copy new URL
```

### Step 2: Update Cloud Run
```bash
gcloud run services update whatsapp-mcp \
  --region us-central1 \
  --set-env-vars WHATSAPP_BRIDGE_URL=https://NEW_URL.ngrok-free.app
```

Or in Console:
1. Go to Cloud Run service
2. Click **"Edit & Deploy New Revision"**
3. Update `WHATSAPP_BRIDGE_URL` variable
4. Click **"Deploy"**

---

## Alternative: Deploy Both on Cloud (No ngrok)

If you want to avoid ngrok, deploy the WhatsApp bridge to Cloud Run too:

### Create Cloud Run Service for Bridge

```bash
cd whatsapp-mcp/whatsapp-bridge

gcloud run deploy whatsapp-bridge \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Update WhatsApp MCP Server
```bash
# Use internal Cloud Run URL
WHATSAPP_BRIDGE_URL=https://whatsapp-bridge-abc123-uc.a.run.app
```

**Note**: You'll need to authenticate WhatsApp by viewing Cloud Run logs for QR code, or implement a web interface for QR scanning.

---

## Support

For issues:
- ngrok: https://ngrok.com/docs
- Cloud Run: https://cloud.google.com/run/docs
- WhatsApp MCP: See [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)

---

**Last Updated**: 2025-11-15
**Version**: 1.0.0
