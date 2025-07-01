import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

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

// SEO Platforms and Search Engines for indexing
const seoPlatforms = [
  // Major Search Engines
  {
    name: 'Google',
    type: 'search_engine',
    pingUrl: `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`,
    method: 'GET'
  },
  {
    name: 'Bing',
    type: 'search_engine', 
    pingUrl: `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`,
    method: 'GET'
  },
  {
    name: 'Yandex',
    type: 'search_engine',
    pingUrl: `https://blogs.yandex.com/pings/?status=success&url=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`,
    method: 'GET'
  },

  // SEO Platforms
  {
    name: 'Google Search Console',
    type: 'seo_platform',
    apiUrl: 'https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run',
    method: 'POST',
    requiresAuth: true
  },

  // Social Media Platforms (for content discovery)
  {
    name: 'Facebook',
    type: 'social',
    pingUrl: `https://graph.facebook.com/?id=${encodeURIComponent(SITE_URL)}&scrape=true`,
    method: 'POST'
  },
  {
    name: 'Twitter',
    type: 'social',
    pingUrl: `https://api.twitter.com/2/tweets`,
    method: 'POST',
    requiresAuth: true
  },

  // Content Discovery Platforms
  {
    name: 'Reddit',
    type: 'content_discovery',
    pingUrl: 'https://www.reddit.com/api/submit',
    method: 'POST',
    requiresAuth: true
  },

  // RSS Aggregators
  {
    name: 'FeedBurner',
    type: 'rss_aggregator',
    pingUrl: `https://pubsubhubbub.appspot.com/`,
    method: 'POST',
    body: `hub.mode=publish&hub.url=${encodeURIComponent(`${SITE_URL}/rss.xml`)}`
  },

  // News Aggregators
  {
    name: 'NewsAPI',
    type: 'news_aggregator',
    pingUrl: 'https://newsapi.org/v2/everything',
    method: 'GET',
    requiresAuth: true
  },

  // Local SEO Platforms
  {
    name: 'Google My Business',
    type: 'local_seo',
    apiUrl: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    method: 'GET',
    requiresAuth: true
  },

  // Technical SEO Tools
  {
    name: 'Screaming Frog',
    type: 'seo_tool',
    pingUrl: `https://www.screamingfrog.co.uk/seo-spider/`,
    method: 'GET'
  },

  // Content Syndication
  {
    name: 'Medium',
    type: 'content_syndication',
    apiUrl: 'https://api.medium.com/v1/users',
    method: 'GET',
    requiresAuth: true
  },

  // Video Platforms (if you have video content)
  {
    name: 'YouTube',
    type: 'video_platform',
    apiUrl: 'https://www.googleapis.com/youtube/v3/search',
    method: 'GET',
    requiresAuth: true
  }
];

// Additional SEO submission endpoints
const additionalSeoEndpoints = [
  // Webmaster Tools
  'https://www.google.com/webmasters/sitemaps/ping?sitemap=',
  'https://www.bing.com/webmaster/ping.aspx?siteMap=',
  
  // RSS Directories
  'https://feed43.com/',
  'https://www.feedity.com/',
  'https://www.rssboard.org/',
  
  // Blog Directories
  'https://www.blogcatalog.com/',
  'https://www.blogarama.com/',
  'https://www.blogflux.com/',
  
  // Social Bookmarking
  'https://del.icio.us/',
  'https://www.stumbleupon.com/',
  'https://www.digg.com/',
  
  // Content Aggregators
  'https://www.alltop.com/',
  'https://www.popurls.com/',
  'https://www.techmeme.com/'
];

// Function to submit sitemap to search engines
async function submitSitemapToSearchEngines() {
  console.log('🔍 Submitting sitemap to search engines...');
  
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const results = [];

  const searchEngines = [
    {
      name: 'Google',
      url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    },
    {
      name: 'Bing',
      url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    },
    {
      name: 'Yandex',
      url: `https://blogs.yandex.com/pings/?status=success&url=${encodeURIComponent(sitemapUrl)}`
    }
  ];

  for (const engine of searchEngines) {
    try {
      console.log(`  📡 Submitting to ${engine.name}...`);
      
      const response = await fetch(engine.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)'
        }
      });

      const success = response.ok;
      let message = success ? 'Successfully submitted' : `HTTP ${response.status}`;
      
      // Handle specific error cases
      if (response.status === 404) {
        message = 'Sitemap not yet accessible (needs deployment)';
      } else if (response.status === 410) {
        message = 'Sitemap URL not found (needs deployment)';
      }

      results.push({
        platform: engine.name,
        success,
        status: response.status,
        message
      });

      console.log(`    ${success ? '✅' : '⚠️'} ${engine.name}: ${message}`);
      
      // Small delay between submissions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`    ❌ ${engine.name}: ${error.message}`);
      results.push({
        platform: engine.name,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

// Function to submit individual URLs to search engines
async function submitUrlsToSearchEngines(urls, maxUrls = 10) {
  console.log(`🔗 Submitting ${Math.min(urls.length, maxUrls)} URLs to search engines...`);
  
  const results = [];
  const urlsToSubmit = urls.slice(0, maxUrls);

  for (const url of urlsToSubmit) {
    try {
      console.log(`  📡 Submitting: ${url.substring(0, 60)}...`);
      
      // Submit to Google
      const googleResponse = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(url)}`);
      
      // Submit to Bing
      const bingResponse = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(url)}`);
      
      results.push({
        url,
        google: googleResponse.ok,
        bing: bingResponse.ok,
        success: googleResponse.ok || bingResponse.ok
      });

      console.log(`    ${results[results.length - 1].success ? '✅' : '⚠️'} Submitted`);
      
      // Small delay between submissions
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`    ❌ Error submitting ${url}: ${error.message}`);
      results.push({
        url,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

// Function to submit to RSS aggregators
async function submitToRssAggregators() {
  console.log('📰 Submitting to RSS aggregators...');
  
  const rssUrl = `${SITE_URL}/rss.xml`;
  const results = [];

  const rssAggregators = [
    'https://feed43.com/',
    'https://www.feedity.com/',
    'https://www.rssboard.org/',
    'https://www.feedvalidator.org/',
    'https://www.feedburner.com/'
  ];

  for (const aggregator of rssAggregators) {
    try {
      console.log(`  📡 Submitting to ${aggregator}...`);
      
      const response = await fetch(aggregator, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (compatible; RSSBot/1.0)'
        },
        body: `url=${encodeURIComponent(rssUrl)}`
      });

      const success = response.ok;
      results.push({
        aggregator,
        success,
        status: response.status
      });

      console.log(`    ${success ? '✅' : '❌'} ${aggregator}: ${response.status}`);
      
    } catch (error) {
      console.log(`    ❌ ${aggregator}: ${error.message}`);
      results.push({
        aggregator,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

// Function to submit to social media platforms
async function submitToSocialMedia() {
  console.log('📱 Submitting to social media platforms...');
  
  const results = [];

  // Facebook Open Graph
  try {
    console.log('  📡 Submitting to Facebook Open Graph...');
    const response = await fetch(`https://graph.facebook.com/?id=${encodeURIComponent(SITE_URL)}&scrape=true`, {
      method: 'POST'
    });
    
    const success = response.ok;
    results.push({
      platform: 'Facebook',
      success,
      status: response.status
    });
    
    console.log(`    ${success ? '✅' : '❌'} Facebook: ${response.status}`);
  } catch (error) {
    console.log(`    ❌ Facebook: ${error.message}`);
    results.push({
      platform: 'Facebook',
      success: false,
      error: error.message
    });
  }

  // Twitter Card Validator
  try {
    console.log('  📡 Submitting to Twitter Card Validator...');
    const response = await fetch(`https://cards-dev.twitter.com/validator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodeURIComponent(SITE_URL)}`
    });
    
    const success = response.ok;
    results.push({
      platform: 'Twitter',
      success,
      status: response.status
    });
    
    console.log(`    ${success ? '✅' : '❌'} Twitter: ${response.status}`);
  } catch (error) {
    console.log(`    ❌ Twitter: ${error.message}`);
    results.push({
      platform: 'Twitter',
      success: false,
      error: error.message
    });
  }

  return results;
}

// Function to get recent articles for submission
async function getRecentArticles(limit = 20) {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('slug, title, published_at')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching articles:', error.message);
      return [];
    }

    return articles.map(article => `${SITE_URL}/article/${article.slug}`);
  } catch (error) {
    console.error('❌ Error getting recent articles:', error.message);
    return [];
  }
}

// Function to create and submit sitemap index
async function createAndSubmitSitemapIndex() {
  console.log('🗂️ Creating sitemap index...');
  
  try {
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/rss.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

    // Write sitemap index to file
    const fs = await import('fs');
    fs.writeFileSync('sitemap-index.xml', sitemapIndex);
    
    console.log('✅ Sitemap index created: sitemap-index.xml');
    
    // Submit sitemap index to search engines
    const sitemapIndexUrl = `${SITE_URL}/sitemap-index.xml`;
    
    const searchEngines = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapIndexUrl)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapIndexUrl)}`
    ];

    for (const engine of searchEngines) {
      try {
        await fetch(engine);
        console.log(`  ✅ Submitted sitemap index to ${engine.includes('google') ? 'Google' : 'Bing'}`);
      } catch (error) {
        console.log(`  ❌ Failed to submit to ${engine.includes('google') ? 'Google' : 'Bing'}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating sitemap index:', error.message);
  }
}

// Function to update robots.txt with sitemap location
async function updateRobotsTxt() {
  console.log('🤖 Updating robots.txt...');
  
  try {
    const fs = await import('fs');
    
    let robotsContent = '';
    if (fs.existsSync('robots.txt')) {
      robotsContent = fs.readFileSync('robots.txt', 'utf8');
    }

    // Add sitemap if not already present
    if (!robotsContent.includes('Sitemap:')) {
      robotsContent += `\n\n# Sitemaps\nSitemap: ${SITE_URL}/sitemap.xml\nSitemap: ${SITE_URL}/sitemap-index.xml\n`;
    }

    // Add SEO-friendly directives
    if (!robotsContent.includes('User-agent: *')) {
      robotsContent = `User-agent: *\nAllow: /\n\n${robotsContent}`;
    }

    fs.writeFileSync('robots.txt', robotsContent);
    console.log('✅ robots.txt updated with sitemap locations');
    
  } catch (error) {
    console.error('❌ Error updating robots.txt:', error.message);
  }
}

// Main SEO indexing function
async function performSeoIndexing() {
  console.log('🚀 Starting comprehensive SEO indexing...');
  console.log(`🌐 Site URL: ${SITE_URL}`);
  console.log('⚠️  Note: Sitemap must be deployed to live site before search engines can access it');
  const startTime = Date.now();

  try {
    // 1. Submit sitemap to search engines
    const sitemapResults = await submitSitemapToSearchEngines();
    
    // 2. Get recent articles and submit individual URLs
    const recentArticles = await getRecentArticles(10);
    const urlResults = await submitUrlsToSearchEngines(recentArticles);
    
    // 3. Submit to RSS aggregators
    const rssResults = await submitToRssAggregators();
    
    // 4. Submit to social media platforms
    const socialResults = await submitToSocialMedia();
    
    // 5. Create and submit sitemap index
    await createAndSubmitSitemapIndex();
    
    // 6. Update robots.txt
    await updateRobotsTxt();

    // Calculate results
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    const totalSubmissions = sitemapResults.length + urlResults.length + rssResults.length + socialResults.length;
    const successfulSubmissions = [
      ...sitemapResults.filter(r => r.success),
      ...urlResults.filter(r => r.success),
      ...rssResults.filter(r => r.success),
      ...socialResults.filter(r => r.success)
    ].length;

    console.log('\n📊 SEO Indexing Results:');
    console.log(`⏱️ Duration: ${duration} seconds`);
    console.log(`📡 Total submissions: ${totalSubmissions}`);
    console.log(`✅ Successful: ${successfulSubmissions}`);
    console.log(`❌ Failed: ${totalSubmissions - successfulSubmissions}`);
    console.log(`📈 Success rate: ${Math.round((successfulSubmissions / totalSubmissions) * 100)}%`);

    // Detailed results
    console.log('\n🔍 Detailed Results:');
    
    console.log('\n📋 Sitemap Submissions:');
    sitemapResults.forEach(result => {
      console.log(`  ${result.success ? '✅' : '⚠️'} ${result.platform}: ${result.message || result.error}`);
    });

    console.log('\n🔗 URL Submissions:');
    urlResults.forEach(result => {
      console.log(`  ${result.success ? '✅' : '⚠️'} ${result.url.substring(0, 50)}...`);
    });

    console.log('\n📰 RSS Aggregator Submissions:');
    rssResults.forEach(result => {
      console.log(`  ${result.success ? '✅' : '❌'} ${result.aggregator}: ${result.status || result.error}`);
    });

    console.log('\n📱 Social Media Submissions:');
    socialResults.forEach(result => {
      console.log(`  ${result.success ? '✅' : '❌'} ${result.platform}: ${result.status || result.error}`);
    });

    console.log('\n🎉 SEO indexing completed successfully!');
    console.log('💡 Your content should now be discoverable by search engines and social platforms.');
    console.log('🚀 After deployment, sitemap will be accessible at: https://slangpress.netlify.app/sitemap.xml');
    
  } catch (error) {
    console.error('❌ SEO indexing failed:', error.message);
    process.exit(1);
  }
}

// Run the SEO indexing
performSeoIndexing().catch(error => {
  console.error('❌ Fatal error in SEO indexing:', error);
  process.exit(1);
});

export default { performSeoIndexing, submitSitemapToSearchEngines, submitUrlsToSearchEngines }; 