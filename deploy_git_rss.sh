#!/bin/bash

# Git-based deployment script for RSS system
# Usage: ./deploy_git_rss.sh [branch]

set -e  # Exit on error

# Configuration
BRANCH=${1:-main}  # Default to main branch if not specified
APP_DIR="$PWD"
REPO_URL=$(git config --get remote.origin.url || echo "")

echo "🚀 Starting git-based deployment of RSS system..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository. Please run this script from the root of your git repository."
    exit 1
fi

# Make sure we have the latest changes
echo "📥 Fetching latest changes from remote repository..."
git fetch --all

# Check if branch exists
if ! git show-ref --verify --quiet refs/remotes/origin/$BRANCH; then
    echo "❌ Error: Branch '$BRANCH' does not exist on the remote."
    exit 1
fi

# Save any local changes if needed
if ! git diff --quiet; then
    TIMESTAMP=$(date +"%Y%m%d%H%M%S")
    STASH_NAME="pre-deployment-$TIMESTAMP"
    echo "💾 Saving local changes to stash '$STASH_NAME'..."
    git stash push -m "$STASH_NAME"
    STASHED=true
else
    STASHED=false
fi

# Switch to the specified branch
echo "🔄 Switching to branch '$BRANCH'..."
git checkout $BRANCH

# Pull the latest changes
echo "⬇️ Pulling latest changes..."
git pull origin $BRANCH

# Install or update RSS system
echo "🔧 Installing/updating RSS system..."
chmod +x ./deploy_rss_system.sh
./deploy_rss_system.sh install

# Deploy article stats if the script exists
if [ -f ./deploy_article_stats.sh ]; then
    echo "📊 Deploying article stats..."
    chmod +x ./deploy_article_stats.sh
    ./deploy_article_stats.sh
fi

# Restore stashed changes if needed
if [ "$STASHED" = true ]; then
    echo "📂 Restoring local changes from stash..."
    git stash pop
fi

echo "✅ RSS system deployment complete!"
echo ""
echo "The system is now installed and configured. RSS processing will run automatically."
echo "You can check the status with: ./deploy_rss_system.sh status"
echo "To start the scheduler manually: ./deploy_rss_system.sh start"
