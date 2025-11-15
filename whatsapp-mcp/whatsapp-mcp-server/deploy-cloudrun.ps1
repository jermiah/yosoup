# Deploy WhatsApp MCP Server to Google Cloud Run
# PowerShell version for Windows

param(
    [string]$ProjectId = (gcloud config get-value project),
    [string]$ServiceName = "whatsapp-mcp-server",
    [string]$Region = "us-central1"
)

# Configuration
$ImageName = "gcr.io/$ProjectId/$ServiceName"

Write-Host "🚀 Deploying WhatsApp MCP Server to Cloud Run" -ForegroundColor Green
Write-Host "Project: $ProjectId" -ForegroundColor Cyan
Write-Host "Service: $ServiceName" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host "Image: $ImageName" -ForegroundColor Cyan

try {
    # Build and push the container image
    Write-Host "`n📦 Building container image..." -ForegroundColor Yellow
    gcloud builds submit --tag $ImageName -f Dockerfile.cloudrun .
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed"
    }

    # Deploy to Cloud Run
    Write-Host "`n🌐 Deploying to Cloud Run..." -ForegroundColor Yellow
    gcloud run deploy $ServiceName `
        --image $ImageName `
        --platform managed `
        --region $Region `
        --allow-unauthenticated `
        --port 8080 `
        --memory 512Mi `
        --cpu 1 `
        --min-instances 0 `
        --max-instances 10 `
        --timeout 3600 `
        --set-env-vars "PORT=8080" `
        --set-env-vars "PYTHONUNBUFFERED=1"

    if ($LASTEXITCODE -ne 0) {
        throw "Cloud Run deployment failed"
    }

    # Get the service URL
    $ServiceUrl = gcloud run services describe $ServiceName `
        --platform managed `
        --region $Region `
        --format 'value(status.url)'

    Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
    Write-Host "🌐 Service URL: $ServiceUrl" -ForegroundColor Cyan
    Write-Host "💚 Health check: $ServiceUrl/health" -ForegroundColor Cyan
    Write-Host "📝 API docs: $ServiceUrl/docs" -ForegroundColor Cyan

    # Test the health endpoint
    Write-Host "`n🔍 Testing health endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$ServiceUrl/health" -Method Get -TimeoutSec 10
        Write-Host "✅ Health check passed!" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`n🔧 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update your .env.cloudrun file with:" -ForegroundColor White
    Write-Host "   WHATSAPP_BRIDGE_URL=$ServiceUrl" -ForegroundColor Cyan
    Write-Host "2. Test the API endpoints at $ServiceUrl/docs" -ForegroundColor White
    Write-Host "3. Configure your WhatsApp webhook if needed" -ForegroundColor White
}
catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the logs for more details:" -ForegroundColor Yellow
    Write-Host "gcloud logs read --service $ServiceName --limit 50" -ForegroundColor Cyan
    exit 1
}