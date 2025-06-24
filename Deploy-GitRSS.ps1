# Git-based deployment script for RSS system (Windows version)
# Usage: .\Deploy-GitRSS.ps1 [branch]

param (
    [string]$Branch = "main"  # Default to main branch if not specified
)

$ErrorActionPreference = "Stop"  # Exit on error

# Configuration
$AppDir = Get-Location
$RepoUrl = git config --get remote.origin.url 2>$null

Write-Host "🚀 Starting git-based deployment of RSS system..." -ForegroundColor Cyan

# Check if git is installed
if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Git is not installed. Please install git first." -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not a git repository. Please run this script from the root of your git repository." -ForegroundColor Red
    exit 1
}

# Make sure we have the latest changes
Write-Host "📥 Fetching latest changes from remote repository..." -ForegroundColor Yellow
git fetch --all

# Check if branch exists
$branchExists = git show-ref --verify --quiet refs/remotes/origin/$Branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Branch '$Branch' does not exist on the remote." -ForegroundColor Red
    exit 1
}

# Save any local changes if needed
$changes = git diff --quiet
$stashed = $false

if ($LASTEXITCODE -ne 0) {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $stashName = "pre-deployment-$timestamp"
    Write-Host "💾 Saving local changes to stash '$stashName'..." -ForegroundColor Yellow
    git stash push -m $stashName
    $stashed = $true
}

# Switch to the specified branch
Write-Host "🔄 Switching to branch '$Branch'..." -ForegroundColor Yellow
git checkout $Branch

# Pull the latest changes
Write-Host "⬇️ Pulling latest changes..." -ForegroundColor Yellow
git pull origin $Branch

# Install or update RSS system
Write-Host "🔧 Installing/updating RSS system..." -ForegroundColor Yellow
# Since we're on Windows, we'll use npm scripts instead of bash scripts
npm run deploy-rss

# Deploy article stats if the script exists
if (Test-Path "deploy_article_stats.sh") {
    Write-Host "📊 Deploying article stats..." -ForegroundColor Yellow
    npm run deploy-stats
}

# Restore stashed changes if needed
if ($stashed) {
    Write-Host "📂 Restoring local changes from stash..." -ForegroundColor Yellow
    git stash pop
}

Write-Host "`n✅ RSS system deployment complete!" -ForegroundColor Green
Write-Host "The system is now installed and configured. RSS processing will run automatically."
Write-Host "You can check the status with: npm run deploy-rss status"
Write-Host "To start the scheduler manually: npm run deploy-rss start"
