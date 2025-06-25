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
  timeout: 10000,
  maxRedirects: 10,
});

// RSS feeds to process
const rssFeeds = [
  // Technology
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Technology' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Technology' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', category: 'Technology' },
  
  // Gaming
  { name: 'IGN Gaming', url: 'http://feeds.ign.com/ign/games-all', category: 'Gaming' },
  { name: 'GameSpot', url: 'https://www.gamespot.com/feeds/mashup/', category: 'Gaming' },
  { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', category: 'Gaming' },
  { name: 'Kotaku', url: 'https://kotaku.com/rss', category: 'Gaming' },
  
  // World News
  { name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss', category: 'World' },
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'World' },
  { name: 'Reuters', url: 'https://www.reutersagency.com/feed/?best-topics=all', category: 'World' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'World' },
  
  // Science
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'Science' },
  { name: 'Nature', url: 'https://www.nature.com/nature.rss', category: 'Science' },
  { name: 'Science Magazine', url: 'https://www.science.org/rss/news_current.xml', category: 'Science' },
  
  // Business
  { name: 'Forbes', url: 'https://www.forbes.com/business/feed/', category: 'Business' },
  { name: 'CNBC', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', category: 'Business' },
  { name: 'Financial Times', url: 'https://www.ft.com/rss/home/uk', category: 'Business' },
  
  // Entertainment
  { name: 'Variety', url: 'https://variety.com/feed/', category: 'Entertainment' },
  { name: 'Hollywood Reporter', url: 'https://www.hollywoodreporter.com/feed/', category: 'Entertainment' },
  { name: 'Entertainment Weekly', url: 'https://ew.com/feed/', category: 'Entertainment' },
  
  // Sports
  { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', category: 'Sports' },
  { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'Sports' },
  { name: 'Sports Illustrated', url: 'https://www.si.com/rss/si_topstories.rss', category: 'Sports' },
];

async function rewriteWithGemini(content, title) {
  const prompt = `You are an expert news editor. Rewrite this breaking news article for 3 different audiences while keeping all facts accurate and current.

ARTICLE TITLE: ${title}
ARTICLE CONTENT: ${content}

Create exactly 3 versions:

1. NORMAL (Professional News): Write a clean, professional news summary. Use formal journalism language, focus on facts, include key details. Maximum 200 words. Start with the most important information.

2. GENZ (Social Media Style): Rewrite with TikTok/Instagram energy! Use emojis, modern slang like "bestie", "no cap", "fr fr", "periodt", "slay", "it's giving...", etc. Make it engaging and shareable. Include trending hashtags. Maximum 250 words.

3. ALPHA (Gaming/Discord Culture): Use gaming and internet culture language. Include terms like "based", "cringe", "W/L", "no cap", "fr", "poggers", "sus", "chad", "sigma", etc. Short, punchy sentences. Gaming/meme references welcome. Maximum 200 words.

IMPORTANT: Return ONLY a valid JSON object with exactly these keys: "normal", "genz", "alpha". No other text, explanations, or formatting.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    // Extract JSON from the response - improved parsing
    let parsedContent = null;

    // Method 1: Try to parse the entire response as JSON
    try {
      parsedContent = JSON.parse(generatedText);
      console.log("Successfully parsed complete JSON response");
    } catch (parseError) {
      console.log("Could not parse complete response as JSON, trying alternate methods");
      
      // Method 2: Try to extract JSON using regex pattern matching
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0]);
          console.log("Successfully extracted JSON using regex");
        }
      } catch (regexError) {
        console.log("Regex JSON extraction failed");
      }
      
      // Method 3: Try to clean up the text and parse it
      if (!parsedContent) {
        try {
          // Remove potential markdown code block formatting
          let cleanText = generatedText
            .replace(/```json|```/g, '')
            .trim();
            
          // Handle potential single quotes instead of double quotes
          cleanText = cleanText.replace(/'/g, '"');
          
          parsedContent = JSON.parse(cleanText);
          console.log("Successfully parsed JSON after cleanup");
        } catch (cleanupError) {
          console.log("Cleanup parsing failed");
        }
      }
      
      // Method 4: Try to extract using line-by-line approach
      if (!parsedContent) {
        try {
          const lines = generatedText.split('\n');
          let jsonContent = '';
          let inJson = false;
          
          for (const line of lines) {
            if (line.includes('{') && !inJson) {
              inJson = true;
              jsonContent += line;
            } else if (inJson) {
              jsonContent += line;
              if (line.includes('}')) {
                break;
              }
            }
          }
          
          if (jsonContent) {
            parsedContent = JSON.parse(jsonContent);
            console.log("Successfully extracted JSON using line-by-line approach");
          }
        } catch (lineError) {
          console.log("Line-by-line JSON extraction failed");
        }
      }
    }

    // Check if we have valid content
    if (parsedContent && parsedContent.normal && parsedContent.genz && parsedContent.alpha) {
      return {
        normal: parsedContent.normal.substring(0, 500),
        genz: parsedContent.genz.substring(0, 600),
        alpha: parsedContent.alpha.substring(0, 500)
      };
    }
      // If we reach here, we couldn't extract valid JSON
    console.warn('Could not parse valid JSON from Gemini API, using fallback content');
    // Throw error to trigger fallback content in catch block
    throw new Error('Failed to extract valid JSON with required fields');
    
  } catch (error) {
    console.error('Error processing content with Gemini:', error.message);
    
    // Fallback content
    const shortContent = content.substring(0, 300);
    return {
      normal: `${title}\n\n${shortContent}... [Read more at source]`,
      genz: `OMG y'all! 😱 ${title} just dropped and I'm literally shook! ✨ ${shortContent.substring(0, 150)}... This is giving main character energy! 💅 #BreakingNews #Trending`,
      alpha: `BREAKING: ${title} 🔥 ${shortContent.substring(0, 120)}... This hits different ngl 💪 Major W for news today! #NewsW #Breaking`
    };
  }
}

function generateSlug(title, category) {
  // Generate base slug from title - more aggressive cleaning for better SEO
  const baseSlug = title
    .toLowerCase()
    // Replace non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove common stop words that don't add SEO value
    .replace(/\b(the|a|an|and|but|or|for|nor|on|at|to|from|by|with|in)\b/g, '')
    // Replace multiple hyphens with a single hyphen
    .replace(/-+/g, '-')
    // Remove hyphens at the beginning and end
    .replace(/(^-|-$)/g, '')
    // Limit length for readability
    .substring(0, 60);
    
  // Add category to improve SEO and uniqueness
  const categorySlug = category 
    ? `-${category.toLowerCase().replace(/[^a-z0-9]+/g, '')}`
    : '';
    
  // Add timestamp for guaranteed uniqueness (using both date and time components)
  const date = new Date();
  const timestamp = `${date.getMonth() + 1}${date.getDate()}${date.getHours()}${date.getMinutes().toString().padStart(2, '0')}`;
  
  // Final slug format: title-category-timestamp
  return `${baseSlug}${categorySlug}-${timestamp}`;
}

function getDefaultImage(category) {
  const defaultImages = {
    // Original categories
    'Technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
    'Gaming': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800',
    'Entertainment': 'https://images.unsplash.com/photo-1489599651404-7a9be3e1b37e?w=800',
    'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'Science': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    'World': 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=800',
    
    // New categories with high-quality images
    'Health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
    'Finance': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
    'Politics': 'https://images.unsplash.com/photo-1575320181282-9afab399332c?w=800',
    'Education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    'Environment': 'https://images.unsplash.com/photo-1500622944204-b135684e99fd?w=800',
    'AI': 'https://images.unsplash.com/photo-1677442135143-842cd1940355?w=800',
    'CryptoWeb3': 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800',
    'Food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    'Travel': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
    'Fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800'
  };
  
  return defaultImages[category] || defaultImages['Technology']; // Default to Technology if category not found
}

async function processRSSFeeds() {
  console.log('🚀 Starting RSS feed processing...');
  
  let totalProcessed = 0;
  let totalErrors = 0;
  let totalSkipped = 0;

  for (const feed of rssFeeds) {
    try {
      console.log(`\n📡 Processing feed: ${feed.name} (${feed.category})`);
      
      // Parse RSS feed with retry logic
      let feedData;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          feedData = await parser.parseURL(feed.url);
          break; // Success, exit the retry loop
        } catch (parseError) {
          retries++;
          console.log(`  ⚠️ Error parsing feed (attempt ${retries}/${maxRetries}): ${parseError.message}`);
          if (retries >= maxRetries) {
            throw new Error(`Failed to parse feed after ${maxRetries} attempts`);
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000 * retries));
        }
      }
      
      console.log(`  Found ${feedData.items.length} items`);

      // Process top 3 items from each feed
      const itemsToProcess = feedData.items.slice(0, 3);
      
      for (const item of itemsToProcess) {
        try {
          const title = item.title?.trim();
          const content = item.contentSnippet || item.content || item.summary || '';
          const link = item.link;
          const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

          if (!title || title.length < 10 || content.length < 50) {
            console.log(`    ⚠️ Skipping article (too short): ${title}`);
            totalSkipped++;
            continue;
          }

          console.log(`    📰 Processing: ${title.substring(0, 50)}...`);
          
          // Check if article already exists - more robust check
          const { data: existing } = await supabase
            .from('articles')
            .select('id, title, slug')
            .or(`title.ilike.%${title.substring(0, 30)}%, original_url.eq.${link}`)
            .limit(1);

          if (existing && existing.length > 0) {
            console.log(`    ⏭️ Article already exists with title: ${existing[0].title.substring(0, 30)}... (id: ${existing[0].id})`);
            totalSkipped++;
            continue;
          }

          // Generate a unique slug for this article
          const articleSlug = generateSlug(title, feed.category);

          // Rewrite content using Gemini AI with retry logic
          let rewrittenContent;
          retries = 0;
          
          while (retries < maxRetries) {
            try {
              rewrittenContent = await rewriteWithGemini(content, title);
              break; // Success, exit the retry loop
            } catch (geminiError) {
              retries++;
              console.log(`    ⚠️ Gemini API error (attempt ${retries}/${maxRetries}): ${geminiError.message}`);
              if (retries >= maxRetries) {
                // Use fallback content after max retries
                const shortContent = content.substring(0, 300);
                rewrittenContent = {
                  normal: `${title}\n\n${shortContent}... [Read more at source]`,
                  genz: `OMG y'all! 😱 ${title} just dropped and I'm literally shook! ✨ ${shortContent.substring(0, 150)}... This is giving main character energy! 💅 #BreakingNews #Trending`,
                  alpha: `BREAKING: ${title} 🔥 ${shortContent.substring(0, 120)}... This hits different ngl 💪 Major W for news today! #NewsW #Breaking`
                };
                break;
              }
              // Wait before retrying with increasing backoff
              await new Promise(resolve => setTimeout(resolve, 3000 * retries));
            }
          }
          
          // Create article data
          const articleData = {
            title: title.substring(0, 200),
            normal: rewrittenContent.normal,
            genz: rewrittenContent.genz,
            alpha: rewrittenContent.alpha,
            image_url: item.enclosure?.url || getDefaultImage(feed.category),
            category: feed.category,
            published_at: pubDate,
            original_url: link,
            slug: articleSlug,
            rss_source: feed.name
          };

          // Insert article
          const { error: insertError } = await supabase
            .from('articles')
            .insert([articleData]);

          if (insertError) {
            console.error(`    ❌ Error inserting article: ${insertError.message}`);
            totalErrors++;
          } else {
            console.log(`    ✅ Successfully created article with slug: ${articleSlug}`);
            totalProcessed++;
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`    ❌ Error processing article: ${error.message}`);
          totalErrors++;
        }
      }

    } catch (error) {
      console.error(`❌ Error processing feed ${feed.name}: ${error.message}`);
      totalErrors++;
    }
  }
  console.log(`\n🎉 RSS processing complete!`);
  console.log(`✅ Successfully processed: ${totalProcessed} articles`);
  console.log(`⏭️ Articles skipped: ${totalSkipped}`);
  console.log(`❌ Errors encountered: ${totalErrors}`);
  
  // Check final article count
  const { count: finalCount, error: countError } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {    console.error(`❌ Error counting articles: ${countError.message}`);
  } else {
    console.log(`📊 Total articles in database: ${finalCount}`);
    
    // Update the site_stats table with the current count
    await updateSiteStats(finalCount, totalProcessed);
  }
}

// Function to update site statistics
async function updateSiteStats(totalArticles, newArticlesAdded) {
  console.log(`🔄 Updating site statistics...`);
  
  try {
    // Check if stats record exists
    const { data, error: fetchError } = await supabase
      .from('site_stats')
      .select('*')
      .eq('id', 'global_stats')
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching site stats:', fetchError.message);
      return;
    }
    
    const stats = {
      id: 'global_stats',
      total_articles: totalArticles,
      last_updated: new Date().toISOString(),
      last_fetch_count: newArticlesAdded
    };
    
    if (data) {
      // Update existing stats record
      const { error } = await supabase
        .from('site_stats')
        .update(stats)
        .eq('id', 'global_stats');
        
      if (error) {
        console.error('Error updating site stats:', error.message);
      } else {
        console.log(`📊 Site stats updated: ${totalArticles} total articles`);
      }
    } else {
      // Create new stats record
      const { error } = await supabase
        .from('site_stats')
        .insert([stats]);
        
      if (error) {
        console.error('Error creating site stats:', error.message);
      } else {
        console.log(`📊 Site stats created: ${totalArticles} total articles`);
      }
    }
  } catch (error) {
    console.error('Error handling site stats:', error.message);
  }
}

// Run the RSS processing
processRSSFeeds().catch(console.error);

// Export for use in other modules
export default {
  rssFeeds
};
