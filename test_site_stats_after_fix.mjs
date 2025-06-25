#!/usr/bin/env node
// test_site_stats_after_fix.mjs - Test if the site_stats table is working
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

async function testSiteStats() {
  console.log('🧪 Testing site_stats table...');
  
  try {
    // Test querying the site_stats table
    const { data, error } = await supabase
      .from('site_stats')
      .select('*')
      .eq('id', 'global_stats')
      .single();
      
    if (error) {
      console.error('❌ Error querying site_stats:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('\n🔧 The table still doesn\'t exist. Please run the SQL in your Supabase dashboard:');
        console.log('https://app.supabase.io');
      }
      return;
    }
    
    if (data) {
      console.log('✅ site_stats table exists and working!');
      console.log(`📊 Current stats:`, {
        id: data.id,
        total_articles: data.total_articles,
        last_updated: data.last_updated,
        last_fetch_count: data.last_fetch_count
      });
      
      // Test the Edge Function too
      console.log('\n🔄 Testing Edge Function...');
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/article-stats`);
        if (response.ok) {
          const edgeData = await response.json();
          console.log('✅ Edge Function working!', edgeData);
        } else {
          console.log('⚠️ Edge Function not deployed yet, but direct table access works');
        }
      } catch (edgeError) {
        console.log('⚠️ Edge Function not available, but direct table access works');
      }
      
    } else {
      console.log('❌ No data found in site_stats table');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSiteStats();
