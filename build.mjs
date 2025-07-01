import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting build process...');

try {
  // 1. Run the Vite build
  console.log('📦 Running Vite build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }
  
  // 3. Copy essential files to dist
  console.log('📋 Copying essential files to dist...');
  
  const filesToCopy = [
    '_headers',
    '_redirects',
    'robots.txt',
    'sitemap.xml',
    'sitemap-index.xml',
    'rss.xml',
    'favicon.ico',
    'favicon.png'
  ];
  
  filesToCopy.forEach(file => {
    if (existsSync(file)) {
      copyFileSync(file, join('dist', file));
      console.log(`✅ Copied ${file} to dist/`);
    } else {
      console.log(`⚠️  File ${file} not found, skipping...`);
    }
  });
  
  // 4. Copy public directory contents
  if (existsSync('public')) {
    console.log('📁 Copying public directory contents...');
    const publicFiles = ['rss.xml', 'favicon.ico', 'browserconfig.xml', 'site.webmanifest'];
    
    publicFiles.forEach(file => {
      const sourcePath = join('public', file);
      const destPath = join('dist', file);
      
      if (existsSync(sourcePath)) {
        copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied public/${file} to dist/`);
      }
    });
  }
  
  // 5. Verify critical files
  console.log('🔍 Verifying critical files...');
  const criticalFiles = ['_headers', '_redirects', 'sitemap.xml', 'rss.xml'];
  
  criticalFiles.forEach(file => {
    const filePath = join('dist', file);
    if (existsSync(filePath)) {
      console.log(`✅ ${file} is present in dist/`);
    } else {
      console.log(`❌ ${file} is missing from dist/`);
    }
  });
  
  console.log('\n🎉 Build completed successfully!');
  console.log('📁 All files are ready in the dist/ directory');
  console.log('🚀 Ready for deployment to Netlify');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 