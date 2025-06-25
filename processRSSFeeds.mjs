import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import dotenv from 'dotenv';

// Load environment variables from .env file (for local development)
dotenv.config();

// Environment variables - use environment variables or fallback to hardcoded for backwards compatibility
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://fdnvfdkhhwdpkyomsvoq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbnZmZGtoaHdkcGt5b21zdm9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5NzM1MywiZXhwIjoyMDYzNzczMzUzfQ.dvbEOUkfEG-hucg4N-pBvCVO7DgGvpa6Hg3OE7YUajc';
const geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyD-Zsfm8b7KE0GGFEA2hxQoswtHhCth1t8';

// Validate required environment variables
if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('  - SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_KEY');
  if (!geminiApiKey) console.error('  - GEMINI_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const parser = new Parser({
  timeout: 5000, // Reduced timeout
  maxRedirects: 5,
});

// Comprehensive RSS feeds organized by category
const rssFeeds = [
  // General & Breaking News
  { name: 'AP News', url: 'https://apnews.com/index.rss', category: 'World' },
  { name: 'CNN Top Stories', url: 'http://rss.cnn.com/rss/cnn_topstories.rss', category: 'World' },
  { name: 'NY Times', url: 'http://feeds.nytimes.com/nyt/rss/HomePage', category: 'World' },
  { name: 'NBC News', url: 'https://feeds.nbcnews.com/nbcnews/public/rss/topstories.xml', category: 'World' },
  { name: 'ABC News', url: 'http://abcnews.go.com/abcnews/topstories_rss', category: 'World' },
  { name: 'Reuters', url: 'https://www.reutersagency.com/feed/?best-topics=top-news', category: 'World' },
  { name: 'NPR', url: 'https://www.npr.org/rss/rss.php?id=1001', category: 'World' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'World' },
  { name: 'Deutsche Welle', url: 'https://rss.dw.com/rdf/rss-en-all', category: 'World' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', category: 'World' },

  // Business & Finance
  { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', category: 'Business' },
  { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'Business' },
  { name: 'Investing.com', url: 'https://www.investing.com/rss/news_25.rss', category: 'Business' },
  { name: 'MarketWatch', url: 'https://www.marketwatch.com/rss/topstories', category: 'Business' },
  { name: 'Politico', url: 'https://www.politico.com/rss/politicopicks.xml', category: 'Politics' },

  // Technology & Startups
  { name: 'TechCrunch', url: 'http://feeds.feedburner.com/TechCrunch/', category: 'Technology' },
  { name: 'Wired', url: 'http://feeds.wired.com/wired/index', category: 'Technology' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology' },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'Technology' },
  { name: 'Ars Technica', url: 'http://feeds.arstechnica.com/arstechnica/index', category: 'Technology' },
  { name: 'MIT Tech Review', url: 'http://www.technologyreview.com/stream/rss/', category: 'Technology' },
  { name: 'The Next Web', url: 'https://thenextweb.com/feed/', category: 'Technology' },
  { name: 'Android Authority', url: 'https://www.androidauthority.com/feed/', category: 'Technology' },
  { name: '9to5Mac', url: 'https://9to5mac.com/feed/', category: 'Technology' },
  { name: 'Techmeme', url: 'https://techmeme.com/feed.xml', category: 'Technology' },

  // Sports
  { name: 'ESPN', url: 'http://sports.espn.go.com/espn/rss/news', category: 'Sports' },
  { name: 'CBS Sports', url: 'http://www.cbssports.com/partners/feeds/rss/home_news', category: 'Sports' },
  { name: 'Sky Sports', url: 'https://www.skysports.com/rss/12040', category: 'Sports' },
  { name: 'Sporting News', url: 'https://www.sportingnews.com/us/rss', category: 'Sports' },
  { name: 'Guardian Football', url: 'https://www.theguardian.com/football/rss', category: 'Sports' },
  { name: 'BBC Sport', url: 'https://www.bbc.com/sport/0/rss.xml', category: 'Sports' },
  { name: 'RotoWire', url: 'https://www.rotowire.com/rss.xml', category: 'Sports' },

  // Science & Innovation
  { name: 'Science Daily', url: 'http://feeds.sciencedaily.com/sciencedaily/top_news', category: 'Science' },
  { name: 'Nature Technology', url: 'https://www.nature.com/subjects/technology.rss', category: 'Science' },
  { name: 'Scientific American', url: 'https://rss.sciam.com/ScientificAmerican-News', category: 'Science' },
  { name: 'New Scientist', url: 'https://www.newscientist.com/feed/home/', category: 'Science' },
  { name: 'Space Headlines', url: 'https://feeds.feedburner.com/spaceheadlines', category: 'Science' },

  // Culture & Media
  { name: 'Rolling Stone', url: 'https://www.rollingstone.com/feed/', category: 'Entertainment' },
  { name: 'NY Times Arts', url: 'https://www.nytimes.com/services/xml/rss/nyt/Arts.xml', category: 'Entertainment' },
  { name: 'Vulture', url: 'https://www.vulture.com/rss/index.xml', category: 'Entertainment' },
  { name: 'Pitchfork', url: 'https://pitchfork.com/rss/news/', category: 'Entertainment' },
];

// Batch processing for Gemini API to reduce API calls
async function batchRewriteWithGemini(articles) {
  if (articles.length === 0) return [];
  
  const prompt = `You are an expert news editor. Rewrite these ${articles.length} news articles for 3 different audiences each. Return a JSON array with the same order.

ARTICLES:
${articles.map((article, index) => `${index + 1}. TITLE: ${article.title}\nCONTENT: ${article.content}\n`).join('\n')}

For each article, create exactly 3 versions:
1. NORMAL: Professional news summary (max 150 words)
2. GENZ: Social media style with emojis and slang (max 180 words)  
3. ALPHA: Gaming/internet culture language (max 150 words)

Return ONLY a JSON array like: [{"normal":"...", "genz":"...", "alpha":"..."}, ...]`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) throw new Error('No content generated');

    // Try to parse JSON from response
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedText);
    } catch {
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      }
    }

    if (Array.isArray(parsedContent) && parsedContent.length === articles.length) {
      return parsedContent;
    }
    
    throw new Error('Invalid response format');
    
  } catch (error) {
    console.error('Batch Gemini processing failed:', error.message);
    
    // Fallback: return simple rewrites for all articles
    return articles.map(article => {
      const shortContent = article.content.substring(0, 200);
      return {
        normal: `${article.title}\n\n${shortContent}... [Read more at source]`,
        genz: `OMG! 😱 ${article.title} just dropped! ✨ ${shortContent.substring(0, 120)}... This hits different! 💅 #Breaking`,
        alpha: `BREAKING: ${article.title} 🔥 ${shortContent.substring(0, 100)}... Major W! 💪 #NewsW`
      };
    });
  }
}

function generateSlug(title, category) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
    
  const date = new Date();
  const timestamp = `${date.getMonth() + 1}${date.getDate()}${date.getHours()}${date.getMinutes()}`;
  
  return `${baseSlug}-${category.toLowerCase()}-${timestamp}`;
}

function getDefaultImage(category) {
  const defaultImages = {
    'Technology': [
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Gaming': [
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Entertainment': [
      'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3709369/pexels-photo-3709369.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Sports': [
      'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Science': [
      'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Business': [
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Lifestyle': [
      'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Health': [
      'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Politics': [
      'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1550340/pexels-photo-1550340.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'World': [
      'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  };
  
  const images = defaultImages[category] || defaultImages['Technology'];
  return images[Math.floor(Math.random() * images.length)];
}

// Process feeds in parallel with limited concurrency
async function processFeedsConcurrently(feeds, maxConcurrency = 3) {
  const results = [];
  
  for (let i = 0; i < feeds.length; i += maxConcurrency) {
    const batch = feeds.slice(i, i + maxConcurrency);
    const batchPromises = batch.map(feed => processSingleFeed(feed));
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + maxConcurrency < feeds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

async function processSingleFeed(feed) {
  try {
    console.log(`📡 Processing feed: ${feed.name}`);
    
    const feedData = await parser.parseURL(feed.url);
    console.log(`  Found ${feedData.items.length} items`);    // Get top 1 item per feed (optimized for large feed count)
    const items = feedData.items.slice(0, 1);
    
    // Prepare articles for batch processing
    const articlesToProcess = [];
    
    for (const item of items) {
      const title = item.title?.trim();
      const content = item.contentSnippet || item.content || item.summary || '';
      const link = item.link;
      
      if (!title || title.length < 10 || content.length < 30) continue;
      
      // Quick duplicate check with simpler query
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('original_url', link)
        .limit(1);
        
      if (existing && existing.length > 0) {
        console.log(`  ⏭️ Article exists: ${title.substring(0, 30)}...`);
        continue;
      }
      
      articlesToProcess.push({
        title,
        content: content.substring(0, 800), // Limit content length for Gemini
        link,
        pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        imageUrl: item.enclosure?.url || getDefaultImage(feed.category),
        category: feed.category,
        sourceName: feed.name
      });
    }
    
    if (articlesToProcess.length === 0) {
      console.log(`  No new articles to process for ${feed.name}`);
      return { success: true, processed: 0 };
    }
    
    // Batch process with Gemini
    console.log(`  🤖 Processing ${articlesToProcess.length} articles with Gemini...`);
    const rewrittenContents = await batchRewriteWithGemini(articlesToProcess);
    
    // Prepare data for batch insert
    const articleData = articlesToProcess.map((article, index) => ({
      title: article.title.substring(0, 200),
      normal: rewrittenContents[index]?.normal || `${article.title}\n\n${article.content}`,
      genz: rewrittenContents[index]?.genz || `OMG! ${article.title} 😱`,
      alpha: rewrittenContents[index]?.alpha || `BREAKING: ${article.title} 🔥`,
      image_url: article.imageUrl,
      category: article.category,
      published_at: article.pubDate,
      original_url: article.link,
      slug: generateSlug(article.title, article.category),
      rss_source: article.sourceName
    }));
    
    // Batch insert all articles
    const { error: insertError } = await supabase
      .from('articles')
      .insert(articleData);
      
    if (insertError) {
      console.error(`  ❌ Error inserting articles: ${insertError.message}`);
      return { success: false, processed: 0, error: insertError.message };
    }
    
    console.log(`  ✅ Successfully inserted ${articleData.length} articles`);
    return { success: true, processed: articleData.length };
    
  } catch (error) {
    console.error(`❌ Error processing feed ${feed.name}: ${error.message}`);
    return { success: false, processed: 0, error: error.message };
  }
}

async function updateSiteStats(totalArticles, newArticlesAdded) {
  try {
    const stats = {
      id: 'global_stats',
      total_articles: totalArticles,
      last_updated: new Date().toISOString(),
      last_fetch_count: newArticlesAdded
    };
    
    const { error } = await supabase
      .from('site_stats')
      .upsert(stats);
      
    if (error) {
      console.error('Error updating site stats:', error.message);
    } else {
      console.log(`📊 Site stats updated: ${totalArticles} total articles`);
    }
  } catch (error) {
    console.error('Error handling site stats:', error.message);
  }
}

async function processRSSFeeds() {
  console.log('🚀 Starting optimized RSS feed processing...');
  console.log(`📊 Processing ${rssFeeds.length} RSS feeds with parallel processing`);
  const startTime = Date.now();
  
  // Process feeds concurrently with increased concurrency for large feed list
  const results = await processFeedsConcurrently(rssFeeds, 5); // Increased from 3 to 5
  
  // Calculate totals
  let totalProcessed = 0;
  let totalErrors = 0;
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.success) {
      totalProcessed += result.value.processed;
    } else {
      totalErrors++;
    }
  });
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log(`\n🎉 RSS processing complete in ${duration}s!`);
  console.log(`✅ Successfully processed: ${totalProcessed} articles`);
  console.log(`❌ Errors encountered: ${totalErrors}`);
  console.log(`📈 Success rate: ${Math.round((results.length - totalErrors) / results.length * 100)}%`);
  
  // Update stats
  const { count: finalCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });
    
  if (finalCount !== null) {
    console.log(`📊 Total articles in database: ${finalCount}`);
    await updateSiteStats(finalCount, totalProcessed);
  }
}

// Run the optimized RSS processing
processRSSFeeds().catch(console.error);

export default { rssFeeds };
