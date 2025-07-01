# RSS Feed Processing & Sitemap Fixes

## Issues Resolved

### 1. **Sitemap showing only one URL instead of 900+ articles**

**Problem**: The `sitemap.xml` file was a static file with only 7 URLs, while the database contained 913 articles.

**Solution**: 
- ✅ Updated `updateSitemap.mjs` to properly fetch all articles from the database
- ✅ Generated a complete sitemap with 918 URLs (5 static + 913 articles)
- ✅ Created `copy_sitemap.mjs` to copy the generated sitemap from `dist/` to root
- ✅ Updated GitHub Actions workflow to include the copy step

**Result**: Sitemap now contains all 913+ articles with proper URLs, lastmod dates, and priorities.

### 2. **RSS Feed Processing Errors**

**Problem**: RSS processing was failing due to:
- Hardcoded API keys and URLs (security risk)
- Poor error handling
- Timeout issues
- Missing environment variable validation

**Solution**:
- ✅ Created `processRSSFeeds-optimized.mjs` with improved error handling
- ✅ Removed hardcoded credentials, now uses proper environment variables
- ✅ Added retry logic for failed feeds
- ✅ Improved timeout handling (10s instead of 5s)
- ✅ Better error messages and logging
- ✅ Fallback content generation when Gemini API fails
- ✅ Reduced feed list to most reliable sources

**Key Improvements**:
- **Environment Variables**: Proper validation and error messages
- **Error Handling**: Retry logic, better error messages, graceful fallbacks
- **Performance**: Increased timeouts, better concurrency management
- **Reliability**: Focused on most reliable RSS feeds

### 3. **GitHub Actions Workflow Issues**

**Problem**: 
- Wrong artifact name in download step
- Using old RSS processing script
- Missing sitemap copy step

**Solution**:
- ✅ Fixed artifact name from `workflow-state-v4-v4` to `workflow-state-v4`
- ✅ Updated to use `processRSSFeeds-optimized.mjs`
- ✅ Added sitemap copy step before commit

## Files Created/Modified

### New Files:
1. **`processRSSFeeds-optimized.mjs`** - Improved RSS processing with better error handling
2. **`test_rss_processing.mjs`** - Test script to verify setup
3. **`copy_sitemap.mjs`** - Script to copy sitemap from dist to root
4. **`RSS_SITEMAP_FIXES.md`** - This documentation

### Modified Files:
1. **`sitemap.xml`** - Now contains all 918 URLs (updated from 7)
2. **`.github/workflows/scheduled-rss.yml`** - Fixed workflow issues
3. **`updateSitemap.mjs`** - Already working correctly

## Environment Variables Required

Make sure these are set in your GitHub repository secrets:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

## Testing

### Test RSS Processing Setup:
```bash
node test_rss_processing.mjs
```

### Generate Sitemap:
```bash
node updateSitemap.mjs
node copy_sitemap.mjs
```

### Test RSS Processing:
```bash
node processRSSFeeds-optimized.mjs
```

## Current Status

✅ **Sitemap**: Fixed - now shows 918 URLs (913 articles + 5 static pages)
✅ **RSS Processing**: Improved - better error handling, retry logic, fallbacks
✅ **GitHub Actions**: Fixed - proper artifact handling, updated scripts
✅ **Environment Variables**: Proper validation and error messages

## RSS Feed Sources

The optimized script now uses these reliable feeds:

### Technology (8 feeds):
- TechCrunch, The Verge, Engadget, Ars Technica, The Next Web, Android Authority, 9to5Mac, Techmeme

### Business (3 feeds):
- CNBC, BBC Business, MarketWatch

### World News (5 feeds):
- AP News, NBC News, Reuters, NPR, The Guardian

### Sports (2 feeds):
- ESPN, BBC Sport

### Science (3 feeds):
- Science Daily, Scientific American, New Scientist

### Entertainment (2 feeds):
- Rolling Stone, Vulture

**Total**: 23 reliable feeds (reduced from 40+ to focus on most stable sources)

## Next Steps

1. **Deploy the changes** to GitHub
2. **Test the GitHub Actions workflow** manually
3. **Monitor the next scheduled run** (every 4 hours)
4. **Verify sitemap updates** are working correctly

## Troubleshooting

### If RSS processing fails:
1. Check environment variables are set correctly
2. Run `node test_rss_processing.mjs` to verify setup
3. Check GitHub Actions logs for specific error messages

### If sitemap is not updating:
1. Verify `updateSitemap.mjs` runs successfully
2. Check that `copy_sitemap.mjs` copies the file correctly
3. Ensure GitHub Actions has write permissions

### If you see "This XML file does not appear to have any style information associated with it":
This is normal! This message appears when viewing XML files in browsers without XSL stylesheets. Search engines will still properly parse the sitemap. The sitemap is working correctly if it contains all your URLs.

## References

- [XML Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Google Sitemap Guidelines](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap)
- [RSS Parser Documentation](https://github.com/rbren/rss-parser) 