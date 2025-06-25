#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyTable() {
  console.log('📊 Checking site_stats table...');
  
  try {
    // Try to query the site_stats table
    const { data, error } = await supabase
      .from('site_stats')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.error('❌ Table site_stats does not exist. Applying migration...');
        await applyMigration();
      } else {
        console.error('❌ Error querying site_stats table:', error.message);
      }
    } else {
      console.log('✅ site_stats table exists!');
      return true;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function applyMigration() {
  try {
    console.log('📝 Cannot apply migration directly through the client API');
    console.log('⚠️ The site_stats table needs to be created manually using Supabase CLI');
    
    console.log('\n===== INSTRUCTIONS =====');
    console.log('1. Make sure Supabase CLI is installed:');
    console.log('   npm install -g supabase');
    console.log('\n2. Set up your environment variables:');
    console.log('   $env:SUPABASE_DB_URL = "your-db-url" (PowerShell)');
    console.log('   export SUPABASE_DB_URL="your-db-url" (Bash/Linux)');
    console.log('\n3. Run the migration:');
    console.log('   supabase db push');
    console.log('\n4. Or use the deploy script:');
    console.log('   npm run deploy-stats-win (Windows)');
    console.log('   npm run deploy-stats (Linux/Mac)');
    
    // Add alternative: Create table manually
    console.log('\nAlternatively, you can run this SQL directly in the Supabase SQL Editor:');
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250625082217_article_stats.sql');
    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log('\n' + migrationSQL);
    }
    
    console.log('\n======================\n');
    
    // Try to create the table directly with a basic CREATE TABLE statement
    console.log('🔄 Attempting to create a minimal site_stats table directly...');
    
    const { error: createError } = await supabase.rpc('execute_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS site_stats (
          id TEXT PRIMARY KEY,
          total_articles INTEGER NOT NULL DEFAULT 0,
          last_updated TIMESTAMPTZ DEFAULT NOW(),
          last_fetch_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.error('❌ Cannot create table directly:', createError.message);
    } else {
      console.log('✅ Created basic site_stats table!');
      
      // Update article counts
      const { count, error: countError } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });
        
      if (!countError) {
        console.log(`📊 Found ${count} articles. Initializing stats...`);
        
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
    }
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
  }
}

// Main execution
(async () => {
  console.log('🔍 Verifying site_stats table and article statistics...');
  await verifyTable();
})();
