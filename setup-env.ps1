# PowerShell script to set up environment for RankUp AEO
# Run this script: .\setup-env.ps1

Write-Host "🚀 RankUp AEO Environment Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   This file should exist in the project root." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found .env file" -ForegroundColor Green

# Check if .env.local already exists
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Copy .env to .env.local
Write-Host "`n📋 Creating .env.local from .env..." -ForegroundColor Cyan
Copy-Item .env .env.local -Force
Write-Host "✅ Created .env.local" -ForegroundColor Green

Write-Host "`n📝 Please edit .env.local and add your API keys:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Required:" -ForegroundColor White
Write-Host "   - OPENROUTER_API_KEY (get from https://openrouter.ai)" -ForegroundColor Gray
Write-Host "   - SERPER_API_KEY (get from https://serper.dev)" -ForegroundColor Gray
Write-Host ""
Write-Host "   Optional:" -ForegroundColor White  
Write-Host "   - ZENROWS_API_KEY (for JS-heavy sites)" -ForegroundColor Gray
Write-Host "   - BREVO_API_KEY (for email features)" -ForegroundColor Gray
Write-Host ""

$openEditor = Read-Host "Open .env.local in notepad now? (Y/n)"
if ($openEditor -ne "n" -and $openEditor -ne "N") {
    notepad .env.local
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "   Next steps:" -ForegroundColor Cyan
Write-Host "   1. Add your API keys to .env.local" -ForegroundColor White
Write-Host "   2. Run: npm install (if you haven't)" -ForegroundColor White
Write-Host "   3. Run: npm run dev" -ForegroundColor White
Write-Host "   4. Visit: http://localhost:3000`n" -ForegroundColor White

