# Script to push code to Git repository
# Usage: .\Git-Push.ps1 ["Your commit message"]

param (
    [string]$CommitMessage = "Update RSS system with article counter feature"
)

Write-Host "🚀 Pushing code to Git repository..." -ForegroundColor Cyan

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not a git repository. Please run this script from the root of your git repository." -ForegroundColor Red
    exit 1
}

# Check if git is configured
$userName = git config user.name
$userEmail = git config user.email

if ([string]::IsNullOrEmpty($userName) -or [string]::IsNullOrEmpty($userEmail)) {
    Write-Host "⚠️ Git user not configured. Please run:" -ForegroundColor Yellow
    Write-Host "  git config --global user.name ""Your Name""" -ForegroundColor Yellow
    Write-Host "  git config --global user.email ""your.email@example.com""" -ForegroundColor Yellow
    exit 1
}

# Add all changes
Write-Host "📁 Adding all changes to staging..." -ForegroundColor Yellow
git add .

# Show status
Write-Host "📊 Current status:" -ForegroundColor Yellow
git status -s

# Confirm commit
$confirm = Read-Host "Continue with commit? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Operation cancelled." -ForegroundColor Red
    exit 0
}

# Commit changes
Write-Host "💾 Committing changes with message: ""$CommitMessage""" -ForegroundColor Yellow
git commit -m $CommitMessage

# Get current branch
$currentBranch = git symbolic-ref --short HEAD
Write-Host "🌿 Current branch: $currentBranch" -ForegroundColor Yellow

# Push to repository
Write-Host "⬆️ Pushing to origin/$currentBranch..." -ForegroundColor Yellow
git push origin $currentBranch

Write-Host "✅ Successfully pushed to Git repository!" -ForegroundColor Green
