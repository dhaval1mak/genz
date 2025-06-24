import fs from 'fs';
import path from 'path';

// Check and update robots.txt to ensure article pages are crawlable
export function checkRobotsTxt(distDir = 'dist') {
  console.log('Checking robots.txt configuration...');
  const robotsPath = path.join(distDir, 'robots.txt');

  // Check if robots.txt exists in the dist directory
  if (!fs.existsSync(robotsPath)) {
    console.log('robots.txt not found in dist directory, creating it...');
    
    // Create a basic robots.txt file
    const robotsContent = `User-agent: *
Allow: /
Allow: /article/
Disallow: /api/

Sitemap: https://slangpress.netlify.app/sitemap.xml
Sitemap: https://slangpress.netlify.app/article-sitemap.xml
`;
    
    try {
      fs.writeFileSync(robotsPath, robotsContent);
      console.log('Created robots.txt file with appropriate configuration');
    } catch (error) {
      console.error('Error creating robots.txt:', error);
    }
    
    return;
  }
  
  // If robots.txt exists, check its content and update if needed
  try {
    const existingContent = fs.readFileSync(robotsPath, 'utf8');
    let updated = false;
    let newContent = existingContent;
    
    // Check if article sitemap is referenced
    if (!existingContent.includes('/article-sitemap.xml')) {
      console.log('Adding article sitemap reference to robots.txt');
      // Add the article sitemap reference after the main sitemap or at the end
      if (existingContent.includes('Sitemap:')) {
        newContent = existingContent.replace(
          /(Sitemap:.*)/,
          '$1\nSitemap: https://slangpress.netlify.app/article-sitemap.xml'
        );
      } else {
        newContent = existingContent.trim() + '\n\nSitemap: https://slangpress.netlify.app/article-sitemap.xml\n';
      }
      updated = true;
    }
    
    // Check if article directory is explicitly allowed
    if (!existingContent.includes('Allow: /article/')) {
      console.log('Adding explicit permission for /article/ directory to robots.txt');
      // Add the allow directive after User-agent line or before any Disallow directives
      if (existingContent.includes('User-agent:')) {
        newContent = newContent.replace(
          /(User-agent:.*\n)/,
          '$1Allow: /article/\n'
        );
      } else if (existingContent.includes('Disallow:')) {
        newContent = newContent.replace(
          /(Disallow:)/,
          'Allow: /article/\n$1'
        );
      } else {
        newContent = 'User-agent: *\nAllow: /article/\n\n' + newContent;
      }
      updated = true;
    }
    
    // Write the updated content if changes were made
    if (updated) {
      fs.writeFileSync(robotsPath, newContent);
      console.log('Updated robots.txt with article-related configurations');
    } else {
      console.log('robots.txt already contains necessary configurations');
    }
  } catch (error) {
    console.error('Error updating robots.txt:', error);
  }
}

// This module can be imported by generateStaticArticles.mjs or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const distDir = process.argv[2] || 'dist';
  checkRobotsTxt(distDir);
}
