import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  preferred_style: 'normal' | 'genz' | 'alpha';
  onboarding_completed: boolean;
  created_at: string;
  interests: string[];
}

export interface Article {
  id: string;
  title: string;
  normal: string;
  genz: string;
  alpha: string;
  image_url?: string;
  category: string;
  published_at: string;
  original_url?: string;
  slug: string;
  likes_normal: number;
  likes_genz: number;
  likes_alpha: number;
  rss_source: string;
  created_at: string;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  name: string;
  text: string;
  timestamp: string;
  style_version: 'normal' | 'genz' | 'alpha';
}

export interface Like {
  id: string;
  article_id: string;
  user_id: string;
  style_version: 'normal' | 'genz' | 'alpha';
  timestamp: string;
}

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  last_fetched: string;
}

// Enhanced RSS Feed URLs for comprehensive news coverage
export const RSS_FEEDS: Omit<RSSFeed, 'id' | 'last_fetched'>[] = [
  // Technology - Major Sources
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology', active: true },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology', active: true },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Technology', active: true },
  { name: 'Ars Technica', url: 'http://feeds.arstechnica.com/arstechnica/index', category: 'Technology', active: true },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'Technology', active: true },
  { name: 'TechRadar', url: 'https://www.techradar.com/rss', category: 'Technology', active: true },
  { name: 'ZDNet', url: 'https://www.zdnet.com/news/rss.xml', category: 'Technology', active: true },
  { name: 'Gizmodo', url: 'https://gizmodo.com/rss', category: 'Technology', active: true },
  
  // Gaming - Comprehensive Coverage
  { name: 'IGN', url: 'http://feeds.ign.com/ign/games-all', category: 'Gaming', active: true },
  { name: 'GameSpot', url: 'https://www.gamespot.com/feeds/mashup/', category: 'Gaming', active: true },
  { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', category: 'Gaming', active: true },
  { name: 'Kotaku', url: 'https://kotaku.com/rss', category: 'Gaming', active: true },
  { name: 'PC Gamer', url: 'https://www.pcgamer.com/rss/', category: 'Gaming', active: true },
  { name: 'GameInformer', url: 'https://www.gameinformer.com/feeds/thefeed.aspx', category: 'Gaming', active: true },
  { name: 'Rock Paper Shotgun', url: 'https://www.rockpapershotgun.com/feed/', category: 'Gaming', active: true },
  { name: 'Destructoid', url: 'https://www.destructoid.com/feed/', category: 'Gaming', active: true },
  
  // Entertainment - Major Outlets
  { name: 'Entertainment Weekly', url: 'https://ew.com/feed/', category: 'Entertainment', active: true },
  { name: 'Variety', url: 'https://variety.com/feed/', category: 'Entertainment', active: true },
  { name: 'The Hollywood Reporter', url: 'https://www.hollywoodreporter.com/feed/', category: 'Entertainment', active: true },
  { name: 'Rolling Stone', url: 'https://www.rollingstone.com/feed/', category: 'Entertainment', active: true },
  { name: 'Billboard', url: 'https://www.billboard.com/feed/', category: 'Entertainment', active: true },
  { name: 'Deadline', url: 'https://deadline.com/feed/', category: 'Entertainment', active: true },
  { name: 'TMZ', url: 'https://www.tmz.com/rss.xml', category: 'Entertainment', active: true },
  
  // Sports - Major Networks
  { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', category: 'Sports', active: true },
  { name: 'Sports Illustrated', url: 'https://www.si.com/rss/si_topstories.rss', category: 'Sports', active: true },
  { name: 'Bleacher Report', url: 'https://bleacherreport.com/articles/feed', category: 'Sports', active: true },
  { name: 'The Athletic', url: 'https://theathletic.com/rss/', category: 'Sports', active: true },
  { name: 'CBS Sports', url: 'https://www.cbssports.com/rss/headlines/', category: 'Sports', active: true },
  { name: 'Fox Sports', url: 'https://www.foxsports.com/rss', category: 'Sports', active: true },
  
  // Science - Leading Publications
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'Science', active: true },
  { name: 'Popular Science', url: 'https://www.popsci.com/feed/', category: 'Science', active: true },
  { name: 'Scientific American', url: 'http://rss.sciam.com/ScientificAmerican-Global', category: 'Science', active: true },
  { name: 'Nature News', url: 'https://www.nature.com/nature.rss', category: 'Science', active: true },
  { name: 'New Scientist', url: 'https://www.newscientist.com/feed/home/', category: 'Science', active: true },
  { name: 'Live Science', url: 'https://www.livescience.com/feeds/all', category: 'Science', active: true },
  
  // Business - Financial News
  { name: 'TechCrunch Startups', url: 'https://techcrunch.com/category/startups/feed/', category: 'Business', active: true },
  { name: 'Entrepreneur', url: 'https://www.entrepreneur.com/latest.rss', category: 'Business', active: true },
  { name: 'Fast Company', url: 'https://www.fastcompany.com/rss.xml', category: 'Business', active: true },
  { name: 'Forbes Tech', url: 'https://www.forbes.com/technology/feed/', category: 'Business', active: true },
  { name: 'Inc.com', url: 'https://www.inc.com/rss.xml', category: 'Business', active: true },
  { name: 'Harvard Business Review', url: 'https://hbr.org/feed', category: 'Business', active: true },
  
  // Lifestyle - Popular Culture
  { name: 'BuzzFeed', url: 'https://www.buzzfeed.com/index.xml', category: 'Lifestyle', active: true },
  { name: 'Mashable', url: 'http://feeds.mashable.com/Mashable', category: 'Lifestyle', active: true },
  { name: 'Vice', url: 'https://www.vice.com/en/rss', category: 'Lifestyle', active: true },
  { name: 'Refinery29', url: 'https://www.refinery29.com/rss.xml', category: 'Lifestyle', active: true },
  { name: 'Complex', url: 'https://www.complex.com/rss.xml', category: 'Lifestyle', active: true },
  
  // Health - Medical News
  { name: 'WebMD', url: 'https://www.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC', category: 'Health', active: true },
  { name: 'Healthline', url: 'https://www.healthline.com/rss', category: 'Health', active: true },
  { name: 'Medical News Today', url: 'https://www.medicalnewstoday.com/rss', category: 'Health', active: true },
  
  // World News - International
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'World', active: true },
  { name: 'Reuters', url: 'https://www.reuters.com/rssFeed/topNews', category: 'World', active: true },
  { name: 'Associated Press', url: 'https://feeds.apnews.com/rss/apf-topnews', category: 'World', active: true },
  { name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss', category: 'World', active: true },
  
  // Politics - Political Coverage
  { name: 'Politico', url: 'https://www.politico.com/rss/politicopicks.xml', category: 'Politics', active: true },
  { name: 'The Hill', url: 'https://thehill.com/news/feed/', category: 'Politics', active: true },
  { name: 'NPR Politics', url: 'https://www.npr.org/rss/rss.php?id=1014', category: 'Politics', active: true }
];

// Authentication functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// User preferences functions
export const updateUserPreferences = async (userId: string, preferences: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: userId, ...preferences })
    .select();
  return { data, error };
};

export const getUserPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

// Article functions
export const getArticles = async (limit: number = 10, offset: number = 0, interests: string[] = []) => {
  let query = supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (interests.length > 0) {
    query = query.in('category', interests.map(i => i.charAt(0).toUpperCase() + i.slice(1)));
  }

  return await query;
};

export const getArticleBySlug = async (slug: string) => {
  return await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();
};

// RSS and AI integration functions
export const createArticle = async (articleData: Omit<Article, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('articles')
    .insert([articleData])
    .select();
  return { data, error };
};

export const getRSSFeeds = async () => {
  const { data, error } = await supabase
    .from('rss_feeds')
    .select('*')
    .eq('active', true);
  return { data, error };
};

export const updateRSSFeedLastFetched = async (feedId: string) => {
  const { data, error } = await supabase
    .from('rss_feeds')
    .update({ last_fetched: new Date().toISOString() })
    .eq('id', feedId);
  return { data, error };
};

// Initialize RSS feeds in database
export const initializeRSSFeeds = async () => {
  for (const feed of RSS_FEEDS) {
    const { error } = await supabase
      .from('rss_feeds')
      .upsert(feed, { onConflict: 'url' });
    
    if (error) {
      console.error(`Error inserting RSS feed ${feed.name}:`, error);
    }
  }
};