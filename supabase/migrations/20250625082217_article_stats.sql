-- Create site_stats table for tracking article counts and other statistics
CREATE TABLE IF NOT EXISTS site_stats (
  id TEXT PRIMARY KEY,
  total_articles INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  last_fetch_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or replace function to update article counts
CREATE OR REPLACE FUNCTION update_article_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update site_stats with new article count
  INSERT INTO site_stats (id, total_articles, last_updated)
  VALUES ('global_stats', (SELECT COUNT(*) FROM articles), NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    total_articles = (SELECT COUNT(*) FROM articles),
    last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to keep article count updated
DROP TRIGGER IF EXISTS articles_insert_trigger ON articles;
CREATE TRIGGER articles_insert_trigger
AFTER INSERT ON articles
FOR EACH STATEMENT
EXECUTE FUNCTION update_article_counts();

DROP TRIGGER IF EXISTS articles_delete_trigger ON articles;
CREATE TRIGGER articles_delete_trigger
AFTER DELETE ON articles
FOR EACH STATEMENT
EXECUTE FUNCTION update_article_counts();

-- Insert initial record if not exists
INSERT INTO site_stats (id, total_articles, last_updated)
VALUES ('global_stats', (SELECT COUNT(*) FROM articles), NOW())
ON CONFLICT (id) DO NOTHING;
