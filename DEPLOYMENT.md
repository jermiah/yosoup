# Deployment Guide

This guide covers deploying the Fall Detection Voice Agent to various platforms.

## Prerequisites

Before deploying, ensure you have:

1. All API keys and credentials configured
2. MCP servers running and accessible
3. LiveKit server set up
4. Production environment variables ready

## Option 1: Vercel (Recommended)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Step 3: Configure Environment Variables

In the Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.example`
3. Redeploy the project

### Step 4: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Option 2: Netlify

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Deploy

```bash
# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### Step 3: Configure Environment Variables

In the Netlify dashboard:

1. Go to Site Settings → Environment Variables
2. Add all variables from `.env.example`
3. Trigger a new deployment

## Option 3: AWS (S3 + CloudFront)

### Step 1: Build the Project

```bash
npm run build
```

### Step 2: Install AWS CLI

Follow instructions at: https://aws.amazon.com/cli/

### Step 3: Create S3 Bucket

```bash
aws s3 mb s3://your-bucket-name
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
```

### Step 4: Upload Build

```bash
aws s3 sync dist/ s3://your-bucket-name --acl public-read
```

### Step 5: Create CloudFront Distribution

1. Go to CloudFront console
2. Create distribution
3. Set S3 bucket as origin
4. Configure custom error pages (404 → /index.html)
5. Enable HTTPS

## Option 4: Docker + Cloud Run (Google Cloud)

### Step 1: Create Dockerfile

Create `Dockerfile.web` in the project root:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 3: Deploy to Cloud Run

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/fall-detection-app

# Deploy to Cloud Run
gcloud run deploy fall-detection-app \
  --image gcr.io/PROJECT_ID/fall-detection-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## MCP Servers Deployment

### Local Development

Use Docker Compose for local development:

```bash
# Copy environment file
cp .env.docker.example .env.docker

# Edit .env.docker with your API keys
nano .env.docker

# Start all MCP servers
docker-compose --env-file .env.docker up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Production Deployment

For production, deploy MCP servers to:

#### Option A: Cloud Run (Google Cloud)

Each MCP server can be deployed individually:

```bash
# Example for Brave Search MCP
docker pull mcp/brave-search
docker tag mcp/brave-search gcr.io/PROJECT_ID/mcp-brave-search
docker push gcr.io/PROJECT_ID/mcp-brave-search

gcloud run deploy mcp-brave-search \
  --image gcr.io/PROJECT_ID/mcp-brave-search \
  --platform managed \
  --region us-central1 \
  --set-env-vars BRAVE_API_KEY=your_key
```

#### Option B: AWS ECS/Fargate

1. Push images to ECR
2. Create task definitions for each MCP server
3. Deploy to ECS Fargate
4. Configure Application Load Balancer

#### Option C: Kubernetes

Create deployment manifests:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-brave-search
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mcp-brave-search
  template:
    metadata:
      labels:
        app: mcp-brave-search
    spec:
      containers:
      - name: brave-search
        image: mcp/brave-search
        ports:
        - containerPort: 8080
        env:
        - name: BRAVE_API_KEY
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: brave-api-key
---
apiVersion: v1
kind: Service
metadata:
  name: mcp-brave-search
spec:
  selector:
    app: mcp-brave-search
  ports:
  - port: 8091
    targetPort: 8080
```

## LiveKit Server Deployment

### Option A: LiveKit Cloud (Easiest)

1. Sign up at https://cloud.livekit.io
2. Create a project
3. Get API key and secret
4. Use provided WebSocket URL

### Option B: Self-Hosted

Deploy using Docker Compose:

```yaml
version: '3.8'

services:
  livekit:
    image: livekit/livekit-server:latest
    command: --config /etc/livekit.yaml
    ports:
      - "7880:7880"
      - "7881:7881"
      - "7882:7882/udp"
    volumes:
      - ./livekit.yaml:/etc/livekit.yaml
```

Create `livekit.yaml`:

```yaml
port: 7880
rtc:
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: true
keys:
  your_api_key: your_api_secret
```

## SSL/HTTPS Setup

For production, HTTPS is **required** for:
- Device Motion API (fall detection)
- Microphone access
- Location services

### Using Vercel/Netlify
SSL is automatic and free.

### Using Cloudflare
1. Add your domain to Cloudflare
2. Enable "Flexible" or "Full" SSL
3. Update DNS records

### Using Let's Encrypt
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

## Environment Variables Checklist

Before deploying, ensure all these are set:

### LiveKit
- [ ] `VITE_LIVEKIT_URL`
- [ ] `VITE_LIVEKIT_API_KEY`
- [ ] `VITE_LIVEKIT_API_SECRET`

### AI Services
- [ ] `VITE_MISTRAL_API_KEY`
- [ ] `VITE_MISTRAL_MODEL`
- [ ] `VITE_ELEVENLABS_API_KEY`
- [ ] `VITE_ELEVENLABS_VOICE_ID`

### MCP Servers
- [ ] `VITE_MCP_WHATSAPP_URL`
- [ ] `VITE_MCP_AIRBNB_URL`
- [ ] `VITE_MCP_BRAVE_SEARCH_URL`
- [ ] `VITE_MCP_PERPLEXITY_URL`
- [ ] `VITE_MCP_GMAIL_URL`
- [ ] `VITE_MCP_GOOGLE_MAPS_URL`
- [ ] `VITE_MCP_FIRECRAWL_URL`
- [ ] `VITE_MCP_YOUTUBE_URL`

### API Keys
- [ ] `VITE_BRAVE_API_KEY`
- [ ] `VITE_PERPLEXITY_API_KEY`
- [ ] `VITE_GOOGLE_MAPS_API_KEY`
- [ ] `VITE_FIRECRAWL_API_KEY`
- [ ] `VITE_GMAIL_ADDRESS`
- [ ] `VITE_GMAIL_APP_PASSWORD`

### Emergency Contacts
- [ ] `VITE_EMERGENCY_PHONE`
- [ ] `VITE_EMERGENCY_EMAIL`

## Post-Deployment Testing

### Test Checklist

1. **Basic Functionality**
   - [ ] App loads without errors
   - [ ] UI is responsive on iPhone
   - [ ] All styles load correctly

2. **Fall Detection**
   - [ ] Motion permission prompt appears
   - [ ] Accelerometer data is received
   - [ ] Fall detection algorithm works
   - [ ] Emergency alert triggers

3. **Voice Assistant**
   - [ ] Microphone permission prompt appears
   - [ ] Speech recognition works
   - [ ] TTS audio plays
   - [ ] LiveKit connection succeeds

4. **MCP Integrations**
   - [ ] Brave Search returns results
   - [ ] Perplexity responds to queries
   - [ ] Gmail integration works
   - [ ] Google Maps geocoding works
   - [ ] YouTube transcripts load

5. **Emergency Features**
   - [ ] Location is captured
   - [ ] WhatsApp message sends
   - [ ] Email alert sends
   - [ ] Countdown works
   - [ ] Cancel button works

## Monitoring

### Application Monitoring

Set up monitoring with:
- **Sentry** for error tracking
- **Google Analytics** or **Plausible** for usage analytics
- **LogRocket** for session replay

### Server Monitoring

For MCP servers and LiveKit:
- **Prometheus** + **Grafana** for metrics
- **ELK Stack** for logs
- **Uptime Robot** for availability monitoring

## Scaling Considerations

### Frontend
- Use CDN for static assets
- Enable gzip/brotli compression
- Implement service worker for offline support

### MCP Servers
- Deploy multiple instances
- Use load balancer
- Implement rate limiting
- Cache responses where appropriate

### LiveKit
- Use LiveKit's built-in scalability
- Deploy to multiple regions
- Monitor concurrent connections

## Troubleshooting

### Common Issues

**Issue**: HTTPS required error on iPhone
- **Solution**: Deploy to HTTPS-enabled hosting

**Issue**: Microphone not working
- **Solution**: Check permissions policy headers

**Issue**: MCP servers not reachable
- **Solution**: Verify CORS settings and URLs

**Issue**: Fall detection not triggering
- **Solution**: Test on actual device, not simulator

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Implement rate limiting** on all API endpoints
4. **Enable CORS** only for your domains
5. **Use HTTPS** everywhere
6. **Rotate API keys** regularly
7. **Monitor API usage** for anomalies

## Support

For deployment issues, check:
- Platform-specific documentation
- GitHub issues
- Community forums

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure backups
3. Document runbook for incidents
4. Plan for scaling
5. Schedule regular security audits
