// analyzeBundles.mjs - A simple bundle analyzer that reports on chunk sizes after build
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist', 'assets');

// Format file size into human-readable format
function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Analyze and report on bundle sizes
async function analyzeBundles() {
  console.log('\n🔍 Analyzing bundle sizes...\n');
  
  try {
    const files = fs.readdirSync(distDir);
    
    // Get JS files only
    const jsFiles = files.filter(file => file.endsWith('.js'));
    
    // Get file sizes and sort by size (largest first)
    const fileSizes = jsFiles.map(file => {
      const filePath = path.join(distDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        sizeFormatted: formatSize(stats.size)
      };
    }).sort((a, b) => b.size - a.size);
    
    // Calculate total size
    const totalSize = fileSizes.reduce((sum, file) => sum + file.size, 0);
    
    // Group by chunk type
    const chunkGroups = {
      vendor: fileSizes.filter(file => file.name.includes('vendor-')),
      components: fileSizes.filter(file => !file.name.includes('vendor-') && file.name.match(/^\w+-\w+/)),
      other: fileSizes.filter(file => !file.name.includes('vendor-') && !file.name.match(/^\w+-\w+/))
    };
    
    // Print report
    console.log('📊 Bundle Size Report:');
    console.log('---------------------');
    
    // Print vendor chunks
    console.log('\n📦 Vendor Chunks:');
    chunkGroups.vendor.forEach(file => {
      console.log(`  ${file.name}: ${file.sizeFormatted} (${(file.size / totalSize * 100).toFixed(1)}%)`);
    });
    
    // Print component chunks
    console.log('\n🧩 Component Chunks:');
    chunkGroups.components.forEach(file => {
      console.log(`  ${file.name}: ${file.sizeFormatted} (${(file.size / totalSize * 100).toFixed(1)}%)`);
    });
    
    // Print other chunks
    console.log('\n🔄 Other Chunks:');
    chunkGroups.other.forEach(file => {
      console.log(`  ${file.name}: ${file.sizeFormatted} (${(file.size / totalSize * 100).toFixed(1)}%)`);
    });
    
    // Print total
    console.log('\n📈 Total JS Bundle Size:', formatSize(totalSize));
    
    // Warning for large bundles
    const largeFiles = fileSizes.filter(file => file.size > 250 * 1024); // > 250KB
    if (largeFiles.length > 0) {
      console.log('\n⚠️ Large chunks that might need optimization:');
      largeFiles.forEach(file => {
        console.log(`  ${file.name}: ${file.sizeFormatted}`);
      });
    }
    
    console.log('\n✅ Bundle analysis complete!');
    
  } catch (error) {
    console.error('Error analyzing bundles:', error);
  }
}

analyzeBundles();
