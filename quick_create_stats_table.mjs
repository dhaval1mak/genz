#!/usr/bin/env node
// quick_create_stats_table.mjs - Simple script to create the site_stats table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function quickFixSiteStats() {
  console.log('🔧 Creating site_stats table...');
  
  try {
    // Using raw SQL query to create the table directly
    // Many Supabase instances allow this with the default anon key
    const { error: createError } = await supabase.rpc('pg_query', {
      query: `
      -- Create the site_stats table
      CREATE TABLE IF NOT EXISTS public.site_stats (
        id TEXT PRIMARY KEY,
        total_articles INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMPTZ DEFAULT NOW(),
        last_fetch_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Insert initial count
      INSERT INTO public.site_stats (id, total_articles, last_updated)
      VALUES ('global_stats', (SELECT COUNT(*) FROM public.articles), NOW())
      ON CONFLICT (id) DO UPDATE SET 
        total_articles = (SELECT COUNT(*) FROM public.articles),
        last_updated = NOW();
      `
    });

    if (createError) {
      console.error('❌ Could not create table via RPC:', createError.message);
      console.log('\n🔍 Please use the quick_fix_site_stats.sql script in the Supabase SQL Editor instead.');
      return;
    }

    console.log('✅ Table created successfully!');
    
    // Verify the table exists
    const { data, error } = await supabase
      .from('site_stats')
      .select('*')
      .eq('id', 'global_stats')
      .single();
      
    if (error) {
      console.error('❌ Error verifying table:', error.message);
      return;
    }
    
    console.log('📊 Current article count:', data.total_articles);
    console.log('✅ Setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔍 Please use the quick_fix_site_stats.sql script in the Supabase SQL Editor instead.');
  }
}

quickFixSiteStats();
