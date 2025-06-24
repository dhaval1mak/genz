import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import fs from 'fs/promises';

// Environment variables
const supabaseUrl = 'https://fdnvfdkhhwdpkyomsvoq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbnZmZGtoaHdkcGt5b21zdm9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5NzM1MywiZXhwIjoyMDYzNzczMzUzfQ.dvbEOUkfEG-hucg4N-pBvCVO7DgGvpa6Hg3OE7YUajc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const parser = new Parser({
  timeout: 10000,
  maxRedirects: 10,
});

// Import the RSS feeds from the main processing file
import { default as processRSSFeedsMjs } from './processRSSFeeds.mjs';
const rssFeeds = processRSSFeedsMjs.rssFeeds || [];

/**
 * Analyzes RSS feeds to determine their update frequency
 */
async function analyzeFeedUpdatePatterns() {
  console.log('🔍 Analyzing RSS feed update patterns...');
  
  const results = [];
  
  for (const feed of rssFeeds) {
    try {
      console.log(`\n📊 Analyzing feed: ${feed.name} (${feed.category})`);
      
      // Parse RSS feed
      const feedData = await parser.parseURL(feed.url);
      
      if (!feedData.items || feedData.items.length === 0) {
        console.log(`  ⚠️ No items found in feed`);
        continue;
      }
      
      // Get publish dates of the most recent items
      const pubDates = feedData.items
        .slice(0, 20)
        .map(item => item.pubDate ? new Date(item.pubDate) : null)
        .filter(date => date !== null)
        .sort((a, b) => b - a); // Sort by date, newest first
      
      if (pubDates.length < 2) {
        console.log(`  ⚠️ Not enough items with dates to analyze`);
        continue;
      }
      
      // Calculate time differences between consecutive posts in hours
      const timeDiffs = [];
      for (let i = 1; i < pubDates.length; i++) {
        const diffHours = (pubDates[i-1] - pubDates[i]) / (1000 * 60 * 60);
        timeDiffs.push(diffHours);
      }
      
      // Calculate average time between posts
      const avgHours = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
      
      // Determine recommended update frequency
      let recommendedFrequency;
      if (avgHours < 1) {
        recommendedFrequency = 'hourly';
      } else if (avgHours < 4) {
        recommendedFrequency = 'every 4 hours';
      } else if (avgHours < 12) {
        recommendedFrequency = 'twice daily';
      } else {
        recommendedFrequency = 'daily';
      }
      
      // Get most recent publish date
      const mostRecent = pubDates[0];
      const hoursSinceLastUpdate = (new Date() - mostRecent) / (1000 * 60 * 60);
      
      console.log(`  📈 Average hours between posts: ${avgHours.toFixed(2)}`);
      console.log(`  🕒 Hours since last update: ${hoursSinceLastUpdate.toFixed(2)}`);
      console.log(`  🔄 Recommended update frequency: ${recommendedFrequency}`);
      
      results.push({
        name: feed.name,
        category: feed.category,
        avgHoursBetweenPosts: parseFloat(avgHours.toFixed(2)),
        hoursSinceLastUpdate: parseFloat(hoursSinceLastUpdate.toFixed(2)),
        totalPosts: feedData.items.length,
        recommendedFrequency,
        mostRecentPostDate: mostRecent.toISOString()
      });
      
    } catch (error) {
      console.error(`❌ Error analyzing feed ${feed.name}: ${error.message}`);
    }
  }
  
  // Save results to file
  await fs.writeFile('./rss-analysis-results.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Analysis complete! Results saved to rss-analysis-results.json');
  
  // Calculate overall recommendation
  const avgUpdateTime = results.reduce((sum, feed) => sum + feed.avgHoursBetweenPosts, 0) / results.length;
  
  console.log(`\n📊 Overall Results:`);
  console.log(`  Average update frequency across all feeds: ${avgUpdateTime.toFixed(2)} hours`);
  
  let overallRecommendation;
  if (avgUpdateTime < 2) {
    overallRecommendation = 'hourly';
  } else if (avgUpdateTime < 6) {
    overallRecommendation = 'every 4 hours';
  } else if (avgUpdateTime < 16) {
    overallRecommendation = 'twice daily';
  } else {
    overallRecommendation = 'daily';
  }
  
  console.log(`  🔄 Recommended overall update schedule: ${overallRecommendation}`);
  
  return {
    feeds: results,
    overallRecommendation
  };
}

// Run the analysis
analyzeFeedUpdatePatterns().catch(console.error);
