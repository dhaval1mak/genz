-- Simple version of site_stats setup
-- Copy and run this in your Supabase SQL Editor

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
