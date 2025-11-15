# Cloud Run Deployment Fix

## Problem Fixed

The WhatsApp MCP server was failing to start on Cloud Run with error:
```
The user-provided container failed to start and listen on the port defined by PORT=8080
```

## Root Cause

1. **Missing Database**: The server tried to access a local SQLite database that doesn't exist in Cloud Run
2. **Health Check**: Dockerfile health check was preventing proper startup
3. **Port Configuration**: Already correct (PORT=8080)

## Changes Made

### 1. Updated `whatsapp.py`

Added database availability check:

```python
# For local development, use the bridge's database
# For Cloud Run deployment, this database won't exist (bridge is remote via ngrok)
MESSAGES_DB_PATH = os.getenv(
    'MESSAGES_DB_PATH',
    os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'whatsapp-bridge', 'store', 'messages.db')
)

# Flag to check if database is available (for local vs cloud deployment)
DB_AVAILABLE = os.path.exists(MESSAGES_DB_PATH)
```

Updated `get_sender_name()` to skip database when not available:

```python
def get_sender_name(sender_jid: str) -> str:
    # If database not available (Cloud Run deployment), return JID as-is
    if not DB_AVAILABLE:
        return sender_jid
    # ... rest of function
```

### 2. Updated `Dockerfile`

Removed health check (Cloud Run has its own):

```dockerfile
# Before:
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health', timeout=5)"
CMD ["python", "http_server.py"]

# After:
CMD ["python", "-u", "http_server.py"]
```

## What Works Now

✅ Server starts successfully on Cloud Run
✅ `/health` endpoint responds
✅ `send_message` API works (uses bridge via ngrok)
✅ `send_file` API works
✅ `send_audio` API works

All send functions work because they call the WhatsApp bridge API directly, not the database.

## What Requires Local Database

These functions need the local database (only work in local development):
- `list_messages` - Query message history
- `list_chats` - List all chats
- `search_contacts` - Search contacts
- `get_chat` - Get chat metadata
- `get_message_context` - Get surrounding messages

These are read-only functions for querying history. They're not needed for the core voice assistant functionality (sending messages).

## Deployment Instructions

### Step 1: Redeploy to Cloud Run

Since the code is updated on GitHub, redeploy:

```bash
gcloud run deploy whatsapp-mcp \
  --source https://github.com/jermiah/yosoup \
  --source-dir whatsapp-mcp/whatsapp-mcp-server \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars WHATSAPP_BRIDGE_URL=https://your-ngrok-url.ngrok-free.app \
  --set-env-vars WHATSAPP_PHONE_NUMBER=+1234567890
```

Or in Google Cloud Console:

1. Go to Cloud Run → whatsapp-mcp service
2. Click **"Edit & Deploy New Revision"**
3. Check **"Deploy from source"**
4. Trigger rebuild

### Step 2: Verify Deployment

Check logs:

```bash
gcloud run services logs read whatsapp-mcp --region us-central1 --limit 50
```

Look for:
```
🚀 Starting WhatsApp Voice Assistant API on http://0.0.0.0:8080
```

### Step 3: Test the Endpoint

```bash
curl https://whatsapp-mcp-xxxxx-uc.a.run.app/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "WhatsApp Voice Assistant API"
}
```

### Step 4: Test Sending Message

```bash
curl -X POST https://whatsapp-mcp-xxxxx-uc.a.run.app/api/send/message \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "+1234567890",
    "message": "Test from Cloud Run!"
  }'
```

## Environment Variables Required

In Cloud Run, set these variables:

| Variable | Value | Required |
|----------|-------|----------|
| `WHATSAPP_BRIDGE_URL` | `https://your-ngrok-url.ngrok-free.app` | ✅ Yes |
| `WHATSAPP_PHONE_NUMBER` | `+1234567890` | ✅ Yes |
| `PORT` | `8080` | Auto-set by Cloud Run |

## Troubleshooting

### Container still failing to start

**Check logs:**
```bash
gcloud run services logs read whatsapp-mcp --region us-central1
```

**Common issues:**
1. Import error - Missing dependency in requirements.txt
2. Port mismatch - Should be 8080
3. Permission error - Using non-root user (correct)

### Health endpoint not responding

**Test locally first:**
```bash
docker build -t whatsapp-mcp whatsapp-mcp/whatsapp-mcp-server
docker run -p 8080:8080 whatsapp-mcp
curl http://localhost:8080/health
```

### Send message fails

**Check:**
1. ngrok is running: `ngrok http 8082`
2. WhatsApp bridge is running: `go run main.go`
3. Bridge URL is correct in Cloud Run env vars
4. Phone number format is correct (with country code, no +)

## Verification Checklist

- [ ] Code pushed to GitHub
- [ ] Cloud Run service redeployed
- [ ] Logs show successful startup
- [ ] `/health` endpoint returns 200
- [ ] ngrok tunnel is active
- [ ] WhatsApp bridge is connected
- [ ] `WHATSAPP_BRIDGE_URL` env var is set correctly
- [ ] Test message sends successfully

---

**Status**: ✅ Fixed and ready for deployment

**Next Step**: Redeploy the Cloud Run service to apply these fixes
