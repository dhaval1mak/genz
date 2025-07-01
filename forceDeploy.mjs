import { execSync } from 'child_process';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Forcing deployment with updated sitemap...');

async function main() {
  try {
  // 1. Update sitemap with latest data
  console.log('📋 Updating sitemap...');
  execSync('node updateSitemap.mjs', { stdio: 'inherit' });
  
  // 2. Copy sitemap to root
  console.log('📁 Copying sitemap to root...');
  execSync('node copy_sitemap.mjs', { stdio: 'inherit' });
  
  // 3. Generate RSS feed
  console.log('📰 Generating RSS feed...');
  execSync('node generateRSSFeed.mjs', { stdio: 'inherit' });
  
  // 4. Run full build
  console.log('🔨 Running full build...');
  execSync('npm run build:full', { stdio: 'inherit' });
  
  // 5. Verify critical files
  console.log('🔍 Verifying critical files...');
  const criticalFiles = ['sitemap.xml', 'rss.xml', 'robots.txt', '_headers'];
  
  criticalFiles.forEach(file => {
    const filePath = join('dist', file);
    if (existsSync(filePath)) {
      console.log(`✅ ${file} is present in dist/`);
    } else {
      console.log(`❌ ${file} is missing from dist/`);
    }
  });
  
  // 6. Check sitemap content
  console.log('📊 Checking sitemap content...');
  const sitemapPath = join('dist', 'sitemap.xml');
  if (existsSync(sitemapPath)) {
    const fs = await import('fs');
    const content = fs.readFileSync(sitemapPath, 'utf8');
    const urlCount = (content.match(/<url>/g) || []).length;
    console.log(`✅ Sitemap contains ${urlCount} URLs`);
    
    if (urlCount < 900) {
      console.log('⚠️  Warning: Sitemap has fewer URLs than expected');
    } else {
      console.log('✅ Sitemap has expected number of URLs');
    }
  }
  
  console.log('\n🎉 Force deployment completed!');
  console.log('📁 All files are ready in dist/ directory');
  console.log('🚀 Push to GitHub to trigger Netlify deployment');
  console.log('🌐 After deployment, check: https://slangpress.netlify.app/sitemap.xml');
  
  } catch (error) {
    console.error('❌ Force deployment failed:', error.message);
    process.exit(1);
  }
}

main(); 