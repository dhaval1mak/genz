/*
  # Update RSS feeds with comprehensive news sources

  1. Updates
    - Add more RSS feed sources for better coverage
    - Include major news outlets across all categories
    - Add new categories like Health, Politics, World News
    
  2. New Categories
    - Health: Medical and health news
    - Politics: Political coverage
    - World: International news
*/

-- Insert comprehensive RSS feeds
INSERT INTO rss_feeds (name, url, category, active) VALUES
  -- Technology - Enhanced Coverage
  ('TechRadar', 'https://www.techradar.com/rss', 'Technology', true),
  ('ZDNet', 'https://www.zdnet.com/news/rss.xml', 'Technology', true),
  ('Gizmodo', 'https://gizmodo.com/rss', 'Technology', true),
  ('CNET', 'https://www.cnet.com/rss/news/', 'Technology', true),
  ('9to5Mac', 'https://9to5mac.com/feed/', 'Technology', true),
  ('Android Authority', 'https://www.androidauthority.com/feed/', 'Technology', true),
  
  -- Gaming - Comprehensive Coverage
  ('GameInformer', 'https://www.gameinformer.com/feeds/thefeed.aspx', 'Gaming', true),
  ('Rock Paper Shotgun', 'https://www.rockpapershotgun.com/feed/', 'Gaming', true),
  ('Destructoid', 'https://www.destructoid.com/feed/', 'Gaming', true),
  ('GamesRadar', 'https://www.gamesradar.com/rss/', 'Gaming', true),
  ('Eurogamer', 'https://www.eurogamer.net/feed', 'Gaming', true),
  ('Giant Bomb', 'https://www.giantbomb.com/feeds/', 'Gaming', true),
  
  -- Entertainment - Major Outlets
  ('Deadline', 'https://deadline.com/feed/', 'Entertainment', true),
  ('TMZ', 'https://www.tmz.com/rss.xml', 'Entertainment', true),
  ('People', 'https://people.com/feed/', 'Entertainment', true),
  ('E! News', 'https://www.eonline.com/news/rss', 'Entertainment', true),
  ('Access Hollywood', 'https://www.accesshollywood.com/feed/', 'Entertainment', true),
  
  -- Sports - Major Networks
  ('The Athletic', 'https://theathletic.com/rss/', 'Sports', true),
  ('CBS Sports', 'https://www.cbssports.com/rss/headlines/', 'Sports', true),
  ('Fox Sports', 'https://www.foxsports.com/rss', 'Sports', true),
  ('NBC Sports', 'https://www.nbcsports.com/feed', 'Sports', true),
  ('Yahoo Sports', 'https://sports.yahoo.com/rss/', 'Sports', true),
  
  -- Science - Leading Publications
  ('Nature News', 'https://www.nature.com/nature.rss', 'Science', true),
  ('New Scientist', 'https://www.newscientist.com/feed/home/', 'Science', true),
  ('Live Science', 'https://www.livescience.com/feeds/all', 'Science', true),
  ('Space.com', 'https://www.space.com/feeds/all', 'Science', true),
  ('Phys.org', 'https://phys.org/rss-feed/', 'Science', true),
  
  -- Business - Financial News
  ('Forbes Tech', 'https://www.forbes.com/technology/feed/', 'Business', true),
  ('Inc.com', 'https://www.inc.com/rss.xml', 'Business', true),
  ('Harvard Business Review', 'https://hbr.org/feed', 'Business', true),
  ('Business Insider', 'https://www.businessinsider.com/rss', 'Business', true),
  ('Fortune', 'https://fortune.com/feed/', 'Business', true),
  
  -- Lifestyle - Popular Culture
  ('Refinery29', 'https://www.refinery29.com/rss.xml', 'Lifestyle', true),
  ('Complex', 'https://www.complex.com/rss.xml', 'Lifestyle', true),
  ('Hypebeast', 'https://hypebeast.com/feed', 'Lifestyle', true),
  ('The Cut', 'https://www.thecut.com/rss.xml', 'Lifestyle', true),
  
  -- Health - Medical News
  ('WebMD', 'https://www.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC', 'Health', true),
  ('Healthline', 'https://www.healthline.com/rss', 'Health', true),
  ('Medical News Today', 'https://www.medicalnewstoday.com/rss', 'Health', true),
  ('Mayo Clinic', 'https://www.mayoclinic.org/rss', 'Health', true),
  ('Harvard Health', 'https://www.health.harvard.edu/rss', 'Health', true),
  
  -- World News - International
  ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'World', true),
  ('Reuters', 'https://www.reuters.com/rssFeed/topNews', 'World', true),
  ('Associated Press', 'https://feeds.apnews.com/rss/apf-topnews', 'World', true),
  ('CNN', 'http://rss.cnn.com/rss/edition.rss', 'World', true),
  ('Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml', 'World', true),
  ('The Guardian', 'https://www.theguardian.com/world/rss', 'World', true),
  
  -- Politics - Political Coverage
  ('Politico', 'https://www.politico.com/rss/politicopicks.xml', 'Politics', true),
  ('The Hill', 'https://thehill.com/news/feed/', 'Politics', true),
  ('NPR Politics', 'https://www.npr.org/rss/rss.php?id=1014', 'Politics', true),
  ('Washington Post Politics', 'https://www.washingtonpost.com/politics/rss/', 'Politics', true),
  ('Axios', 'https://www.axios.com/feeds/feed.rss', 'Politics', true)
ON CONFLICT (url) DO NOTHING;

-- Update existing feeds to ensure they're active
UPDATE rss_feeds SET active = true WHERE active = false;