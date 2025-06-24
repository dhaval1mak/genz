# GenZ & Alpha AI News Aggregator

A modern, AI-powered news aggregator that transforms traditional news into Gen-Z and Alpha generation styles. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **AI-Powered Content**: Rewrites news articles in 3 distinct tones:
  - **Normal**: Professional summary (100 words max)
  - **Gen-Z**: TikTok-style with emojis and modern slang
  - **Alpha**: Discord/gaming style with memes and short format

- **Interactive Engagement**:
  - Like articles in any style
  - Comment system with name/email
  - Share functionality
  - Real-time reactions

- **SEO & Crawlability**:
  - Individual article pages with unique URLs (slugs)
  - Optimized meta tags and structured data
  - Dynamic sitemap generation for search engines
  
- **Automated Content Pipeline**:
  - Advanced RSS feed aggregation from 25+ trusted sources
  - Intelligent scheduling based on source update patterns
  - Gemini AI-powered content rewriting with robust fallback mechanisms
  - Category-specific default images for visual consistency
  - Static HTML generation for search engines
  - Dynamic sitemap generation
  - Proper canonical URLs

- **Modern UI/UX**:
  - Mobile-first responsive design
  - Smooth animations and micro-interactions
  - Glassmorphism effects
  - Dark theme optimized for younger audiences

- **Performance**:
  - Infinite scroll loading
  - Intersection Observer API
  - Optimized for mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase
- **AI**: Gemini API / OpenAI GPT-3.5
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Gemini API key or OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd genz-alpha-news-aggregator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase and AI API credentials in `.env`.

4. Set up Supabase database:

Create the following tables in your Supabase dashboard:

```sql
-- Articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  normal TEXT NOT NULL,
  genz TEXT NOT NULL,
  alpha TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  original_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  likes_normal INTEGER DEFAULT 0,
  likes_genz INTEGER DEFAULT 0,
  likes_alpha INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  text TEXT NOT NULL,
  style_version TEXT CHECK (style_version IN ('normal', 'genz', 'alpha')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  style_version TEXT CHECK (style_version IN ('normal', 'genz', 'alpha')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_ip, style_version)
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Articles are viewable by everyone" ON articles FOR SELECT USING (true);
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert likes" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
```

5. Start the development server:
```bash
npm run dev
```

## 📱 Usage

### For Users

1. **Browse Articles**: Scroll through the infinite feed of AI-rewritten news
2. **Switch Styles**: Use the toggle tabs to switch between Normal, Gen-Z, and Alpha versions
3. **Engage**: Like articles, leave comments, and share content
4. **Filter**: Use trending and latest filters to find relevant content

### For Admins

The system is designed to automatically:
1. Fetch RSS feeds daily
2. Process content through AI APIs
3. Store rewritten articles in the database
4. Present them in the user interface

## 🔧 Configuration

### AI Prompt Template

The system uses this prompt structure for content rewriting:

```javascript
const prompt = `You are an expert editor. Rewrite this article for 3 audiences:
1. Professional summary (100 words max)
2. Gen-Z version (TikTok tone, emojis, hashtags)
3. Alpha version (Discord slang, short, emojis)

Input: ${rssContent}

Output: JSON with 'normal', 'genz', 'alpha' keys`;
```

### RSS Feeds

Add your RSS feed URLs to the system. The application will:
- Fetch feeds daily
- Extract article content
- Process through AI APIs
- Store in database

## 🎨 Design System

### Colors
- **Primary**: Purple to Pink gradient
- **Secondary**: Teal, Orange accents
- **Neutral**: Gray scales optimized for dark theme

### Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Clear distinction between headings and body text
- **Line Height**: 150% for body, 120% for headings

### Components
- **NewsCard**: Main article display with style switching
- **ToggleTabs**: Style switcher with smooth animations
- **ReactionBar**: Like, comment, share interactions
- **CommentBox**: User comment input system

## 🚀 Deployment

### Frontend Deployment

The application is optimized for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### RSS System Deployment

For the RSS processing system and article counter:

#### On Linux/Mac:

```bash
npm run deploy-git
```

#### On Windows:

```powershell
npm run deploy-win
```

Both options will automatically:
- Pull the latest code from your repository
- Set up the RSS processor and scheduler
- Deploy the article stats feature
- Configure automatic updates

For more details, see [Git Deployment Guide](GIT_DEPLOYMENT_GUIDE.md)

### Pushing Code to Git

To push your code changes to the Git repository:

#### On Linux/Mac:

```bash
npm run git-push
```

#### On Windows:

```powershell
npm run git-push-win
```

You can also specify a custom commit message:

```bash
# Linux/Mac
./git_push.sh "Your custom commit message"

# Windows
.\Git-Push.ps1 "Your custom commit message"
```

## 📊 Performance

- **Lighthouse Score**: 90+ on all metrics
- **Core Web Vitals**: Optimized for mobile
- **Bundle Size**: Code-split and optimized
- **Loading**: Infinite scroll with intersection observer

## 🔍 SEO & Crawlability

The application is designed to be fully crawlable by search engines, ensuring that each article has its own unique URL and can be indexed individually.

### Individual Article Pages

- Each article has a unique URL based on its slug: `/article/:slug`
- The app renders proper SEO metadata through React Helmet
- JSON-LD structured data is included for rich search results

### Static HTML Generation

For better search engine crawling, the build process generates static HTML files for each article:

1. The `generateStaticArticles.mjs` script fetches all articles from Supabase
2. For each article, it creates a static HTML file with:
   - Complete article content
   - All necessary meta tags
   - JSON-LD structured data
   - Basic styling for readability

These static HTML files are available at `/article/:slug.html` and provide search engines with a crawlable version of each article.

### Dynamic Sitemap

A sitemap is automatically generated during the build process:

1. The `updateSitemap.mjs` script creates a complete sitemap with:
   - All static routes (homepage, profile, etc.)
   - All article pages with their unique slugs
   - Last modified dates
   - Change frequency and priority

The sitemap is available at `/sitemap.xml` and is referenced in `robots.txt`.

### Running the SEO Tools

To manually generate the static article files and sitemap:

```bash
# Generate static article HTML files
npm run generate-static

# Update the sitemap
npm run update-sitemap

# Or run both during build
npm run build
```

## 🔍 Enhanced SEO & Static Article Generation

The application includes an enhanced static article generation system that creates crawlable HTML pages for search engines:

### Static Article Generator Features

- **Command-line Interface**: Flexible options for generating static pages
- **Content Styles**: Generates static pages with all available content styles (Normal, GenZ, Alpha)
- **Proper HTML Sanitization**: Secures content while preserving formatting
- **Optimized SEO Metadata**: Comprehensive meta tags for better search ranking
- **Structured Data**: Rich JSON-LD markup for enhanced search results
- **Automatic Sitemaps**: Generates dedicated article sitemaps
- **Robots.txt Management**: Ensures proper search engine directives
- **Performance Optimizations**: Batch processing for large article sets
- **Smart Caching**: Skips existing files unless forced to regenerate

### Usage

```bash
# Basic usage (generates all articles)
node generateStaticArticles.mjs

# Generate only the 10 most recent articles
node generateStaticArticles.mjs --limit 10

# Generate only articles in a specific category
node generateStaticArticles.mjs --category Technology

# Force regeneration of all articles
node generateStaticArticles.mjs --force

# Show detailed output
node generateStaticArticles.mjs --verbose

# Show help information
node generateStaticArticles.mjs --help
```

### Integration with Build Process

The static article generation is automatically integrated into the build process:

```json
"scripts": {
  "build": "vite build && node generateStaticArticles.mjs",
  "postbuild": "node updateSitemap.mjs && node checkRobotsTxt.mjs",
  "fetch-rss": "node processRSSFeeds.mjs",
  "schedule-rss": "node rssScheduler.mjs",
  "analyze-rss": "node analyzeFeedPatterns.mjs"
}
```

This ensures that all article pages are generated and properly referenced in the sitemap and robots.txt files during each build. The additional scripts handle RSS feed processing and scheduling.

## 📰 RSS Feed System

The project includes a robust RSS feed processing system that automatically fetches and processes news articles from multiple sources. See the [RSS System Documentation](./RSS_SYSTEM_DOCS.md) for detailed information.

### Features

- **Multiple News Sources**: 25+ curated RSS feeds across various categories
- **AI-Powered Content Transformation**: Uses Gemini API to rewrite content in three styles
- **Intelligent Scheduling**: Analyzes feed update patterns to optimize fetching frequency
- **Fallback Mechanisms**: Robust error handling and content fallbacks
- **Category-Based Images**: Default images for each content category

### Usage

```bash
# Fetch articles from all RSS feeds (one-time)
npm run fetch-rss

# Start the scheduler for automatic updates
npm run schedule-rss

# Analyze RSS feed update patterns
npm run analyze-rss
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Supabase for the backend infrastructure
- Vercel for hosting and deployment
- OpenAI/Google for AI capabilities
- The React and TypeScript communities

---

Built with ❤️ for the next generation of news consumers.