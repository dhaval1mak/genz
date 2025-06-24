#!/bin/node

// Test script for article counter feature
// This script doesn't make any permanent changes - it just simulates the API response

import http from 'http';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = 'https://fdnvfdkhhwdpkyomsvoq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbnZmZGtoaHdkcGt5b21zdm9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5NzM1MywiZXhwIjoyMDYzNzczMzUzfQ.dvbEOUkfEG-hucg4N-pBvCVO7DgGvpa6Hg3OE7YUajc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create a simple HTTP server that simulates the article-stats endpoint
const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Only respond to GET requests
  if (req.method !== 'GET') {
    res.writeHead(405);
    res.end('Method Not Allowed');
    return;
  }
  
  // Simulate the article-stats endpoint
  if (req.url === '/article-stats') {
    try {
      // Get the actual article count from Supabase
      const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }
      
      // Return the stats
      const stats = {
        total_articles: count || 0,
        last_updated: new Date().toISOString(),
        last_fetch_count: Math.floor(Math.random() * 5) // Simulate 0-4 new articles
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(stats));
    } catch (error) {
      console.error('Error fetching article count:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  } else {
    // Not found
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 3456;
server.listen(PORT, () => {
  console.log(`
🚀 Article counter test server running at http://localhost:${PORT}

This server simulates the article-stats Edge Function.
To test the article counter:

1. Start your development server with 'npm run dev'
2. Add this line to your .env file (or .env.local):
   VITE_SUPABASE_FUNCTION_URL=http://localhost:${PORT}

3. Update the ArticleCounter component to use:
   const response = await fetch(\`\${import.meta.env.VITE_SUPABASE_FUNCTION_URL}/article-stats\`);

4. The article counter should now display the actual number of articles in your database
   with a simulated "new articles" indicator.

Press Ctrl+C to stop the server
`);
});
