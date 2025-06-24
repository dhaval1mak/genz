import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate sitemap XML
function generateSitemapXml(routes: string[]): string {
  const baseUrl = 'https://slangpress.netlify.app';
  const urls = routes.map(route => `<url><loc>${baseUrl}${route}</loc></url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;
}

serve(async (req) => {
  try {
    // Fetch all articles from the database
    const { data: articles, error } = await supabase
      .from('articles')
      .select('slug');

    if (error) {
      console.error('Error fetching articles:', error);
      return new Response('Failed to fetch articles', { status: 500 });
    }

    // Generate routes for the sitemap
    const routes = [
      '/',
      '/profile',
      '/articles',
      ...articles.map((article: { slug: string }) => `/article/${article.slug}`),
    ];

    // Generate sitemap XML
    const sitemapXml = generateSitemapXml(routes);

    return new Response(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (err) {
    console.error('Error generating sitemap:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});
