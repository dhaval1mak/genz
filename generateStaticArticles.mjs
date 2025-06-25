import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import sanitizeHtml from 'sanitize-html';
import { fileURLToPath } from 'url';
import { checkRobotsTxt } from './checkRobotsTxt.mjs';

// Get the directory name correctly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = process.env.SITE_URL || 'https://slangpress.netlify.app';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Output directory for static HTML files
const OUTPUT_DIR = path.join(process.cwd(), 'dist/article');

// Configure sanitize-html options
const sanitizeOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 
    'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'span', 'blockquote'
  ],
  allowedAttributes: {
    'a': ['href', 'name', 'target', 'rel'],
    'img': ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
    '*': ['class', 'id', 'style']
  },
  selfClosing: ['img', 'br', 'hr'],
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  allowProtocolRelative: true
};

// Function to generate static HTML for an article
const generateArticleHtml = (article) => {
  const publishDate = new Date(article.published_at).toISOString();
  const modifiedDate = new Date(article.created_at).toISOString();
  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Sanitize all content versions
  const normalContent = sanitizeHtml(article.normal || '', sanitizeOptions);
  const genzContent = article.genz ? sanitizeHtml(article.genz, sanitizeOptions) : '';
  const alphaContent = article.alpha ? sanitizeHtml(article.alpha, sanitizeOptions) : '';
  
  // Extract a clean description (no HTML, limited length)
  const description = normalContent.replace(/<[^>]*>/g, '').substring(0, 160);
  const truncatedDescription = description.length >= 160 ? description + '...' : description;
  
  // Generate a list of related tags based on the category
  const relatedTags = getRelatedTags(article.category);
  const keywords = [article.category, ...relatedTags, 'news'].join(', ');
  
  // Escape quotes in various fields to prevent HTML issues
  const escapedTitle = article.title.replace(/"/g, '&quot;');
  const escapedDescription = truncatedDescription.replace(/"/g, '&quot;');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle} - GenZ News</title>
  
  <!-- SEO Meta Tags -->
  <meta name="description" content="${escapedDescription}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="GenZ News">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE_URL}/article/${article.slug}">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDescription}">
  <meta property="og:image" content="${getArticleImage(article) || `${SITE_URL}/default-og-image.jpg`}">
  <meta property="article:published_time" content="${publishDate}">
  <meta property="article:modified_time" content="${modifiedDate}">
  <meta property="article:section" content="${article.category}">
  <meta property="article:tag" content="${article.category}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${SITE_URL}/article/${article.slug}">
  <meta property="twitter:title" content="${escapedTitle}">
  <meta property="twitter:description" content="${escapedDescription}">
  <meta property="twitter:image" content="${getArticleImage(article) || `${SITE_URL}/default-og-image.jpg`}">
  
  <!-- Canonical Link -->
  <link rel="canonical" href="${SITE_URL}/article/${article.slug}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="${SITE_URL}/favicon.png">
  <link rel="apple-touch-icon" href="${SITE_URL}/favicon_io/apple-touch-icon.png">
  
  <!-- Schema.org markup for Google -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${escapedTitle}",
      "image": ["${getArticleImage(article) || `${SITE_URL}/default-og-image.jpg`}"],
      "datePublished": "${publishDate}",
      "dateModified": "${modifiedDate}",
      "author": {
        "@type": "Organization",
        "name": "GenZ News"
      },
      "publisher": {
        "@type": "Organization",
        "name": "GenZ News",
        "logo": {
          "@type": "ImageObject",
          "url": "${SITE_URL}/favicon_io/android-chrome-512x512.png"
        }
      },
      "description": "${escapedDescription}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${SITE_URL}/article/${article.slug}"
      },
      "keywords": "${keywords}"
    }
  </script>
  
  <!-- Redirect to the React app after a short delay (allowing time for search engines) -->
  <meta http-equiv="refresh" content="1;url=/article/${article.slug}">
  
  <!-- Basic Styling -->
  <style>
    :root {
      --primary-color: #6366f1;
      --secondary-color: #8b5cf6;
      --text-color: #333;
      --light-bg: #f9fafb;
      --border-color: #e5e7eb;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: var(--light-bg);
    }
    
    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }
    
    h2 {
      font-size: 1.5rem;
      margin: 1.5rem 0 0.5rem;
    }
    
    p {
      margin-bottom: 1rem;
    }
    
    .article-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      padding: 30px;
      margin-bottom: 30px;
    }
    
    .meta {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    
    img {
      max-width: 100%;
      height: auto;
      margin: 1rem 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .category {
      display: inline-block;
      background: var(--secondary-color);
      color: white;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .date {
      display: inline-flex;
      align-items: center;
    }
    
    .date::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 4px;
      background-color: #999;
      border-radius: 50%;
      margin: 0 6px;
    }
    
    .content {
      margin-top: 2rem;
    }
    
    .navigation {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      text-align: center;
    }
    
    a {
      color: var(--primary-color);
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .style-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-color);
      margin: 2rem 0;
    }
      .style-tab {
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .style-tab.active {
      border-bottom: 2px solid var(--primary-color);
      font-weight: 500;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
    
    .source {
      font-style: italic;
    }
    
    .source a {
      color: inherit;
    }
    
    @media (max-width: 600px) {
      body {
        padding: 15px;
      }
      
      .article-container {
        padding: 20px;
      }
      
      h1 {
        font-size: 1.8rem;
      }
    }
  </style>
</head>
<body>
  <article class="article-container">
    <h1>${article.title}</h1>
    <div class="meta">
      <span class="category">${article.category}</span>
      <span class="date">Published: ${formattedDate}</span>
      ${article.rss_source ? `<span class="source">Source: <a href="${article.original_url || '#'}" target="_blank" rel="noopener noreferrer">${article.rss_source}</a></span>` : ''}
    </div>
    
    ${getArticleImage(article) ? `<img src="${getArticleImage(article)}" alt="${escapedTitle}" loading="lazy">` : ''}
      <div class="style-tabs">
      <div class="style-tab active" data-tab="normal">📰 Normal</div>
      ${genzContent ? `<div class="style-tab" data-tab="genz">✨ GenZ</div>` : ''}
      ${alphaContent ? `<div class="style-tab" data-tab="alpha">🔥 Alpha</div>` : ''}
    </div>
    
    <div class="content">
      <div id="normal-content" class="tab-content active">
        ${normalContent}
      </div>
      ${genzContent ? `<div id="genz-content" class="tab-content">${genzContent}</div>` : ''}
      ${alphaContent ? `<div id="alpha-content" class="tab-content">${alphaContent}</div>` : ''}
    </div>
    
    <div class="navigation">
      <p>If you are not redirected automatically, <a href="/article/${article.slug}">click here</a> to view the interactive version of this article.</p>
    </div>
  </article>
  
  <!-- Simple tab functionality for static HTML -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const tabs = document.querySelectorAll('.style-tab');
      
      tabs.forEach(tab => {
        tab.addEventListener('click', function() {
          // Remove active class from all tabs
          tabs.forEach(t => t.classList.remove('active'));
          
          // Add active class to clicked tab
          this.classList.add('active');
          
          // Hide all content
          document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
          });
          
          // Show selected content
          const tabName = this.getAttribute('data-tab');
          document.getElementById(tabName + '-content').classList.add('active');
        });
      });
    });
    
    // Delay redirect for better SEO crawling
    setTimeout(function() {
      window.location.href = "/article/${article.slug}";
    }, 5000);  // 5 second delay
  </script>
</body>
</html>`;
};

// Helper function to generate related tags based on category
function getRelatedTags(category) {
  const categoryMap = {
    'Technology': ['tech', 'innovation', 'digital', 'software', 'hardware', 'AI'],
    'Science': ['research', 'discovery', 'innovation', 'space', 'biology', 'chemistry', 'physics'],
    'Business': ['finance', 'economy', 'startups', 'entrepreneurship', 'market'],
    'Health': ['wellness', 'medicine', 'fitness', 'healthcare', 'medical'],
    'Gaming': ['games', 'esports', 'videogames', 'entertainment', 'gaming industry'],
    'Entertainment': ['media', 'movies', 'tv', 'celebrities', 'streaming'],
    'Sports': ['athletics', 'competition', 'players', 'teams', 'league'],
    'World': ['global', 'international', 'politics', 'events'],
    'Politics': ['government', 'policy', 'election', 'political'],
    'Lifestyle': ['culture', 'trends', 'fashion', 'food', 'travel']
  };
    return categoryMap[category] || [category.toLowerCase(), 'trending'];
}

// Create slugs for articles that might not have them
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();                  // Trim leading/trailing spaces
}

// Function to ensure output directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      throw error;
    }
  }
}

// Generate a sitemap for all articles
function generateArticleSitemap(articles, outputPath) {
  const today = new Date().toISOString().split('T')[0];
  let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add each article to the sitemap
  articles.forEach(article => {
    const publishDate = new Date(article.published_at || article.created_at).toISOString().split('T')[0];
    sitemapXml += `  <url>\n`;
    sitemapXml += `    <loc>${SITE_URL}/article/${article.slug}</loc>\n`;
    sitemapXml += `    <lastmod>${publishDate}</lastmod>\n`;
    sitemapXml += `    <changefreq>monthly</changefreq>\n`;
    sitemapXml += `    <priority>0.7</priority>\n`;
    sitemapXml += `  </url>\n`;
  });
  
  sitemapXml += '</urlset>';
  
  // Write the sitemap to file
  try {
    fs.writeFileSync(outputPath, sitemapXml);
    console.log(`Generated article sitemap at ${outputPath}`);
  } catch (error) {
    console.error('Error writing article sitemap:', error);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    force: false,
    limit: 0,
    category: null,
    verbose: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--force' || arg === '-f') {
      options.force = true;
    } else if (arg === '--limit' || arg === '-l') {
      options.limit = parseInt(args[++i], 10) || 0;
    } else if (arg === '--category' || arg === '-c') {
      options.category = args[++i];
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  
  return options;
}

// Print help information
function printHelp() {
  console.log(`
Static Article Generator - Help
===============================

This script generates static HTML pages for all articles in the Supabase database.

Usage:
  node generateStaticArticles.mjs [options]

Options:
  --force, -f         Force regeneration of all articles
  --limit, -l <num>   Limit to <num> most recent articles
  --category, -c <c>  Only generate pages for a specific category
  --verbose, -v       Show detailed output
  --help, -h          Show this help message

Examples:
  node generateStaticArticles.mjs --limit 10        # Generate for 10 most recent articles
  node generateStaticArticles.mjs --category Tech   # Generate only Technology articles
  node generateStaticArticles.mjs --force           # Force regenerate all articles
  `);
}

// Main function with options support
async function generateStaticArticlePages(options = {}) {
  const startTime = Date.now();
  console.log('Starting static article pages generation...');
  
  if (options.verbose) {
    console.log('Options:', options);
  }
  
  try {
    console.log('Fetching articles from Supabase...');
    
    // Build the query based on options
    let query = supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });
    
    // Filter by category if specified
    if (options.category) {
      query = query.eq('category', options.category);
    }
    
    // Limit results if specified
    if (options.limit > 0) {
      query = query.limit(options.limit);
    }
    
    // Execute the query
    const { data: articles, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching articles: ${error.message}`);
    }
    
    if (!articles || articles.length === 0) {
      console.log('No articles found matching the criteria.');
      return;
    }
    
    console.log(`Found ${articles.length} articles.`);
    
    // Create output directory if it doesn't exist
    ensureDirectoryExists(OUTPUT_DIR);
    
    // Generate HTML file for each article (with progress tracking)
    console.log(`Generating static HTML pages for ${articles.length} articles...`);
    
    // Process articles in batches to avoid memory issues with large datasets
    const BATCH_SIZE = 10;
    const batches = Math.ceil(articles.length / BATCH_SIZE);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < batches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, articles.length);
      const batch = articles.slice(start, end);
      
      console.log(`Processing batch ${i+1}/${batches} (articles ${start+1}-${end})...`);
      
      // Process each article in the current batch
      for (const article of batch) {
        // Ensure article has a slug
        if (!article.slug) {
          article.slug = generateSlug(article.title);
          console.log(`Generated missing slug for article "${article.title}": ${article.slug}`);
        }
        
        const filePath = path.join(OUTPUT_DIR, `${article.slug}.html`);
        
        // Skip if file exists and not forcing regeneration
        if (!options.force && fs.existsSync(filePath)) {
          if (options.verbose) {
            console.log(`Skipping existing file for article: ${article.slug}`);
          }
          successCount++;
          continue;
        }
        
        try {
          const html = generateArticleHtml(article);
          fs.writeFileSync(filePath, html);
          
          if (options.verbose) {
            console.log(`Generated static HTML for article: ${article.slug}`);
          } else if (i % 10 === 0) {
            process.stdout.write('.');  // Simple progress indicator
          }
          
          successCount++;
        } catch (error) {
          console.error(`Error generating HTML for article "${article.title}" (${article.slug}):`, error);
          errorCount++;
        }
      }
    }
    
    // Generate a separate article sitemap
    const articleSitemapPath = path.join(process.cwd(), 'dist/article-sitemap.xml');
    generateArticleSitemap(articles, articleSitemapPath);
      const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\nStatic article pages generation completed in ${duration} seconds`);
    console.log(`Success: ${successCount} articles, Errors: ${errorCount}`);
    console.log(`Output directory: ${OUTPUT_DIR}`);
    console.log(`Article sitemap: ${articleSitemapPath}`);
    
    // Ensure robots.txt is properly configured
    checkRobotsTxt(path.join(process.cwd(), 'dist'));
  } catch (error) {
    console.error('Error generating static article pages:', error);
    process.exit(1);
  }
}

// Function to get a default image based on category
function getDefaultImage(category) {
  const defaultImages = {
    'Technology': [
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Gaming': [
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Entertainment': [
      'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3709369/pexels-photo-3709369.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Sports': [
      'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Science': [
      'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Business': [
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Lifestyle': [
      'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Health': [
      'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Politics': [
      'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1550340/pexels-photo-1550340.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'World': [
      'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  };
  
  const images = defaultImages[category] || defaultImages['Technology'];
  return images[Math.floor(Math.random() * images.length)];
}

// Function to get the best image for an article
function getArticleImage(article) {
  if (article.image_url) {
    return article.image_url;
  }
  return getDefaultImage(article.category);
}
