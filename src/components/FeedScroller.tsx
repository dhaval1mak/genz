import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import NewsCard from './NewsCard';
import { Comment } from '../lib/supabase';
import { useNewsData } from '../hooks/useNewsData';
import { useTheme } from '../contexts/ThemeContext';
import { Loader2, Zap, TrendingUp, LogOut, User, Sun, Moon, Filter, RefreshCw, Clock } from 'lucide-react';

type StyleType = 'normal' | 'genz' | 'alpha';

interface FeedScrollerProps {
  userPreferences: {
    preferred_style: StyleType;
    interests: string[];
  };
  onSignOut: () => void;
  user: any;
}

export default function FeedScroller({ userPreferences, onSignOut, user }: FeedScrollerProps) {
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [filter, setFilter] = useState<'all' | 'trending' | 'latest'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { theme, toggleTheme } = useTheme();

  const { articles, loading, hasMore, loadMore, refreshArticles } = useNewsData(
    userPreferences.interests,
    userPreferences.preferred_style
  );

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, []);

  const handleLike = async (articleId: string, style: StyleType) => {
    console.log(`Liked article ${articleId} in ${style} style`);
  };

  const handleComment = async (articleId: string, comment: { name: string; email: string; text: string; style: StyleType }) => {
    try {
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        article_id: articleId,
        user_id: user?.id || 'anonymous',
        name: user?.email?.split('@')[0] || comment.name,
        text: comment.text,
        style_version: comment.style,
        timestamp: new Date().toISOString()
      };
      
      setComments(prev => ({
        ...prev,
        [articleId]: [...(prev[articleId] || []), newComment]
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleRefresh = async () => {
    await refreshArticles();
    setLastUpdated(new Date());
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'trending') {
      const totalLikes = article.likes_normal + article.likes_genz + article.likes_alpha;
      return totalLikes > 150;
    }
    if (filter === 'latest') {
      const articleDate = new Date(article.published_at);
      const hoursSincePublished = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60);
      return hoursSincePublished < 12;
    }
    return true;
  });

  const getStyleColors = (style: StyleType) => {
    switch (style) {
      case 'genz':
        return 'from-pink-500 to-purple-500';
      case 'alpha':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getStyleEmoji = (style: StyleType) => {
    switch (style) {
      case 'genz': return '✨';
      case 'alpha': return '🔥';
      default: return '📰';
    }
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return lastUpdated.toLocaleDateString();
  };

  return (
    <>
      <Helmet>
        <title>GenZ News - AI-Powered News Aggregator</title>
        <meta name="description" content="Stay updated with AI-powered news in your preferred style - Professional, Gen-Z, or Alpha. Real-time news aggregation with personalized content." />
        <meta property="og:title" content="GenZ News - AI-Powered News Aggregator" />
        <meta property="og:description" content="Experience news like never before with AI-powered content in three unique styles." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://alpha-z.netlify.app" />
        <link rel="canonical" href="https://alpha-z.netlify.app" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "GenZ News",
            "description": "AI-powered news aggregator with personalized content styles",
            "url": "https://alpha-z.netlify.app",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://alpha-z.netlify.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 transition-colors duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">GenZ News</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Personalized for {userPreferences.preferred_style === 'genz' ? 'Gen-Z' : userPreferences.preferred_style === 'alpha' ? 'Alpha' : 'Professional'} style
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Zap className="text-green-600 dark:text-green-400" size={16} />
                  <span className="text-green-700 dark:text-green-400 font-medium text-sm">Live</span>
                </div>
                
                <button
                  onClick={handleRefresh}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-full transition-colors duration-300"
                  title="Refresh news"
                >
                  <RefreshCw className="text-gray-600 dark:text-gray-400" size={20} />
                </button>
                
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-full transition-colors duration-300"
                >
                  {theme === 'dark' ? (
                    <Sun className="text-yellow-500" size={20} />
                  ) : (
                    <Moon className="text-gray-600" size={20} />
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-full transition-colors duration-300"
                  >
                    <User className="text-gray-600 dark:text-gray-400" size={20} />
                  </button>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-12 bg-white dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200 dark:border-gray-800/50 rounded-xl p-2 min-w-48 shadow-xl"
                    >
                      <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800/50">
                        {user?.email}
                      </div>
                      <Link
                        to="/profile"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <button
                        onClick={onSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            
            {/* User Preferences Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStyleColors(userPreferences.preferred_style)} text-white shadow-lg`}>
                  {getStyleEmoji(userPreferences.preferred_style)} Preferred: {userPreferences.preferred_style === 'genz' ? 'Gen-Z' : userPreferences.preferred_style === 'alpha' ? 'Alpha' : 'Professional'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                  Interests: {userPreferences.interests.join(', ') || 'All topics'}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={14} />
                <span>Updated {formatLastUpdated()}</span>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', icon: Filter },
                { key: 'trending', label: 'Trending', icon: TrendingUp },
                { key: 'latest', label: 'Latest', icon: Zap }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    filter === key
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="max-w-4xl mx-auto px-4 py-10">
          <AnimatePresence>
            <div className="space-y-10">
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NewsCard
                    article={article}
                    onLike={handleLike}
                    onComment={handleComment}
                    comments={comments[article.id] || []}
                    defaultStyle={userPreferences.preferred_style}
                    isLoggedIn={true}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* Loading Indicator */}
          <div ref={ref} className="flex justify-center py-8">
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
              >
                <Loader2 className="animate-spin" size={20} />
                <span>Loading fresh stories...</span>
              </motion.div>
            )}
            
            {!hasMore && !loading && filteredArticles.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 dark:text-gray-500 text-center"
              >
                You've caught up with all the latest news! ✨
              </motion.p>
            )}

            {filteredArticles.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  No articles found for the selected filter.
                </p>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  <RefreshCw size={16} />
                  Refresh News
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}