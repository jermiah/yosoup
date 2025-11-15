# Next Steps - Your Setup Guide

## ✅ What's Done

1. ✅ gcc (TDM-GCC) installed at `C:\TDM-GCC-64\bin`
2. ✅ gcc added to Windows PATH
3. ✅ WhatsApp bridge modified to run on port 8082
4. ✅ Docker containers stopped
5. ✅ Run script created: `run-bridge.bat`
6. ✅ Cloud Run documentation created

---

## 🚀 What You Need to Do Now

### Step 1: Close and Reopen PowerShell

**IMPORTANT**: Close your current PowerShell/terminal and open a new one so the PATH changes take effect.

---

### Step 2: Run WhatsApp Bridge

**In new PowerShell Terminal 1:**

```powershell
cd E:\pioneer_hackathon\whatsapp-mcp\whatsapp-bridge
.\run-bridge.bat
```

OR simply:

```powershell
cd E:\pioneer_hackathon\whatsapp-mcp\whatsapp-bridge
go run main.go
```

**You should see:**
```
🚀 WhatsApp bridge is starting...
Starting REST API server on :8082...
```

**Then a QR code appears** → Scan it with WhatsApp on your phone

---

### Step 3: Install and Setup ngrok

1. **Download ngrok**: https://ngrok.com/download
2. **Extract** the zip file
3. **Sign up**: https://dashboard.ngrok.com/signup
4. **Get authtoken**: https://dashboard.ngrok.com/get-started/your-authtoken
5. **Authenticate**:
   ```powershell
   ngrok authtoken YOUR_AUTHTOKEN
   ```

---

### Step 4: Start ngrok

**In PowerShell Terminal 2:**

```powershell
ngrok http 8082
```

**Copy the Forwarding URL**, for example:
```
https://abc123xyz.ngrok-free.app
```

---

### Step 5: Deploy WhatsApp MCP to Cloud Run

Go to Google Cloud Console: https://console.cloud.google.com/run

**Create Service:**
1. Click **"Create Service"**
2. **Container** → Select "Continuously deploy from source"
3. **Source location** → Upload folder: `E:\pioneer_hackathon\whatsapp-mcp\whatsapp-mcp-server\`
4. **Service name**: `whatsapp-mcp`
5. **Region**: `us-central1`
6. **Allow unauthenticated invocations**: ✅ Yes

**Environment Variables:**
Click "Variables & Secrets" and add:

| Name | Value |
|------|-------|
| `WHATSAPP_BRIDGE_URL` | `https://abc123xyz.ngrok-free.app` (your ngrok URL) |
| `WHATSAPP_PHONE_NUMBER` | `+1234567890` (your phone number) |

7. Click **"Create"**

**Copy the Cloud Run URL**: `https://whatsapp-mcp-xxxxx-uc.a.run.app`

---

### Step 6: Deploy Other MCP Servers to Cloud Run (Optional)

Repeat the process for each MCP server you need:

#### Gmail MCP
- **Folder**: `E:\pioneer_hackathon\Gmail-MCP\`
- **Env vars**:
  - `GMAIL_ADDRESS` = your@gmail.com
  - `GMAIL_APP_PASSWORD` = your_app_password
  - `IMAP_HOST` = imap.gmail.com
  - `IMAP_PORT` = 993
  - `SMTP_HOST` = smtp.gmail.com
  - `SMTP_PORT` = 587

#### Brave Search MCP
- **Folder**: `E:\pioneer_hackathon\brave-search-mcp-server\`
- **Env vars**:
  - `BRAVE_API_KEY` = your_api_key

#### Google Maps MCP
- **Folder**: `E:\pioneer_hackathon\google-maps-comprehensive-mcp\`
- **Env vars**:
  - `GOOGLE_MAPS_API_KEY` = your_api_key

#### Perplexity MCP
- **Folder**: `E:\pioneer_hackathon\modelcontextprotocol\`
- **Env vars**:
  - `PERPLEXITY_API_KEY` = your_api_key

#### Firecrawl MCP
- **Folder**: `E:\pioneer_hackathon\firecrawl-mcp-server\`
- **Env vars**:
  - `FIRECRAWL_API_KEY` = your_api_key

#### YouTube Transcript MCP
- **Folder**: `E:\pioneer_hackathon\mcp-youtube-transcript\`
- **No env vars needed**

---

### Step 7: Update Frontend Configuration

Create `E:\pioneer_hackathon\.env`:

```bash
# Mistral AI API Key
VITE_MISTRAL_API_KEY=your_mistral_api_key_here

# ElevenLabs API Key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Emergency Contacts
VITE_EMERGENCY_PHONE=+1234567890
VITE_EMERGENCY_EMAIL=emergency@example.com

# Cloud Run MCP Server URLs (replace with your actual URLs)
VITE_WHATSAPP_MCP_URL=https://whatsapp-mcp-xxxxx-uc.a.run.app
VITE_GMAIL_MCP_URL=https://gmail-mcp-xxxxx-uc.a.run.app
VITE_BRAVE_MCP_URL=https://brave-mcp-xxxxx-uc.a.run.app
VITE_GOOGLE_MAPS_MCP_URL=https://google-maps-mcp-xxxxx-uc.a.run.app
VITE_PERPLEXITY_MCP_URL=https://perplexity-mcp-xxxxx-uc.a.run.app
VITE_FIRECRAWL_MCP_URL=https://firecrawl-mcp-xxxxx-uc.a.run.app
VITE_YOUTUBE_MCP_URL=https://youtube-mcp-xxxxx-uc.a.run.app
```

---

### Step 8: Update Frontend Code to Use Cloud Run URLs

You'll need to update `src/services/mcpService.js` to use environment variables instead of localhost.

The current code uses:
```javascript
const BASE_URLS = {
  whatsapp: 'http://localhost:8089',
  gmail: 'http://localhost:8093',
  // ...
};
```

Should be changed to:
```javascript
const BASE_URLS = {
  whatsapp: import.meta.env.VITE_WHATSAPP_MCP_URL || 'http://localhost:8089',
  gmail: import.meta.env.VITE_GMAIL_MCP_URL || 'http://localhost:8093',
  brave: import.meta.env.VITE_BRAVE_MCP_URL || 'http://localhost:8091',
  googleMaps: import.meta.env.VITE_GOOGLE_MAPS_MCP_URL || 'http://localhost:8094',
  perplexity: import.meta.env.VITE_PERPLEXITY_MCP_URL || 'http://localhost:8092',
  firecrawl: import.meta.env.VITE_FIRECRAWL_MCP_URL || 'http://localhost:8095',
  youtube: import.meta.env.VITE_YOUTUBE_MCP_URL || 'http://localhost:8096',
  airbnb: import.meta.env.VITE_AIRBNB_MCP_URL || 'http://localhost:8090',
};
```

Would you like me to update this file for you?

---

### Step 9: Run Frontend

**In PowerShell Terminal 3:**

```powershell
cd E:\pioneer_hackathon
npm install
npm run dev
```

Open in browser: http://localhost:3000

---

## 📋 Checklist

- [ ] Closed and reopened PowerShell
- [ ] WhatsApp bridge running on port 8082
- [ ] Scanned QR code with WhatsApp
- [ ] ngrok installed and authenticated
- [ ] ngrok running on port 8082
- [ ] Copied ngrok Forwarding URL
- [ ] WhatsApp MCP deployed to Cloud Run
- [ ] Added `WHATSAPP_BRIDGE_URL` env var in Cloud Run
- [ ] (Optional) Other MCP servers deployed
- [ ] Created `.env` file with API keys and Cloud Run URLs
- [ ] Frontend running on http://localhost:3000

---

## 🔧 Troubleshooting

### gcc command not found
**Solution**: Close and reopen terminal (PATH needs to reload)

### Port 8082 already in use
**Solution**: Find and stop the process using port 8082
```powershell
netstat -ano | findstr :8082
Stop-Process -Id PID_NUMBER
```

### ngrok session expired
**Solution**:
1. Restart ngrok: `ngrok http 8082`
2. Copy new URL
3. Update Cloud Run env var `WHATSAPP_BRIDGE_URL`
4. Redeploy Cloud Run service

### Cloud Run deployment fails
**Solution**:
1. Check Dockerfile exists in the folder you're uploading
2. Verify all environment variables are set
3. Check Cloud Run logs for errors

---

## 📚 Documentation

- **Quick Setup**: [QUICK_CLOUD_RUN_SETUP.md](./QUICK_CLOUD_RUN_SETUP.md)
- **Detailed Guide**: [CLOUD_RUN_NGROK_SETUP.md](./CLOUD_RUN_NGROK_SETUP.md)
- **WhatsApp Setup**: [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)
- **ngrok Setup**: [NGROK_SETUP.md](./NGROK_SETUP.md)
- **Complete README**: [README.md](./README.md)

---

## 🎯 Summary

**Your Architecture:**
```
[iPhone] → [Cloud Run MCP Servers] → [ngrok] → [Local WhatsApp Bridge] → [WhatsApp Web]
```

**What runs where:**
- **Local (Port 8082)**: WhatsApp Bridge
- **Local (ngrok)**: Tunnel to port 8082
- **Cloud Run**: All MCP servers (WhatsApp, Gmail, Brave, etc.)
- **Local (Port 3000)**: Frontend React app

**Environment Variables:**
- `.env.cloudrun` - Template (copy values to Cloud Run Console)
- `.env` - Frontend configuration
- Cloud Run Console - Actual env vars for each service

---

Good luck! 🚀
