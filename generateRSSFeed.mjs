import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const SITE_URL = 'https://slangpress.netlify.app';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('  - SUPABASE_URL or VITE_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to generate RSS feed XML
function generateRSSFeed(articles) {
  const now = new Date().toISOString();
  
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>SlangPress - Latest News & Articles</title>
    <link>${SITE_URL}</link>
    <description>Stay updated with the latest news, technology updates, and trending stories from around the world. Fresh content updated regularly.</description>
    <language>en-US</language>
    <lastBuildDate>${now}</lastBuildDate>
    <pubDate>${now}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/favicon.png</url>
      <title>SlangPress</title>
      <link>${SITE_URL}</link>
    </image>
    ${articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${SITE_URL}/article/${article.slug}</link>
      <guid>${SITE_URL}/article/${article.slug}</guid>
      <pubDate>${new Date(article.published_at || article.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${article.normal || article.title}]]></description>
      <content:encoded><![CDATA[${article.normal || article.title}]]></content:encoded>
      <dc:creator>SlangPress</dc:creator>
      <category>${article.category || 'General'}</category>
      ${article.image_url ? `<media:content url="${article.image_url}" medium="image" />` : ''}
    </item>`).join('')}
  </channel>
</rss>`;

  return rssXml;
}

// Function to generate RSS feeds
async function generateRSSFeeds() {
  console.log('📰 Generating RSS feeds...');
  
  try {
    // Fetch all articles from the database
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(100); // Limit to latest 100 articles for RSS

    if (error) {
      throw new Error(`Error fetching articles: ${error.message}`);
    }

    if (!articles || articles.length === 0) {
      console.log('No articles found for RSS feed generation.');
      return;
    }

    console.log(`Found ${articles.length} articles for RSS feed generation.`);

    // Import fs module
    const fs = await import('fs');

    // Generate main RSS feed
    const mainRSS = generateRSSFeed(articles);
    fs.writeFileSync('rss.xml', mainRSS);
    console.log('✅ Main RSS feed generated: rss.xml');

    // Generate RSS feed for public directory (for web access)
    const publicDir = 'public';
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(`${publicDir}/rss.xml`, mainRSS);
    console.log('✅ RSS feed copied to public directory');

    console.log('\n🎉 RSS feed generation completed successfully!');
    console.log(`📊 Generated feeds:`);
    console.log(`  - Main feed: rss.xml (${articles.length} articles)`);
    console.log(`  - Public access: public/rss.xml`);

  } catch (error) {
    console.error('❌ Error generating RSS feeds:', error.message);
    process.exit(1);
  }
}

// Function to validate RSS feed
async function validateRSSFeed() {
  console.log('🔍 Validating RSS feed...');
  
  try {
    const fs = await import('fs');
    
    if (!fs.existsSync('rss.xml')) {
      console.error('❌ RSS feed file not found');
      return false;
    }

    const rssContent = fs.readFileSync('rss.xml', 'utf8');
    
    // Basic XML validation
    if (!rssContent.includes('<?xml version="1.0"')) {
      console.error('❌ Invalid XML format');
      return false;
    }

    if (!rssContent.includes('<rss version="2.0"')) {
      console.error('❌ Invalid RSS format');
      return false;
    }

    if (!rssContent.includes('<channel>')) {
      console.error('❌ Missing channel element');
      return false;
    }

    // Count items
    const itemCount = (rssContent.match(/<item>/g) || []).length;
    console.log(`✅ RSS feed validation passed`);
    console.log(`📊 Contains ${itemCount} items`);
    
    return true;
    
  } catch (error) {
    console.error('❌ RSS validation error:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting RSS feed generation...');
  
  try {
    await generateRSSFeeds();
    await validateRSSFeed();
    
    console.log('\n💡 RSS feeds are ready for SEO indexing!');
    console.log('🔗 Main feed URL: https://slangpress.netlify.app/rss.xml');
    
  } catch (error) {
    console.error('❌ RSS generation failed:', error.message);
    process.exit(1);
  }
}

// Run the RSS generation
main().catch(error => {
  console.error('❌ Fatal error in RSS generation:', error);
  process.exit(1);
});

export default { generateRSSFeeds, validateRSSFeed }; 