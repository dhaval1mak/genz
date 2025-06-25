#!/usr/bin/env pwsh
# Deploy-ArticleStats.ps1 - Deploy article stats feature for Windows
# Usage: .\Deploy-ArticleStats.ps1

Write-Host "🚀 Deploying article stats feature..." -ForegroundColor Cyan

# Check if supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Supabase CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it first: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Apply the migration
Write-Host "📊 Applying database migration..." -ForegroundColor Cyan
$env:SUPABASE_DB_URL = $env:SUPABASE_DB_URL
supabase db push --db-url "$env:SUPABASE_DB_URL"

# Extract project reference from SUPABASE_URL
$projectRef = $env:SUPABASE_URL -replace '.*//([^.]*)\.*', '$1'

# Deploy the Edge Function
Write-Host "🔄 Deploying article-stats Edge Function..." -ForegroundColor Cyan
supabase functions deploy article-stats --project-ref $projectRef

# Run the RSS script to update the article count
Write-Host "📈 Updating article count statistics..." -ForegroundColor Cyan
node processRSSFeeds.mjs

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "The article count feature is now available on your site." -ForegroundColor White
Write-Host "You should see a live article counter next to the 'Live' indicator." -ForegroundColor White
Write-Host ""
Write-Host "To manually update article stats, run: node processRSSFeeds.mjs" -ForegroundColor Yellow
