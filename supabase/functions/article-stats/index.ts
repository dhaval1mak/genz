import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Handle CORS preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get article statistics
    const stats = await getArticleStats(supabase);
    
    // Return the response
    return new Response(
      JSON.stringify(stats),
      { 
        headers: { ...corsHeaders },
        status: 200 
      },
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders },
        status: 500 
      },
    );
  }
});

async function getArticleStats(supabase) {
  // Get stats from site_stats table
  const { data: statsData, error: statsError } = await supabase
    .from('site_stats')
    .select('*')
    .eq('id', 'global_stats')
    .single();
  
  // If we have stats, return them
  if (statsData) {
    return {
      total_articles: statsData.total_articles,
      last_updated: statsData.last_updated,
      last_fetch_count: statsData.last_fetch_count
    };
  }
  
  // If no stats record exists yet, count the articles directly
  const { count, error: countError } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    throw new Error(`Error counting articles: ${countError.message}`);
  }
  
  return {
    total_articles: count || 0,
    last_updated: new Date().toISOString(),
    last_fetch_count: 0
  };
}
