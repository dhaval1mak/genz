-- Create site_stats table for tracking article counts
CREATE TABLE IF NOT EXISTS public.site_stats (
  id TEXT PRIMARY KEY,
  total_articles INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  last_fetch_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial data from articles count
INSERT INTO public.site_stats (id, total_articles, last_updated)
SELECT 'global_stats', COUNT(*), NOW()
FROM public.articles
ON CONFLICT (id) DO UPDATE SET
  total_articles = (SELECT COUNT(*) FROM public.articles),
  last_updated = NOW();

-- Optional: Create triggers to keep the count updated
-- Uncomment if you want automatic updates whenever articles are added/removed

-- CREATE OR REPLACE FUNCTION update_article_counts()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO site_stats (id, total_articles, last_updated)
--   VALUES ('global_stats', (SELECT COUNT(*) FROM articles), NOW())
--   ON CONFLICT (id) 
--   DO UPDATE SET 
--     total_articles = (SELECT COUNT(*) FROM articles),
--     last_updated = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- DROP TRIGGER IF EXISTS articles_insert_trigger ON articles;
-- CREATE TRIGGER articles_insert_trigger
-- AFTER INSERT ON articles
-- FOR EACH STATEMENT
-- EXECUTE FUNCTION update_article_counts();

-- DROP TRIGGER IF EXISTS articles_delete_trigger ON articles;
-- CREATE TRIGGER articles_delete_trigger
-- AFTER DELETE ON articles
-- FOR EACH STATEMENT
-- EXECUTE FUNCTION update_article_counts();

-- Show the current stats
SELECT * FROM public.site_stats;
