import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Base URL for the site
const BASE_URL = 'https://slangpress.netlify.app';

// Output file path
const SITEMAP_PATH = 'dist/sitemap.xml';

// Function to generate sitemap XML
const generateSitemapXml = (staticRoutes, articles) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Create entries for static routes
  const staticUrls = staticRoutes.map(route => `
    <url>
      <loc>${BASE_URL}${route}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
      <priority>${route === '/' ? '1.0' : '0.8'}</priority>
    </url>
  `).join('');
  
  // Create entries for article routes
  const articleUrls = articles.map(article => `
    <url>
      <loc>${BASE_URL}/article/${article.slug}</loc>
      <lastmod>${new Date(article.published_at || article.created_at).toISOString().split('T')[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `).join('');
  
  // Combine everything into a complete sitemap
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls}
  ${articleUrls}
</urlset>`;
};

async function updateSitemap() {
  try {
    console.log('Generating sitemap.xml...');
    
    // Define static routes
    const staticRoutes = [
      '/',
      '/profile',
      '/articles',
      '/signup',
      '/login'
    ];
    
    // Fetch all articles from Supabase
    const { data: articles, error } = await supabase
      .from('articles')
      .select('slug, published_at, created_at, title, category');
    
    if (error) {
      throw new Error(`Error fetching articles: ${error.message}`);
    }
    
    console.log(`Found ${articles.length} articles for sitemap`);
    
    // Generate the sitemap XML
    const sitemapXml = generateSitemapXml(staticRoutes, articles);
    
    // Ensure the dist directory exists
    const distDir = path.dirname(SITEMAP_PATH);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Write the sitemap to file
    fs.writeFileSync(SITEMAP_PATH, sitemapXml);
    
    console.log(`Sitemap generated successfully at ${SITEMAP_PATH}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the script
updateSitemap();
