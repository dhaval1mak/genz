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

// Prioritized RSS feeds (most reliable ones first)
const rssFeeds = [
  // Most reliable feeds first
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology' },
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'World' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology' },
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'Science' },
  { name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss', category: 'World' },
  
  // Secondary feeds (may have issues)
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Technology' },
  { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', category: 'Gaming' },
  { name: 'Forbes', url: 'https://www.forbes.com/business/feed/', category: 'Business' },
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
    'Technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
    'Gaming': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800',
    'Entertainment': 'https://images.unsplash.com/photo-1489599651404-7a9be3e1b37e?w=800',
    'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'Science': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    'World': 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=800',
  };
  
  return defaultImages[category] || defaultImages['Technology'];
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
    console.log(`  Found ${feedData.items.length} items`);

    // Get top 2 items (reduced from 3)
    const items = feedData.items.slice(0, 2);
    
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
  const startTime = Date.now();
  
  // Process feeds concurrently
  const results = await processFeedsConcurrently(rssFeeds, 3);
  
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
