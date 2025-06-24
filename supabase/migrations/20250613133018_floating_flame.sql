/*
  # Create users table and related schemas

  1. New Tables
    - `users`
      - `id` (uuid, primary key, matches auth.users)
      - `email` (text, unique)
      - `preferred_style` (enum: normal, genz, alpha)
      - `interests` (text array)
      - `onboarding_completed` (boolean)
      - `created_at` (timestamp)
    
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `normal` (text) - Professional version
      - `genz` (text) - Gen-Z version  
      - `alpha` (text) - Alpha version
      - `image_url` (text, optional)
      - `category` (text)
      - `published_at` (timestamp)
      - `original_url` (text, optional)
      - `slug` (text, unique)
      - `likes_normal` (integer)
      - `likes_genz` (integer) 
      - `likes_alpha` (integer)
      - `rss_source` (text)
      - `created_at` (timestamp)
    
    - `comments`
      - `id` (uuid, primary key)
      - `article_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `text` (text)
      - `style_version` (enum: normal, genz, alpha)
      - `timestamp` (timestamp)
    
    - `likes`
      - `id` (uuid, primary key)
      - `article_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `style_version` (enum: normal, genz, alpha)
      - `timestamp` (timestamp)
      - Unique constraint on (article_id, user_id, style_version)
    
    - `rss_feeds`
      - `id` (uuid, primary key)
      - `name` (text)
      - `url` (text, unique)
      - `category` (text)
      - `active` (boolean)
      - `last_fetched` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for articles
    - Authenticated users can comment and like
*/

-- Create custom types
CREATE TYPE style_type AS ENUM ('normal', 'genz', 'alpha');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  preferred_style style_type DEFAULT 'normal',
  interests text[] DEFAULT '{}',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  normal text NOT NULL,
  genz text NOT NULL,
  alpha text NOT NULL,
  image_url text,
  category text NOT NULL,
  published_at timestamptz DEFAULT now(),
  original_url text,
  slug text UNIQUE NOT NULL,
  likes_normal integer DEFAULT 0,
  likes_genz integer DEFAULT 0,
  likes_alpha integer DEFAULT 0,
  rss_source text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  text text NOT NULL,
  style_version style_type NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  style_version style_type NOT NULL,
  timestamp timestamptz DEFAULT now(),
  UNIQUE(article_id, user_id, style_version)
);

-- RSS Feeds table
CREATE TABLE IF NOT EXISTS rss_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text UNIQUE NOT NULL,
  category text NOT NULL,
  active boolean DEFAULT true,
  last_fetched timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Articles policies
CREATE POLICY "Articles are viewable by everyone"
  ON articles
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage articles"
  ON articles
  FOR ALL
  TO authenticated
  USING (false); -- Will be updated for admin users

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage own likes"
  ON likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RSS Feeds policies (admin only)
CREATE POLICY "RSS feeds are viewable by everyone"
  ON rss_feeds
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage RSS feeds"
  ON rss_feeds
  FOR ALL
  TO authenticated
  USING (false); -- Will be updated for admin users

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON comments(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_likes_article_id ON likes(article_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert initial RSS feeds
INSERT INTO rss_feeds (name, url, category, active) VALUES
  ('TechCrunch', 'https://techcrunch.com/feed/', 'Technology', true),
  ('The Verge', 'https://www.theverge.com/rss/index.xml', 'Technology', true),
  ('Wired', 'https://www.wired.com/feed/rss', 'Technology', true),
  ('IGN', 'http://feeds.ign.com/ign/games-all', 'Gaming', true),
  ('GameSpot', 'https://www.gamespot.com/feeds/mashup/', 'Gaming', true),
  ('Polygon', 'https://www.polygon.com/rss/index.xml', 'Gaming', true),
  ('Entertainment Weekly', 'https://ew.com/feed/', 'Entertainment', true),
  ('Variety', 'https://variety.com/feed/', 'Entertainment', true),
  ('ESPN', 'https://www.espn.com/espn/rss/news', 'Sports', true),
  ('Science Daily', 'https://www.sciencedaily.com/rss/all.xml', 'Science', true),
  ('BuzzFeed', 'https://www.buzzfeed.com/index.xml', 'Lifestyle', true),
  ('Mashable', 'http://feeds.mashable.com/Mashable', 'Lifestyle', true)
ON CONFLICT (url) DO NOTHING;