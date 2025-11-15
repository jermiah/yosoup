# WhatsApp MCP Cloud Run Deployment Troubleshooting

## Quick Fix Summary

The original error was caused by:
1. **Wrong Port**: Service was hardcoded to port 5000 instead of using Cloud Run's PORT environment variable (8080)
2. **Missing Health Check**: No proper health endpoint for Cloud Run monitoring
3. **Security Issues**: Running as root user instead of non-privileged user

## Fixed Files

### 1. `http_server.py`
- Now uses `os.environ.get("PORT", 8080)` instead of hardcoded port 5000
- Supports both local development and Cloud Run deployment

### 2. `Dockerfile.cloudrun` 
- Optimized for Cloud Run with proper port exposure (8080)
- Non-root user for security
- Health check configuration
- Environment variables set correctly

### 3. `deploy-cloudrun.sh`
- Automated deployment script
- Proper environment variable configuration
- Health check validation after deployment

## Deployment Steps

1. **Navigate to the WhatsApp MCP directory:**
   ```bash
   cd whatsapp-mcp/whatsapp-mcp-server
   ```

2. **Set your environment variables:**
   ```bash
   export WHATSAPP_PHONE_NUMBER="+1234567890"  # Replace with your number
   ```

3. **Make the deployment script executable:**
   ```bash
   chmod +x deploy-cloudrun.sh
   ```

4. **Deploy to Cloud Run:**
   ```bash
   ./deploy-cloudrun.sh
   ```

## Testing

### Local Testing (Optional)
```bash
# Test locally first
python test_server.py

# Or test with Docker
python test_server.py --docker
```

### Test Deployed Service
```bash
# Replace with your actual service URL
python test_server.py https://whatsapp-mcp-server-xxxxx-uc.a.run.app
```

## Expected Output

When deployment succeeds, you should see:
```
✅ Deployment complete!
🌐 Service URL: https://whatsapp-mcp-server-xxxxx-uc.a.run.app
💚 Health check: https://whatsapp-mcp-server-xxxxx-uc.a.run.app/health
📝 API docs: https://whatsapp-mcp-server-xxxxx-uc.a.run.app/docs
✅ Health check passed!
```

## Common Issues and Solutions

### Issue 1: "Container failed to start and listen on the port"
**Cause**: Service not listening on the PORT environment variable
**Solution**: ✅ Fixed in updated `http_server.py`

### Issue 2: "Health check timeout"
**Cause**: No health endpoint or slow startup
**Solution**: ✅ Added `/health` endpoint and optimized startup

### Issue 3: "Permission denied" errors
**Cause**: Running as root user
**Solution**: ✅ Added non-root user in Dockerfile

### Issue 4: "Build timeout"
**Cause**: Large Docker image or slow dependencies
**Solution**: ✅ Optimized Dockerfile with layer caching

### Issue 5: "Service returns 500 errors"
**Cause**: Missing WhatsApp connection (this is expected initially)
**Solution**: The API endpoints work, but return 500 when WhatsApp isn't connected. This is normal.

## Monitoring

### View Logs
```bash
gcloud logs read --service whatsapp-mcp-server --limit 50
```

### Monitor Service
```bash
gcloud run services describe whatsapp-mcp-server --region us-central1
```

### Check Service Health
```bash
curl https://your-service-url.run.app/health
```

## Configuration for Fall Detection App

After successful deployment, update your frontend app's environment:

1. **Update `.env.cloudrun`:**
   ```env
   WHATSAPP_BRIDGE_URL=https://whatsapp-mcp-server-xxxxx-uc.a.run.app
   ```

2. **Update frontend environment:**
   ```env
   VITE_MCP_WHATSAPP_URL=https://whatsapp-mcp-server-xxxxx-uc.a.run.app
   ```

## API Endpoints

Your deployed service provides:

- **Health Check**: `GET /health`
- **API Docs**: `GET /docs`
- **Search Contacts**: `POST /api/contacts/search`
- **List Messages**: `POST /api/messages/list`
- **Send Message**: `POST /api/send/message`
- **Send File**: `POST /api/send/file`
- **Send Audio**: `POST /api/send/audio`

## Security Notes

- Service runs as non-root user
- CORS enabled for frontend integration
- Environment variables properly handled
- Health checks implemented

## Scaling Configuration

The service is configured with:
- **Min Instances**: 0 (scales to zero when not used)
- **Max Instances**: 10 (auto-scales based on traffic)
- **Memory**: 512Mi
- **CPU**: 1
- **Timeout**: 3600 seconds

## Next Steps

1. ✅ Deploy the service using the fixed configuration
2. Test the API endpoints
3. Configure WhatsApp Business API if needed
4. Integrate with your fall detection frontend
5. Set up monitoring and alerting

## Support

If you encounter issues:

1. Check the Cloud Run logs
2. Verify environment variables are set
3. Test endpoints individually
4. Check firewall/network settings
5. Validate WhatsApp API credentials