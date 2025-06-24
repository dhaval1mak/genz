import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';

// Environment variables
const supabaseUrl = 'https://fdnvfdkhhwdpkyomsvoq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbnZmZGtoaHdkcGt5b21zdm9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5NzM1MywiZXhwIjoyMDYzNzczMzUzfQ.dvbEOUkfEG-hucg4N-pBvCVO7DgGvpa6Hg3OE7YUajc';
const geminiApiKey = 'AIzaSyD-Zsfm8b7KE0GGFEA2hxQoswtHhCth1t8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const parser = new Parser({
  timeout: 10000,
  maxRedirects: 10,
});

// RSS feeds to process
const rssFeeds = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Technology' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Technology' },
  { name: 'IGN Gaming', url: 'http://feeds.ign.com/ign/games-all', category: 'Gaming' },
  { name: 'GameSpot', url: 'https://www.gamespot.com/feeds/mashup/', category: 'Gaming' },
  { name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss', category: 'World' },
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'World' },
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'Science' },
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
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      const parsedContent = JSON.parse(jsonMatch[0]);
      
      if (parsedContent.normal && parsedContent.genz && parsedContent.alpha) {
        return {
          normal: parsedContent.normal.substring(0, 500),
          genz: parsedContent.genz.substring(0, 600),
          alpha: parsedContent.alpha.substring(0, 500)
        };
      }
    }
    
    throw new Error('Invalid JSON structure from Gemini API');
  } catch (error) {
    console.error('Error rewriting content with Gemini:', error);
    
    // Fallback content
    const shortContent = content.substring(0, 300);
    return {
      normal: `${title}\\n\\n${shortContent}... [Read more at source]`,
      genz: `OMG y'all! 😱 ${title} just dropped and I'm literally shook! ✨ ${shortContent.substring(0, 150)}... This is giving main character energy! 💅 #BreakingNews #Trending`,
      alpha: `BREAKING: ${title} 🔥 ${shortContent.substring(0, 120)}... This hits different ngl 💪 Major W for news today! #NewsW #Breaking`
    };
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 60);
}

function getDefaultImage(category) {
  const defaultImages = {
    'Technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
    'Gaming': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800',
    'Entertainment': 'https://images.unsplash.com/photo-1489599651404-7a9be3e1b37e?w=800',
    'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'Science': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    'World': 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=800'
  };
  
  return defaultImages[category] || defaultImages['Technology'];
}

async function processRSSFeeds() {
  console.log('🚀 Starting RSS feed processing...');
  
  let totalProcessed = 0;
  let totalErrors = 0;

  for (const feed of rssFeeds) {
    try {
      console.log(`\\n📡 Processing feed: ${feed.name} (${feed.category})`);
      
      // Parse RSS feed
      const feedData = await parser.parseURL(feed.url);
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
            continue;
          }

          console.log(`    📰 Processing: ${title.substring(0, 50)}...`);

          // Check if article already exists
          const { data: existing } = await supabase
            .from('articles')
            .select('id')
            .eq('slug', generateSlug(title))
            .limit(1);

          if (existing && existing.length > 0) {
            console.log(`    ⏭️ Article already exists, skipping...`);
            continue;
          }

          // Rewrite content using Gemini AI
          const rewrittenContent = await rewriteWithGemini(content, title);

          // Create article data
          const articleData = {
            title: title.substring(0, 200),
            normal: rewrittenContent.normal,
            genz: rewrittenContent.genz,
            alpha: rewrittenContent.alpha,
            image_url: getDefaultImage(feed.category),
            category: feed.category,
            published_at: pubDate,
            original_url: link,
            slug: generateSlug(title),
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
            console.log(`    ✅ Successfully created article!`);
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

  console.log(`\\n🎉 RSS processing complete!`);
  console.log(`✅ Successfully processed: ${totalProcessed} articles`);
  console.log(`❌ Errors encountered: ${totalErrors}`);
  
  // Check final article count
  const { data: finalCount } = await supabase
    .from('articles')
    .select('id');
  
  console.log(`📊 Total articles in database: ${finalCount.length}`);
}

// Run the RSS processing
processRSSFeeds().catch(console.error);
