import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate sitemap XML with more SEO details
function generateSitemapXml(staticRoutes: string[], articles: any[]): string {
  const baseUrl = 'https://slangpress.netlify.app';
  const today = new Date().toISOString().split('T')[0];
  
  // Static routes with basic data
  const staticUrls = staticRoutes.map(route => `
    <url>
      <loc>${baseUrl}${route}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
      <priority>${route === '/' ? '1.0' : '0.8'}</priority>
    </url>
  `).join('');
  
  // Article routes with detailed data
  const articleUrls = articles.map(article => `
    <url>
      <loc>${baseUrl}/article/${article.slug}</loc>
      <lastmod>${new Date(article.published_at || article.created_at).toISOString().split('T')[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticUrls}
    ${articleUrls}
  </urlset>`;
}

serve(async (req) => {
  try {
    // Fetch all articles from the database with published date
    const { data: articles, error } = await supabase
      .from('articles')
      .select('slug, published_at, created_at, title, category');

    if (error) {
      console.error('Error fetching articles:', error);
      return new Response('Failed to fetch articles', { status: 500 });
    }

    // Static routes for the sitemap
    const staticRoutes = [
      '/',
      '/profile',
      '/articles',
      '/signup',
      '/login'
    ];

    // Generate sitemap XML with more detailed info
    const sitemapXml = generateSitemapXml(staticRoutes, articles);

    // Set cache control headers to ensure fresh content
    return new Response(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',  // 1 hour cache
      },
    });
  } catch (err) {
    console.error('Error generating sitemap:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});
