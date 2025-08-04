// Advanced SEO content optimization for SlangPress articles
import { supabase } from '../lib/supabase';

interface SEOOptimizedArticle {
  title: string;
  content: string;
  category: string;
  targetKeywords: string[];
  readingTime: number;
  sentimentScore: number;
}

export class ContentSEOOptimizer {
  
  // Generate SEO-optimized titles for different generations
  static generateSEOTitles(originalTitle: string, category: string): {
    normal: string;
    genz: string;
    alpha: string;
  } {
    const currentYear = new Date().getFullYear();
    
    return {
      normal: `${originalTitle} - Latest ${category} News ${currentYear}`,
      genz: `${originalTitle} and I'm OBSESSED 😍 | ${category} Tea Spilled`,
      alpha: `${originalTitle} - ${category} Update That Hits Different 💯`
    };
  }

  // Extract and optimize keywords from content
  static extractKeywords(content: string, _category: string): string[] {
    const commonGenZTerms = [
      'slay', 'periodt', 'no cap', 'bet', 'bussin', 'mid', 'slaps', 'fire',
      'lowkey', 'highkey', 'fr', 'ngl', 'periodt', 'stan', 'simp'
    ];
    
    const commonAlphaTerms = [
      'sigma', 'alpha', 'beta', 'based', 'cringe', 'ratio', 'W', 'L',
      'mewing', 'rizz', 'gyatt', 'ohio', 'skibidi', 'fanum tax'
    ];

    const techTerms = [
      'AI', 'blockchain', 'crypto', 'NFT', 'metaverse', 'web3', 'API',
      'machine learning', 'neural network', 'algorithm'
    ];

    // Combine category-specific and generation-specific terms
    const allTerms = [...commonGenZTerms, ...commonAlphaTerms, ...techTerms];
    
    return allTerms.filter(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );
  }

  // Generate meta descriptions optimized for CTR
  static generateMetaDescription(content: string, style: 'normal' | 'genz' | 'alpha'): string {
    const excerpt = content.substring(0, 100).replace(/<[^>]*>/g, '');
    
    const templates = {
      normal: `${excerpt}... Get the latest updates and expert analysis. Read more on SlangPress.`,
      genz: `${excerpt}... and honestly? It's giving main character energy ✨ Spill the tea on SlangPress!`,
      alpha: `${excerpt}... This update is absolutely sending me 💪 Get the alpha perspective on SlangPress.`
    };

    return templates[style].substring(0, 160);
  }

  // Calculate reading time
  static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Generate internal linking suggestions
  static generateInternalLinks(category: string, _keywords: string[]): string[] {
    const linkSuggestions: Record<string, string[]> = {
      'Technology': ['/articles?category=tech', '/trending-tech', '/ai-news'],
      'Gaming': ['/articles?category=gaming', '/gaming-reviews', '/esports-news'],
      'Entertainment': ['/articles?category=entertainment', '/pop-culture', '/celebrity-news'],
      'Sports': ['/articles?category=sports', '/gaming-sports', '/athlete-news']
    };

    return linkSuggestions[category] || ['/articles', '/trending'];
  }

  // Optimize article for search engines
  static async optimizeArticleForSEO(articleId: string): Promise<SEOOptimizedArticle> {
    try {
      const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error || !article) {
        throw new Error('Article not found');
      }

      const keywords = this.extractKeywords(article.normal, article.category);
      const readingTime = this.calculateReadingTime(article.normal);
      
      // Update article with SEO optimizations
      const optimizedData = {
        seo_keywords: keywords.join(', '),
        reading_time: readingTime,
        meta_description_normal: this.generateMetaDescription(article.normal, 'normal'),
        meta_description_genz: this.generateMetaDescription(article.genz, 'genz'),
        meta_description_alpha: this.generateMetaDescription(article.alpha, 'alpha'),
        internal_links: this.generateInternalLinks(article.category, keywords).join(', ')
      };

      const { error: updateError } = await supabase
        .from('articles')
        .update(optimizedData)
        .eq('id', articleId);

      if (updateError) {
        throw updateError;
      }

      return {
        title: article.title,
        content: article.normal,
        category: article.category,
        targetKeywords: keywords,
        readingTime,
        sentimentScore: 0.7 // Default positive sentiment
      };

    } catch (error) {
      console.error('SEO optimization failed:', error);
      throw error;
    }
  }

  // Bulk optimize all articles
  static async bulkOptimizeArticles(batchSize: number = 50): Promise<void> {
    try {
      let from = 0;
      
      while (true) {
        const { data: articles, error } = await supabase
          .from('articles')
          .select('id')
          .range(from, from + batchSize - 1);

        if (error || !articles || articles.length === 0) {
          break;
        }

        // Process articles in parallel
        const optimizationPromises = articles.map(article => 
          this.optimizeArticleForSEO(article.id)
        );

        await Promise.allSettled(optimizationPromises);
        
        from += batchSize;
        
        if (articles.length < batchSize) {
          break;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('Bulk SEO optimization completed');
    } catch (error) {
      console.error('Bulk optimization failed:', error);
    }
  }
}

export default ContentSEOOptimizer;
