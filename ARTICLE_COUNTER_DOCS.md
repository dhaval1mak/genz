# Article Counter Feature

This feature adds a live article counter to the news aggregator site, displaying the total number of articles in the database and any newly added articles since the last visit.

## How It Works

1. **Database Integration**:
   - New `site_stats` table stores global statistics
   - Triggers automatically update article counts on insert/delete
   - Timestamps track when stats were last updated

2. **Server-Side Processing**:
   - RSS feed processor updates the stats on each run
   - Supabase Edge Function provides API access to stats
   - Database triggers maintain accurate counts

3. **Frontend Display**:
   - Responsive counter appears next to "Live" indicator
   - Shows total article count and newly added articles
   - Automatically refreshes every 5 minutes

## Implementation Details

### Database Schema

```sql
CREATE TABLE site_stats (
  id TEXT PRIMARY KEY,
  total_articles INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  last_fetch_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Edge Function

The `article-stats` Edge Function provides a simple API endpoint that returns:
- Total number of articles
- Last updated timestamp
- Number of articles added in the last update

### Frontend Component

The `ArticleCounter` React component:
- Fetches stats from the Edge Function
- Falls back to direct database query if needed
- Shows loading state while fetching
- Displays a pulsing indicator for live data
- Highlights newly added articles

## Setup & Usage

### Testing the Article Counter

Run the test server:
```bash
npm run test-counter
```

This starts a local server that simulates the article-stats endpoint with real data from your database.

### Deploying the Feature

Deploy the Edge Function and apply the database migration:
```bash
npm run deploy-stats
```

### Updating Article Stats

To manually update the article stats:
```bash
npm run update-stats
```

This runs the RSS processor and updates the sitemap.

## Troubleshooting

If the article counter doesn't appear:

1. Check that the `site_stats` table exists in your database
2. Verify the Edge Function is deployed correctly
3. Check browser console for any errors
4. Try running `npm run update-stats` to refresh the data

## Extending the Feature

This feature can be extended to track:
- Articles per category
- Reading statistics
- Popular articles
- User engagement metrics

To add new statistics, update the `site_stats` table schema and modify the `updateSiteStats` function in `processRSSFeeds.mjs`.
