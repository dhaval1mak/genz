import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 STARTING MINIMAL RSS TEST...');
console.log('📅 Time:', new Date().toISOString());

// Environment variables with proper validation
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

console.log('🔐 Environment Check:');
console.log('  - Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  - Supabase Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
console.log('  - Gemini API Key:', geminiApiKey ? '✅ Set' : '❌ Missing');

// Validate required environment variables
if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  console.error('❌ Missing required environment variables. Exiting...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const parser = new Parser({
  timeout: 10000,
  maxRedirects: 5,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; RSSBot/1.0)'
  }
});

// MINIMAL TEST FEEDS - Only most reliable ones
const testFeeds = [
  { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'World' },
  { name: 'NBC News', url: 'https://feeds.nbcnews.com/nbcnews/public/rss/topstories.xml', category: 'World' },
  { name: 'TechCrunch', url: 'https://feeds.feedburner.com/TechCrunch/', category: 'Technology' }
];

// Simple content rewrite without Gemini to test basic functionality
function generateSimpleContent(title, content) {
  const shortContent = content.substring(0, 150);
  return {
    normal: `${title}\n\n${shortContent}...`,
    genz: `Breaking: ${title} 📰 ${shortContent.substring(0, 100)}... Stay tuned! 🔥`,
    alpha: `NEWS: ${title} 💪 ${shortContent.substring(0, 100)}... #Breaking`
  };
}

// Test Gemini API with minimal request
async function testGeminiAPI(article) {
  console.log('🤖 Testing Gemini API...');
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Rewrite this news title in a simple way: "${article.title}"`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.3,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Gemini API test successful');
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Test successful';
    
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    return null;
  }
}

function generateSlug(title, category) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
    
  const timestamp = Date.now().toString().slice(-6);
  return `${baseSlug}-${category.toLowerCase()}-${timestamp}`;
}

function getDefaultImage(category) {
  const defaultImages = {
    'World': 'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Technology': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Business': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'
  };
  return defaultImages[category] || defaultImages['World'];
}

async function processSingleFeedTest(feed) {
  console.log(`\n📡 Testing feed: ${feed.name}`);
  console.log(`   URL: ${feed.url}`);
  
  try {
    // Step 1: Parse RSS feed
    console.log('   🔍 Step 1: Parsing RSS feed...');
    const feedData = await parser.parseURL(feed.url);
    console.log(`   ✅ Found ${feedData.items.length} items`);
    
    if (feedData.items.length === 0) {
      console.log('   ⚠️ No items found in feed');
      return { success: false, error: 'No items found' };
    }
    
    // Step 2: Process first item only
    const item = feedData.items[0];
    const title = item.title?.trim();
    const content = item.contentSnippet || item.content || item.summary || '';
    const link = item.link;
    
    console.log(`   📝 Processing article: "${title?.substring(0, 50)}..."`);
    
    if (!title || title.length < 10) {
      console.log('   ⚠️ Title too short or missing');
      return { success: false, error: 'Invalid title' };
    }
    
    // Step 3: Check for duplicates
    console.log('   🔍 Step 3: Checking for duplicates...');
    const { data: existing, error: checkError } = await supabase
      .from('articles')
      .select('id')
      .eq('original_url', link)
      .limit(1);
      
    if (checkError) {
      console.error('   ❌ Error checking duplicates:', checkError.message);
      return { success: false, error: checkError.message };
    }
    
    if (existing && existing.length > 0) {
      console.log('   ⏭️ Article already exists, skipping');
      return { success: true, processed: 0, skipped: true };
    }
    
    // Step 4: Test Gemini API (optional)
    console.log('   🤖 Step 4: Testing Gemini API...');
    const geminiResult = await testGeminiAPI({ title, content });
    
    // Step 5: Generate content (with or without Gemini)
    console.log('   ✏️ Step 5: Generating content...');
    const contentVersions = geminiResult ? 
      {
        normal: `${title}\n\n${content.substring(0, 150)}...`,
        genz: `${geminiResult} 📰 ${content.substring(0, 100)}...`,
        alpha: `BREAKING: ${title} 🔥 ${content.substring(0, 100)}...`
      } : 
      generateSimpleContent(title, content);
    
    // Step 6: Prepare data for insertion
    console.log('   📊 Step 6: Preparing data for insertion...');
    const articleData = {
      title: title.substring(0, 200),
      normal: contentVersions.normal,
      genz: contentVersions.genz,
      alpha: contentVersions.alpha,
      image_url: item.enclosure?.url || getDefaultImage(feed.category),
      category: feed.category,
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      original_url: link,
      slug: generateSlug(title, feed.category),
      rss_source: feed.name
    };
    
    // Step 7: Insert into database
    console.log('   💾 Step 7: Inserting into database...');
    const { error: insertError } = await supabase
      .from('articles')
      .insert([articleData]);
      
    if (insertError) {
      console.error('   ❌ Error inserting article:', insertError.message);
      return { success: false, error: insertError.message };
    }
    
    console.log('   ✅ Article successfully inserted!');
    return { success: true, processed: 1 };
    
  } catch (error) {
    console.error(`   ❌ Error processing feed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runMinimalTest() {
  console.log('\n🚀 Starting minimal RSS test...');
  const startTime = Date.now();
  
  let totalProcessed = 0;
  let totalErrors = 0;
  let totalSkipped = 0;
  
  // Test each feed sequentially to identify any problematic ones
  for (const feed of testFeeds) {
    try {
      const result = await processSingleFeedTest(feed);
      
      if (result.success) {
        totalProcessed += result.processed || 0;
        if (result.skipped) totalSkipped++;
      } else {
        totalErrors++;
        console.error(`❌ Feed ${feed.name} failed: ${result.error}`);
      }
      
      // Add delay between feeds to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      totalErrors++;
      console.error(`❌ Unhandled error for ${feed.name}:`, error.message);
    }
  }
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log('\n📊 TEST RESULTS:');
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`✅ Processed: ${totalProcessed} articles`);
  console.log(`⏭️  Skipped: ${totalSkipped} articles`);
  console.log(`❌ Errors: ${totalErrors} feeds`);
  console.log(`📈 Success rate: ${Math.round((testFeeds.length - totalErrors) / testFeeds.length * 100)}%`);
  
  // Test final database count
  try {
    const { count, error } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('❌ Error getting final count:', error.message);
    } else {
      console.log(`📊 Total articles in database: ${count}`);
    }
  } catch (error) {
    console.error('❌ Error in final count:', error.message);
  }
  
  console.log('\n🎉 Minimal test completed!');
  
  if (totalErrors === 0) {
    console.log('✅ All tests passed! The basic RSS processing is working.');
  } else {
    console.log('⚠️  Some feeds failed. Check the errors above.');
  }
}

// Run the test
runMinimalTest().catch(error => {
  console.error('❌ FATAL ERROR:', error);
  process.exit(1);
}); 