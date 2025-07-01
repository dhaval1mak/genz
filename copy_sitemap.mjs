import fs from 'fs';
import path from 'path';

console.log('📋 Copying sitemap from dist to root...');

const sourcePath = 'dist/sitemap.xml';
const targetPath = 'sitemap.xml';

try {
  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source file not found: ${sourcePath}`);
    console.log('💡 Run "node updateSitemap.mjs" first to generate the sitemap.');
    process.exit(1);
  }

  // Copy the file
  fs.copyFileSync(sourcePath, targetPath);
  
  // Get file stats for verification
  const stats = fs.statSync(targetPath);
  const fileSizeInKB = Math.round(stats.size / 1024);
  
  console.log(`✅ Sitemap copied successfully!`);
  console.log(`📁 Target: ${targetPath}`);
  console.log(`📏 Size: ${fileSizeInKB} KB`);
  
  // Count URLs in the sitemap
  const content = fs.readFileSync(targetPath, 'utf8');
  const urlCount = (content.match(/<url>/g) || []).length;
  console.log(`🔗 URLs: ${urlCount}`);
  
} catch (error) {
  console.error(`❌ Error copying sitemap: ${error.message}`);
  process.exit(1);
} 