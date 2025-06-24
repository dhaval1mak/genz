#!/bin/bash

# RSS System Deployment Verification Script
# Usage: ./verify_deployment.sh

echo "🔍 Verifying RSS system deployment..."

# Check if required files exist
echo -n "Checking required files... "
MISSING_FILES=0

FILES_TO_CHECK=(
  "processRSSFeeds.mjs"
  "rssScheduler.mjs"
  "deploy_rss_system.sh"
  "deploy_article_stats.sh"
)

for file in "${FILES_TO_CHECK[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "\n❌ Missing file: $file"
    MISSING_FILES=$((MISSING_FILES + 1))
  fi
done

if [ $MISSING_FILES -eq 0 ]; then
  echo "✅ All required files present"
else
  echo "❌ Missing $MISSING_FILES required files"
fi

# Check if Node.js and npm are installed
echo -n "Checking Node.js and npm... "
if command -v node &> /dev/null && command -v npm &> /dev/null; then
  NODE_VERSION=$(node -v)
  NPM_VERSION=$(npm -v)
  echo "✅ Node.js $NODE_VERSION and npm $NPM_VERSION installed"
else
  echo "❌ Node.js and/or npm not installed"
fi

# Check if git is installed
echo -n "Checking git... "
if command -v git &> /dev/null; then
  GIT_VERSION=$(git --version)
  echo "✅ $GIT_VERSION installed"
else
  echo "❌ git not installed"
fi

# Check if we're in a git repository
echo -n "Checking git repository... "
if [ -d .git ]; then
  REPO_URL=$(git config --get remote.origin.url)
  echo "✅ Git repository found (origin: $REPO_URL)"
else
  echo "❌ Not a git repository"
fi

# Check PM2 if available
echo -n "Checking PM2... "
if command -v pm2 &> /dev/null; then
  PM2_VERSION=$(pm2 -v)
  echo "✅ PM2 v$PM2_VERSION installed"
  
  # Check if RSS processor is running
  echo -n "Checking RSS processor status... "
  if pm2 list | grep -q "rss-processor"; then
    echo "✅ RSS processor is running in PM2"
  else
    echo "❌ RSS processor is not running in PM2"
  fi
else
  echo "❌ PM2 not installed"
fi

# Check cron job
echo -n "Checking cron job... "
if command -v crontab &> /dev/null; then
  if crontab -l 2>/dev/null | grep -q "processRSSFeeds.mjs"; then
    echo "✅ Cron job for RSS processor is installed"
  else
    echo "❌ No cron job for RSS processor found"
  fi
else
  echo "❌ crontab command not available"
fi

# Try to check Supabase connection
echo -n "Checking Supabase connection... "
if node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
(async () => {
  const { data, error } = await supabase.from('articles').select('count');
  if (error) throw error;
  console.log(\`✅ Connected to Supabase (${data[0].count} articles found)\`);
})().catch(e => console.log(\`❌ Supabase connection failed: ${e.message}\`));
" 2>/dev/null; then
  : # Output handled by Node.js script
else
  echo "❌ Could not verify Supabase connection"
fi

echo -e "\n📋 Deployment verification complete!"
