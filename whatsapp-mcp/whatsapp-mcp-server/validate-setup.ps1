# Quick validation script for WhatsApp MCP Cloud Run deployment
# Run this to check if your setup is ready for deployment

Write-Host "🔍 Validating WhatsApp MCP Cloud Run Setup" -ForegroundColor Green
Write-Host "=" * 50

$errors = @()
$warnings = @()

# Check 1: Google Cloud CLI
try {
    $gcloudVersion = gcloud version --format="value(Google Cloud SDK)"
    Write-Host "✅ Google Cloud CLI: $gcloudVersion" -ForegroundColor Green
}
catch {
    $errors += "❌ Google Cloud CLI not found. Install it from https://cloud.google.com/sdk"
}

# Check 2: Current project
try {
    $project = gcloud config get-value project
    if ($project) {
        Write-Host "✅ GCP Project: $project" -ForegroundColor Green
    }
    else {
        $errors += "❌ No GCP project set. Run: gcloud config set project YOUR_PROJECT_ID"
    }
}
catch {
    $errors += "❌ Unable to get GCP project"
}

# Check 3: Required APIs
$requiredApis = @(
    "run.googleapis.com",
    "cloudbuild.googleapis.com"
)

Write-Host "`n📋 Checking required APIs..." -ForegroundColor Yellow
foreach ($api in $requiredApis) {
    try {
        $apiStatus = gcloud services list --enabled --filter="name:$api" --format="value(name)"
        if ($apiStatus) {
            Write-Host "✅ $api enabled" -ForegroundColor Green
        }
        else {
            $warnings += "⚠️ $api not enabled. Enable it: gcloud services enable $api"
        }
    }
    catch {
        $warnings += "⚠️ Unable to check $api status"
    }
}

# Check 4: Required files
$requiredFiles = @(
    "Dockerfile.cloudrun",
    "http_server.py",
    "requirements.txt",
    "whatsapp.py"
)

Write-Host "`n📁 Checking required files..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file found" -ForegroundColor Green
    }
    else {
        $errors += "❌ $file not found"
    }
}

# Check 5: Docker (for local testing)
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
}
catch {
    $warnings += "⚠️ Docker not found. Install for local testing (optional)"
}

# Check 6: Python (for local testing)
try {
    $pythonVersion = python --version
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
}
catch {
    $warnings += "⚠️ Python not found in PATH (optional for local testing)"
}

# Summary
Write-Host "`n" + "=" * 50
if ($errors.Count -eq 0) {
    Write-Host "🎉 Setup validation passed!" -ForegroundColor Green
    Write-Host "You're ready to deploy. Run: .\deploy-cloudrun.ps1" -ForegroundColor Cyan
}
else {
    Write-Host "❌ Setup validation failed!" -ForegroundColor Red
    Write-Host "`nErrors to fix:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  $error" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`nWarnings (optional):" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  $warning" -ForegroundColor Yellow
    }
}

Write-Host "`n💡 Quick start commands:" -ForegroundColor Cyan
Write-Host "1. Enable APIs: gcloud services enable run.googleapis.com cloudbuild.googleapis.com" -ForegroundColor White
Write-Host "2. Deploy: .\deploy-cloudrun.ps1" -ForegroundColor White
Write-Host "3. Test: python test_server.py https://your-service-url.run.app" -ForegroundColor White