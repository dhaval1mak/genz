import { supabase } from './supabase';

interface TrendingTopic {
  term: string;
  count: number;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export class TrendingTopicsService {
  
  // Extract trending keywords from recent articles
  static async extractTrendingTopics(): Promise<string[]> {
    try {
      // Get articles from last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: articles, error } = await supabase
        .from('articles')
        .select('title, category, genz, alpha, normal')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .limit(100);

      if (error) {
        console.error('Error fetching articles:', error);
        return this.getFallbackTrends();
      }

      if (!articles || articles.length === 0) {
        return this.getFallbackTrends();
      }

      // Extract keywords from titles and content
      const allText = articles
        .map(article => `${article.title} ${article.genz} ${article.alpha}`)
        .join(' ');

      const trends = this.extractKeywordsFromText(allText);
      return trends.slice(0, 10);

    } catch (error) {
      console.error('Error extracting trending topics:', error);
      return this.getFallbackTrends();
    }
  }

  // Extract meaningful keywords from text
  private static extractKeywordsFromText(text: string): string[] {
    const genZTerms = [
      'periodt', 'slay', 'no cap', 'bet', 'bussin', 'mid', 'slaps', 'fire',
      'lowkey', 'highkey', 'fr', 'ngl', 'stan', 'simp', 'based', 'cringe',
      'rizz', 'sigma', 'alpha', 'W', 'L', 'ratio', 'sending me', 'periodt'
    ];

    const techTrends = [
      'AI', 'ChatGPT', 'blockchain', 'crypto', 'Bitcoin', 'NFT', 'metaverse',
      'web3', 'Tesla', 'Apple', 'Google', 'Meta', 'TikTok', 'Instagram',
      'iPhone', 'Android', 'gaming', 'esports', 'streaming'
    ];

    const cultureTrends = [
      'Taylor Swift', 'Billie Eilish', 'Marvel', 'Disney', 'Netflix',
      'Spotify', 'YouTube', 'Twitch', 'Discord', 'Reddit', 'Twitter',
      'meme', 'viral', 'trending', 'influencer', 'creator'
    ];

    const allTrends = [...genZTerms, ...techTrends, ...cultureTrends];
    
    // Count occurrences
    const trendCounts: Record<string, number> = {};
    
    allTrends.forEach(trend => {
      const regex = new RegExp(`\\b${trend}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        trendCounts[trend] = matches.length;
      }
    });

    // Sort by frequency and return top trends
    return Object.entries(trendCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([term]) => term);
  }

  // Fallback trends when data is unavailable
  private static getFallbackTrends(): string[] {
    return [
      'AI', 'ChatGPT', 'crypto', 'gaming', 'TikTok', 'iPhone', 'Tesla',
      'Netflix', 'streaming', 'viral', 'periodt', 'slay', 'no cap', 'bussin', 'fire'
    ];
  }

  // Get trending hashtags (simulated - would integrate with Twitter API)
  static async getTrendingHashtags(): Promise<string[]> {
    // In a real implementation, this would call Twitter/TikTok APIs
    const mockHashtags = [
      'GenZNews', 'TechUpdate', 'GamingNews', 'AlphaGeneration',
      'ViralNews', 'TechTok', 'GamersRise', 'NewsAlert', 'TrendingNow',
      'SlangPress', 'GenZStyle', 'AlphaCulture', 'TechReview', 'NewsExplained'
    ];

    return mockHashtags.slice(0, 8);
  }

  // Cache trending topics to avoid excessive API calls
  static async getCachedTrendingTopics(): Promise<string[]> {
    const cacheKey = 'trending_topics';
    const cacheExpiry = 'trending_topics_expiry';
    
    try {
      const cached = localStorage.getItem(cacheKey);
      const expiry = localStorage.getItem(cacheExpiry);
      
      if (cached && expiry && new Date() < new Date(expiry)) {
        return JSON.parse(cached);
      }

      // Fetch fresh data
      const trends = await this.extractTrendingTopics();
      
      // Cache for 30 minutes
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 30);
      
      localStorage.setItem(cacheKey, JSON.stringify(trends));
      localStorage.setItem(cacheExpiry, expiryTime.toISOString());
      
      return trends;
      
    } catch (error) {
      console.error('Error with trending topics cache:', error);
      return this.getFallbackTrends();
    }
  }
}

export default TrendingTopicsService;
