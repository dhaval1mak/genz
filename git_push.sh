#!/bin/bash

# Script to push code to Git repository
# Usage: ./git_push.sh "Your commit message"

# Set default commit message if not provided
COMMIT_MESSAGE=${1:-"Update RSS system with article counter feature"}

echo "🚀 Pushing code to Git repository..."

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository. Please run this script from the root of your git repository."
    exit 1
fi

# Check if git is configured
if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
    echo "⚠️ Git user not configured. Please run:"
    echo "  git config --global user.name \"Your Name\""
    echo "  git config --global user.email \"your.email@example.com\""
    exit 1
fi

# Add all changes
echo "📁 Adding all changes to staging..."
git add .

# Show status
echo "📊 Current status:"
git status -s

# Confirm commit
read -p "Continue with commit? (y/n): " CONFIRM
if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "❌ Operation cancelled."
    exit 0
fi

# Commit changes
echo "💾 Committing changes with message: \"$COMMIT_MESSAGE\""
git commit -m "$COMMIT_MESSAGE"

# Get current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
echo "🌿 Current branch: $CURRENT_BRANCH"

# Push to repository
echo "⬆️ Pushing to origin/$CURRENT_BRANCH..."
git push origin $CURRENT_BRANCH

echo "✅ Successfully pushed to Git repository!"
