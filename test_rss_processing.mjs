import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiApiKey2 = process.env.GEMINI_API_KEY_2;
const geminiApiKey3 = process.env.GEMINI_API_KEY_3;
const geminiApiKey4 = process.env.GEMINI_API_KEY_4;
const geminiApiKey5 = process.env.GEMINI_API_KEY_5;

console.log('🧪 Testing RSS Processing Setup...\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log(`  SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`  SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);
console.log(`  GEMINI_API_KEY: ${geminiApiKey ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  console.error('\n❌ Missing required environment variables!');
  console.error('Please set these in your GitHub repository secrets or .env file:');
  if (!supabaseUrl) console.error('  - SUPABASE_URL or VITE_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_KEY');
  if (!geminiApiKey) console.error('  - GEMINI_API_KEY');
  process.exit(1);
}

// Test environment variables
async function testEnvironmentVariables() {
  console.log('🔍 Testing environment variables...');
  
  const required = [
    { name: 'SUPABASE_URL', value: supabaseUrl },
    { name: 'SUPABASE_SERVICE_KEY', value: supabaseServiceKey },
    { name: 'GEMINI_API_KEY', value: geminiApiKey }
  ];
  
  const optional = [
    { name: 'GEMINI_API_KEY_2', value: geminiApiKey2 },
    { name: 'GEMINI_API_KEY_3', value: geminiApiKey3 },
    { name: 'GEMINI_API_KEY_4', value: geminiApiKey4 },
    { name: 'GEMINI_API_KEY_5', value: geminiApiKey5 }
  ];
  
  let allGood = true;
  
  // Check required variables
  for (const { name, value } of required) {
    if (value) {
      console.log(`✅ ${name}: SET`);
    } else {
      console.log(`❌ ${name}: NOT SET`);
      allGood = false;
    }
  }
  
  // Check optional backup API keys
  console.log('\n🔑 Backup API Keys:');
  const availableBackups = [];
  for (const { name, value } of optional) {
    if (value) {
      console.log(`✅ ${name}: SET`);
      availableBackups.push(name);
    } else {
      console.log(`❌ ${name}: NOT SET`);
    }
  }
  
  const totalApiKeys = [geminiApiKey, geminiApiKey2, geminiApiKey3, geminiApiKey4, geminiApiKey5].filter(Boolean).length;
  console.log(`💡 Total available API keys: ${totalApiKeys}/5`);
  
  if (totalApiKeys >= 2) {
    console.log('✅ Multiple API keys available for redundancy');
  } else if (totalApiKeys === 1) {
    console.log('⚠️ Only primary API key available (consider adding backups)');
  }
  
  return allGood;
}

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('\n🔗 Testing Supabase Connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('articles')
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      console.error(`❌ Supabase connection failed: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Supabase connection successful!`);
    console.log(`📊 Total articles in database: ${data.count || 0}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Supabase connection error: ${error.message}`);
    return false;
  }
}

// Test Gemini API with fallback system
async function testGeminiAPI() {
  console.log('\n🤖 Testing Gemini API with fallback system...');
  
  const apiKeys = [geminiApiKey, geminiApiKey2, geminiApiKey3, geminiApiKey4, geminiApiKey5].filter(Boolean);
  
  for (let i = 0; i < apiKeys.length; i++) {
    const currentApiKey = apiKeys[i];
    const keyLabel = i === 0 ? 'Primary' : `Backup ${i}`;
    
    try {
      console.log(`🔍 Testing ${keyLabel} Gemini API...`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${currentApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, this is a test message.' }] }],
          generationConfig: {
            maxOutputTokens: 100,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ${keyLabel} Gemini API test failed: ${response.status} - ${errorText}`);
        
        // Continue to test next API key
        continue;
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        console.log(`✅ ${keyLabel} Gemini API test successful!`);
        console.log(`📝 Sample response: ${generatedText.substring(0, 50)}...`);
        return true;
      } else {
        console.error(`❌ ${keyLabel} Gemini API returned no content`);
      }
      
    } catch (error) {
      console.error(`❌ ${keyLabel} Gemini API test error: ${error.message}`);
    }
  }
  
  console.error('❌ All Gemini API keys failed');
  return false;
}

// Test RSS parser
async function testRSSParser() {
  console.log('\n📡 Testing RSS Parser...');
  
  try {
    const Parser = (await import('rss-parser')).default;
    const parser = new Parser({
      timeout: 5000,
      maxRedirects: 3,
    });
    
    // Test with a reliable RSS feed
    const feedData = await parser.parseURL('https://feeds.feedburner.com/TechCrunch/');
    
    if (feedData.items && feedData.items.length > 0) {
      console.log(`✅ RSS Parser test successful!`);
      console.log(`📰 Found ${feedData.items.length} items in TechCrunch feed`);
      console.log(`📝 Sample title: ${feedData.items[0].title?.substring(0, 50)}...`);
      return true;
    } else {
      console.error(`❌ RSS Parser returned no items`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ RSS Parser test error: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting comprehensive RSS processing tests...\n');
  
  const tests = [
    { name: 'Environment Variables', fn: testEnvironmentVariables },
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'Gemini API', fn: testGeminiAPI },
    { name: 'RSS Parser', fn: testRSSParser }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} test failed with error: ${error.message}`);
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! RSS processing should work correctly.');
    console.log('💡 You can now run the full RSS processing with: node processRSSFeeds-optimized.mjs');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the configuration and try again.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
}); 