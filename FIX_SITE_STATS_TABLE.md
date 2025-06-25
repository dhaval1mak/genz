# How to Fix the Missing site_stats Table

The error message `relation "public.site_stats" does not exist` is occurring because the database table that tracks article statistics has not been created.

## Quick Fix (Recommended)

1. **Log in to your Supabase Dashboard**: https://app.supabase.io
2. **Go to your project**
3. **Open the SQL Editor**
4. **Copy and paste the following SQL**:

```sql
-- Create the site_stats table
CREATE TABLE IF NOT EXISTS public.site_stats (
  id TEXT PRIMARY KEY,
  total_articles INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  last_fetch_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial count from articles table
INSERT INTO public.site_stats (id, total_articles, last_updated)
VALUES ('global_stats', (SELECT COUNT(*) FROM public.articles), NOW())
ON CONFLICT (id) DO UPDATE SET 
  total_articles = (SELECT COUNT(*) FROM public.articles),
  last_updated = NOW();

-- Verify the table was created and populated
SELECT * FROM public.site_stats;
```

5. **Run the SQL** by clicking the "Run" button
6. **Refresh your application** - the article counter should now work!

## Alternative: Using Supabase CLI

If you have access to the Supabase CLI, you can run:

```bash
# For Windows:
npm run deploy-stats-win

# For Mac/Linux:
npm run deploy-stats
```

This will create the table and also deploy the Edge Function for better performance.

## Troubleshooting

If you continue to see errors after applying the SQL fix:

1. Make sure the SQL executed without errors
2. Check that the `site_stats` table exists in your Supabase dashboard
3. Try clearing your browser cache or reloading the page
4. Verify that your application has proper permission to access the table
