# RSS System Deployment Verification Script (Windows)
# Usage: .\Verify-Deployment.ps1

Write-Host "🔍 Verifying RSS system deployment..." -ForegroundColor Cyan

# Check if required files exist
Write-Host -NoNewline "Checking required files... "
$missingFiles = 0

$filesToCheck = @(
  "processRSSFeeds.mjs",
  "rssScheduler.mjs",
  "deploy_rss_system.sh",
  "deploy_article_stats.sh"
)

foreach ($file in $filesToCheck) {
  if (-not (Test-Path $file)) {
    Write-Host "`n❌ Missing file: $file" -ForegroundColor Red
    $missingFiles++
  }
}

if ($missingFiles -eq 0) {
  Write-Host "✅ All required files present" -ForegroundColor Green
} else {
  Write-Host "❌ Missing $missingFiles required files" -ForegroundColor Red
}

# Check if Node.js and npm are installed
Write-Host -NoNewline "Checking Node.js and npm... "
if (Get-Command "node" -ErrorAction SilentlyContinue) {
  $nodeVersion = node -v
  $npmVersion = npm -v
  Write-Host "✅ Node.js $nodeVersion and npm $npmVersion installed" -ForegroundColor Green
} else {
  Write-Host "❌ Node.js and/or npm not installed" -ForegroundColor Red
}

# Check if git is installed
Write-Host -NoNewline "Checking git... "
if (Get-Command "git" -ErrorAction SilentlyContinue) {
  $gitVersion = git --version
  Write-Host "✅ $gitVersion installed" -ForegroundColor Green
} else {
  Write-Host "❌ git not installed" -ForegroundColor Red
}

# Check if we're in a git repository
Write-Host -NoNewline "Checking git repository... "
if (Test-Path ".git") {
  $repoUrl = git config --get remote.origin.url
  Write-Host "✅ Git repository found (origin: $repoUrl)" -ForegroundColor Green
} else {
  Write-Host "❌ Not a git repository" -ForegroundColor Red
}

# Try to check Supabase connection using Node.js
Write-Host -NoNewline "Checking Supabase connection... "
try {
  $nodeScript = @"
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.SUPABASE_URL || 'https://fdnvfdkhhwdpkyomsvoq.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  (async () => {
    try {
      const { data, error } = await supabase.from('articles').select('count');
      if (error) throw error;
      console.log(`Connected to Supabase (${data[0].count} articles found)`);
      process.exit(0);
    } catch (e) {
      console.log(`Supabase connection failed: ${e.message}`);
      process.exit(1);
    }
  })();
"@

  $tempFile = [System.IO.Path]::GetTempFileName() + ".js"
  $nodeScript | Out-File -FilePath $tempFile -Encoding utf8
  
  $result = node $tempFile
  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ $result" -ForegroundColor Green
  } else {
    Write-Host "❌ $result" -ForegroundColor Red
  }
  
  Remove-Item $tempFile -Force
} catch {
  Write-Host "❌ Could not verify Supabase connection: $_" -ForegroundColor Red
}

Write-Host "`n📋 Deployment verification complete!" -ForegroundColor Cyan
