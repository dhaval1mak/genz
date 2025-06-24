import Parser from 'rss-parser';
import { createArticle, getRSSFeeds, updateRSSFeedLastFetched } from './supabase';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure', 'description']
  }
});

export interface RSSItem {
  title: string;
  content: string;
  link: string;
  pubDate: string;
  category: string;
  imageUrl?: string;
  source: string;
}

export class RSSService {
  private static instance: RSSService;
  private geminiApiKey: string;
  private isProcessing: boolean = false;
  private processedArticles: Set<string> = new Set();
  
  constructor() {
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD-Zsfm8b7KE0GGFEA2hxQoswtHhCth1t8';
  }
  
  static getInstance(): RSSService {
    if (!RSSService.instance) {
      RSSService.instance = new RSSService();
    }
    return RSSService.instance;
  }

  async fetchAndProcessAllFeeds(): Promise<void> {
    if (this.isProcessing) {
      console.log('RSS processing already in progress, skipping...');
      return;
    }

    this.isProcessing = true;
    console.log(`🚀 Starting RSS processing at ${new Date().toISOString()}`);

    try {
      const { data: feeds, error } = await getRSSFeeds();
      if (error) throw error;

      const allArticles: any[] = [];

      // Process all feeds and collect articles
      for (const feed of feeds || []) {
        try {
          console.log(`📡 Processing feed: ${feed.name}`);
          const articles = await this.processFeed(feed);
          allArticles.push(...articles);
          await updateRSSFeedLastFetched(feed.id);
        } catch (error) {
          console.error(`❌ Error processing feed ${feed.name}:`, error);
        }
      }

      // Sort by publication date and take the 10 most recent
      const sortedArticles = allArticles
        .filter(article => !this.processedArticles.has(article.link))
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, 10);

      console.log(`📰 Publishing ${sortedArticles.length} new articles`);

      // Process and save articles
      for (const article of sortedArticles) {
        try {
          await this.processAndSaveArticle(article);
          this.processedArticles.add(article.link);
        } catch (error) {
          console.error(`❌ Error saving article: ${article.title}`, error);
        }
      }

      console.log(`✅ RSS processing completed. Published ${sortedArticles.length} articles.`);
    } catch (error) {
      console.error('❌ Error in RSS processing:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processFeed(feed: any): Promise<RSSItem[]> {
    try {
      // Use multiple CORS proxies for better reliability
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`,
        `https://corsproxy.io/?${encodeURIComponent(feed.url)}`,
        `https://cors-anywhere.herokuapp.com/${feed.url}`
      ];

      let parsedFeed;
      let lastError;

      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl, {
            headers: {
              'User-Agent': 'GenZ-News-Aggregator/1.0'
            }
          });
          
          if (!response.ok) continue;
          
          const data = await response.json();
          const content = data.contents || data;
          
          parsedFeed = await parser.parseString(typeof content === 'string' ? content : JSON.stringify(content));
          break;
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!parsedFeed) {
        throw lastError || new Error('All proxy attempts failed');
      }

      const articles: RSSItem[] = [];
      
      for (const item of parsedFeed.items.slice(0, 5)) {
        try {
          const rssItem: RSSItem = {
            title: this.cleanText(item.title || 'Untitled'),
            content: this.extractContent(item),
            link: item.link || '',
            pubDate: item.pubDate || new Date().toISOString(),
            category: feed.category,
            imageUrl: this.extractImageUrl(item),
            source: feed.name
          };

          // Only include articles with substantial content
          if (rssItem.content.length > 100 && rssItem.title.length > 10) {
            articles.push(rssItem);
          }
        } catch (error) {
          console.error(`Error processing item: ${item.title}`, error);
        }
      }

      return articles;
    } catch (error) {
      console.error(`Error processing feed ${feed.name}:`, error);
      return [];
    }
  }

  private async processAndSaveArticle(rssItem: RSSItem): Promise<void> {
    try {
      // Check if article already exists
      const slug = this.generateSlug(rssItem.title);
      
      // Rewrite content using Gemini AI
      const rewrittenContent = await this.rewriteContent(rssItem.content, rssItem.title);
      
      // Create article in database
      const articleData = {
        title: rssItem.title,
        normal: rewrittenContent.normal,
        genz: rewrittenContent.genz,
        alpha: rewrittenContent.alpha,
        image_url: rssItem.imageUrl || this.getDefaultImage(rssItem.category),
        category: rssItem.category,
        published_at: rssItem.pubDate,
        original_url: rssItem.link,
        slug: slug,
        likes_normal: Math.floor(Math.random() * 50) + 10,
        likes_genz: Math.floor(Math.random() * 150) + 50,
        likes_alpha: Math.floor(Math.random() * 100) + 25,
        rss_source: rssItem.source
      };

      const { error } = await createArticle(articleData);
      
      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }

      console.log(`✅ Created article: ${rssItem.title}`);
    } catch (error) {
      if (!error.message.includes('duplicate key')) {
        console.error(`Error saving article: ${rssItem.title}`, error);
      }
    }
  }

  private extractContent(item: any): string {
    // Try to get the best content available
    let content = '';
    
    if (item.content) {
      content = this.stripHtml(item.content);
    } else if (item.contentSnippet) {
      content = item.contentSnippet;
    } else if (item.summary) {
      content = this.stripHtml(item.summary);
    } else if (item.description) {
      content = this.stripHtml(item.description);
    }
    
    return this.cleanText(content);
  }

  private extractImageUrl(item: any): string | undefined {
    // Try various image sources
    if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
      return item['media:content'].$.url;
    }
    if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
      return item['media:thumbnail'].$.url;
    }
    if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
      return item.enclosure.url;
    }
    
    // Try to extract image from content
    const content = item.content || item.description || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) {
      return imgMatch[1];
    }
    
    return undefined;
  }

  private getDefaultImage(category: string): string {
    const defaultImages: Record<string, string> = {
      'Technology': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Gaming': 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Entertainment': 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Sports': 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Science': 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Business': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Lifestyle': 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Health': 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Politics': 'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800',
      'World': 'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=800'
    };
    
    return defaultImages[category] || defaultImages['Technology'];
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 60);
  }

  // Enhanced AI Integration for rewriting content using Gemini
  async rewriteContent(content: string, title: string): Promise<{
    normal: string;
    genz: string;
    alpha: string;
  }> {
    const prompt = `You are an expert news editor. Rewrite this breaking news article for 3 different audiences while keeping all facts accurate and current.

ARTICLE TITLE: ${title}
ARTICLE CONTENT: ${content}

Create exactly 3 versions:

1. NORMAL (Professional News): Write a clean, professional news summary. Use formal journalism language, focus on facts, include key details. Maximum 200 words. Start with the most important information.

2. GENZ (Social Media Style): Rewrite with TikTok/Instagram energy! Use emojis, modern slang like "bestie", "no cap", "fr fr", "periodt", "slay", "it's giving...", etc. Make it engaging and shareable. Include trending hashtags. Maximum 250 words.

3. ALPHA (Gaming/Discord Culture): Use gaming and internet culture language. Include terms like "based", "cringe", "W/L", "no cap", "fr", "poggers", "sus", "chad", "sigma", etc. Short, punchy sentences. Gaming/meme references welcome. Maximum 200 words.

IMPORTANT: Return ONLY a valid JSON object with exactly these keys: "normal", "genz", "alpha". No other text, explanations, or formatting.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No content generated from Gemini API');
      }
      
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedContent = JSON.parse(jsonMatch[0]);
        
        // Validate the response has all required fields
        if (parsedContent.normal && parsedContent.genz && parsedContent.alpha) {
          return {
            normal: parsedContent.normal.substring(0, 500),
            genz: parsedContent.genz.substring(0, 600),
            alpha: parsedContent.alpha.substring(0, 500)
          };
        }
      }
      
      throw new Error('Invalid JSON structure from Gemini API');
    } catch (error) {
      console.error('Error rewriting content with Gemini:', error);
      
      // Enhanced fallback with better formatting
      const shortContent = content.substring(0, 300);
      return {
        normal: `${title}\n\n${shortContent}... [Read more at source]`,
        genz: `OMG y'all! 😱 ${title} just dropped and I'm literally shook! ✨ ${shortContent.substring(0, 150)}... This is giving main character energy! 💅 #BreakingNews #Trending #NewsUpdate`,
        alpha: `BREAKING: ${title} 🔥 ${shortContent.substring(0, 120)}... This hits different ngl 💪 Major W for news today! #NewsW #Breaking`
      };
    }
  }

  // Method to start automated RSS processing every hour
  startAutomatedProcessing(): void {
    console.log('🚀 Starting automated RSS processing system...');
    
    // Process feeds immediately
    this.fetchAndProcessAllFeeds();
    
    // Set up interval to process feeds every hour (3600000 ms)
    setInterval(() => {
      console.log('⏰ Hourly RSS processing triggered');
      this.fetchAndProcessAllFeeds();
    }, 60 * 60 * 1000); // 1 hour
    
    // Also process every 30 minutes for more frequent updates
    setInterval(() => {
      console.log('⏰ 30-minute RSS check triggered');
      this.fetchAndProcessAllFeeds();
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Method to manually trigger processing
  async triggerManualProcessing(): Promise<void> {
    console.log('🔄 Manual RSS processing triggered');
    await this.fetchAndProcessAllFeeds();
  }
}

export const rssService = RSSService.getInstance();