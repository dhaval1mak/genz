# RSS Feed Processing System Documentation

This document explains how to use and configure the RSS feed processing system for the GenZ/Alpha AI News Aggregator.

## Overview

The RSS feed system automatically fetches news articles from various sources, processes them with Gemini AI for GenZ and Alpha content versions, and stores them in the Supabase database. It includes:

1. **One-time processing**: Fetch articles on demand
2. **Scheduled processing**: Automatically fetch articles at set intervals
3. **Feed analysis**: Analyze update patterns for optimal scheduling
4. **Default fallback images**: For each content category

## Available Scripts

- `npm run fetch-rss`: Run a one-time fetch of all RSS feeds
- `npm run schedule-rss`: Start the scheduler to automatically fetch feeds
- `npm run analyze-rss`: Analyze RSS feed update patterns

## Configuring RSS Feeds

Edit the `rssFeeds` array in `processRSSFeeds.mjs` to add or modify feeds. Each feed object has:

```javascript
{
  name: 'Feed Name',
  url: 'https://example.com/rss',
  category: 'Category'
}
```

Available categories:
- Technology
- Gaming
- Entertainment
- Sports
- Science
- Business
- World
- Health
- Finance
- Politics
- Education
- Environment
- AI
- CryptoWeb3
- Food
- Travel
- Fashion

## Scheduling Options

In `rssScheduler.mjs`, you can set the update frequency:

```javascript
// Available schedules
const scheduleOptions = {
  everyHour: '0 * * * *',            // At the start of every hour
  everyFourHours: '0 */4 * * *',     // Every 4 hours
  twiceDaily: '0 */12 * * *',        // Every 12 hours
  daily: '0 0 * * *',                // Once a day at midnight
  custom: '0 */6 * * *'              // Every 6 hours (default)
};

// Set your preferred schedule here
const selectedSchedule = scheduleOptions.everyFourHours;
```

## Feed Analysis

The `analyzeFeedPatterns.mjs` script examines how frequently each RSS feed gets updated and provides recommendations for optimal update scheduling. Run it with:

```
npm run analyze-rss
```

Results are saved to `rss-analysis-results.json` and include:
- Average hours between posts
- Hours since last update
- Total posts available
- Recommended update frequency

## Customizing Default Images

Each category has a default fallback image if an article doesn't provide one. To modify or add new category images, edit the `getDefaultImage` function in `processRSSFeeds.mjs`.

## Troubleshooting

**Issue**: Gemini API returns invalid JSON
**Solution**: The script has multiple fallback methods to parse JSON responses. If all parsing methods fail, it will use generic content based on the article title.

**Issue**: Feed cannot be parsed
**Solution**: The script implements retry logic and will attempt to fetch a feed multiple times before giving up.

**Issue**: Duplicate articles
**Solution**: The script checks for existing articles by title and URL to prevent duplicates.

## Running on a Server

For production environments, consider using a process manager like PM2:

```
npm install -g pm2
pm2 start rssScheduler.mjs --name "rss-scheduler"
pm2 save
pm2 startup
```

This ensures the RSS scheduler runs continuously and restarts if the server reboots.
