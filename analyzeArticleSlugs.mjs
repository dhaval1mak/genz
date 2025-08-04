import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeArticleSlugs() {
  console.log('🔍 Analyzing article slugs for potential issues...\n');

  // Get ALL articles using pagination
  let allArticles = [];
  let from = 0;
  const batchSize = 1000;
  
  while (true) {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('slug, title, created_at')
      .range(from, from + batchSize - 1);

    if (error) {
      console.error('Error fetching articles:', error.message);
      return;
    }

    if (!articles || articles.length === 0) {
      break;
    }

    allArticles = allArticles.concat(articles);
    from += batchSize;
    
    if (articles.length < batchSize) {
      break;
    }
  }

  const articles = allArticles;

  console.log(`📊 Total articles: ${articles.length}\n`);

  // Check for problematic patterns
  const issues = {
    tooLong: [],
    invalidChars: [],
    duplicates: new Map(),
    missingData: []
  };

  articles.forEach(article => {
    // Check for overly long slugs
    if (article.slug.length > 100) {
      issues.tooLong.push({
        slug: article.slug,
        length: article.slug.length,
        title: article.title
      });
    }

    // Check for invalid characters (should only contain letters, numbers, hyphens)
    if (!/^[a-z0-9-]+$/.test(article.slug)) {
      issues.invalidChars.push({
        slug: article.slug,
        title: article.title
      });
    }

    // Check for duplicates
    if (issues.duplicates.has(article.slug)) {
      issues.duplicates.get(article.slug).push(article);
    } else {
      issues.duplicates.set(article.slug, [article]);
    }

    // Check for missing title or slug
    if (!article.slug || !article.title) {
      issues.missingData.push(article);
    }
  });

  // Report findings
  if (issues.tooLong.length > 0) {
    console.log(`⚠️  ${issues.tooLong.length} slugs are too long (>100 chars):`);
    issues.tooLong.slice(0, 5).forEach(item => {
      console.log(`  - ${item.slug.substring(0, 80)}... (${item.length} chars)`);
    });
    console.log('');
  }

  if (issues.invalidChars.length > 0) {
    console.log(`❌ ${issues.invalidChars.length} slugs contain invalid characters:`);
    issues.invalidChars.slice(0, 5).forEach(item => {
      console.log(`  - ${item.slug}`);
    });
    console.log('');
  }

  const duplicateCount = Array.from(issues.duplicates.values()).filter(arr => arr.length > 1).length;
  if (duplicateCount > 0) {
    console.log(`🔄 ${duplicateCount} duplicate slugs found:`);
    Array.from(issues.duplicates.entries())
      .filter(([_, articles]) => articles.length > 1)
      .slice(0, 5)
      .forEach(([slug, articles]) => {
        console.log(`  - "${slug}" appears ${articles.length} times`);
      });
    console.log('');
  }

  if (issues.missingData.length > 0) {
    console.log(`📝 ${issues.missingData.length} articles with missing data:`);
    issues.missingData.slice(0, 5).forEach(article => {
      console.log(`  - ID: ${article.id}, Slug: "${article.slug}", Title: "${article.title}"`);
    });
    console.log('');
  }

  if (issues.tooLong.length === 0 && issues.invalidChars.length === 0 && 
      duplicateCount === 0 && issues.missingData.length === 0) {
    console.log('✅ All article slugs look good!');
  }

  console.log('\n📋 Recommendations:');
  console.log('1. Submit removal requests in Google Search Console for dead URLs');
  console.log('2. Monitor error logs to identify specific problematic URLs');
  console.log('3. Consider adding redirects for frequently accessed dead URLs');
}

analyzeArticleSlugs().catch(console.error);
