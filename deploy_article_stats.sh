#!/bin/bash

# Deploy article stats feature
# Usage: ./deploy_article_stats.sh

echo "🚀 Deploying article stats feature..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Error: Supabase CLI is not installed."
    echo "Please install it first: npm install -g supabase"
    exit 1
fi

# Apply the migration
echo "📊 Applying database migration..."
supabase db push --db-url "$SUPABASE_DB_URL"

# Deploy the Edge Function
echo "🔄 Deploying article-stats Edge Function..."
supabase functions deploy article-stats --project-ref "$(echo $SUPABASE_URL | sed 's/.*\/\/\([^.]*\).*/\1/')"

# Run the RSS script to update the article count
echo "📈 Updating article count statistics..."
node processRSSFeeds.mjs

echo "✅ Deployment complete!"
echo ""
echo "The article count feature is now available on your site."
echo "You should see a live article counter next to the 'Live' indicator."
echo ""
echo "To manually update article stats, run: node processRSSFeeds.mjs"
