#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createSiteStatsTable() {
  console.log('🔄 Creating site_stats table directly...');
  
  try {
    // Create site_stats table
    const { data: tableData, error: tableError } = await supabase
      .from('site_stats')
      .select('*')
      .limit(1);
      
    if (tableError && tableError.message.includes('does not exist')) {
      console.log('📝 Creating site_stats table...');
      
      // Execute SQL query to create table
      const { error } = await supabase
        .rpc('exec_sql', {
          query: `
            CREATE TABLE IF NOT EXISTS public.site_stats (
              id TEXT PRIMARY KEY,
              total_articles INTEGER NOT NULL DEFAULT 0,
              last_updated TIMESTAMPTZ DEFAULT NOW(),
              last_fetch_count INTEGER DEFAULT 0,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
        });
        
      if (error) {
        console.error('❌ Failed to create table:', error.message);
        
        // Try alternative method with direct SQL query (requires permissions)
        console.log('🔄 Trying alternative method...');
        
        const { error: sqlError } = await supabase
          .from('_sql')
          .rpc('run', { 
            sql: `
              CREATE TABLE IF NOT EXISTS public.site_stats (
                id TEXT PRIMARY KEY,
                total_articles INTEGER NOT NULL DEFAULT 0,
                last_updated TIMESTAMPTZ DEFAULT NOW(),
                last_fetch_count INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
              );
            `
          });
          
        if (sqlError) {
          console.error('❌ Could not create table:', sqlError.message);
          console.log('📝 Please log in to your Supabase dashboard and run this SQL in the SQL Editor:');
          console.log(`
CREATE TABLE IF NOT EXISTS public.site_stats (
  id TEXT PRIMARY KEY,
  total_articles INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  last_fetch_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.site_stats (id, total_articles)
SELECT 'global_stats', COUNT(*) FROM public.articles
ON CONFLICT (id) DO NOTHING;
          `);
          return;
        }
      }
      
      // Count articles
      const { count, error: countError } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error('❌ Error counting articles:', countError.message);
      } else {
        console.log(`📊 Found ${count || 0} articles. Initializing stats...`);
        
        // Insert initial stats
        const { error: insertError } = await supabase
          .from('site_stats')
          .insert([
            { 
              id: 'global_stats', 
              total_articles: count || 0,
              last_updated: new Date().toISOString(),
              last_fetch_count: 0
            }
          ]);
          
        if (insertError) {
          console.error('❌ Error initializing stats:', insertError.message);
        } else {
          console.log('✅ Site stats initialized successfully!');
        }
      }
    } else if (tableError) {
      console.error('❌ Error checking site_stats table:', tableError.message);
    } else {
      console.log('✅ site_stats table already exists');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the function
createSiteStatsTable();
