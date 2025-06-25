import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Tag, Rss, Share2, ExternalLink, User, Sun, Moon, LogOut, UserPlus, LogIn } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Article, getArticleBySlug, Comment } from '../lib/supabase';
import { getArticleImage, getArticleImageAlt, handleImageError } from '../lib/imageUtils';
import ToggleTabs from './ToggleTabs';
import ReactionBar from './ReactionBar';
import CommentBox from './CommentBox';

type StyleType = 'normal' | 'genz' | 'alpha';

interface ArticlePageProps {
  user: any;
  userPreferences?: {
    preferred_style: StyleType;
    interests: string[];
  } | null;
  onSignOut: () => void;
}

export default function ArticlePage({ user, userPreferences, onSignOut }: ArticlePageProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStyle, setActiveStyle] = useState<StyleType>(userPreferences?.preferred_style || 'normal');
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    if (slug) {
      loadArticle(slug);
    }
  }, [slug]);

  const loadArticle = async (articleSlug: string) => {
    try {
      setLoading(true);
      const { data, error } = await getArticleBySlug(articleSlug);
      if (error) throw error;
      if (data) {
        setArticle(data);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading article:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getContent = () => {
    if (!article) return '';
    switch (activeStyle) {
      case 'genz': return article.genz;
      case 'alpha': return article.alpha;
      default: return article.normal;
    }
  };

  // Format content to show 250 words on article detail page
  const getFormattedContent = () => {
    if (!article) return '';
    
    const content = getContent();
    const words = content.split(/\s+/);
    const wordLimit = 250;
    
    if (words.length <= wordLimit) {
      return content;
    }
    
    const summary = words.slice(0, wordLimit).join(' ') + '...';
    
    return (
      <>
        <div>{summary}</div>
        {article.original_url && (
          <div className="mt-4">
            <a 
              href={article.original_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Read Full Article <ExternalLink size={16} />
            </a>
          </div>
        )}
      </>
    );
  };

  // Generate a clean text excerpt for SEO description
  const getArticleExcerpt = () => {
    if (!article) return '';
    // Get content based on active style
    const content = getContent();
    // Remove HTML tags and limit to ~160 chars for meta description
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 160 ? textContent.substring(0, 157) + '...' : textContent;
  };

  // Format date for display and SEO
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Format date for SEO (ISO format)
  const formatISODate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString();
  };

  const handleLike = async (articleId: string, style: StyleType) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    
    try {
      // In a real app, you would update the database here
      // For now, we'll just update the state
      setArticle(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          likes_normal: style === 'normal' ? prev.likes_normal + 1 : prev.likes_normal,
          likes_genz: style === 'genz' ? prev.likes_genz + 1 : prev.likes_genz,
          likes_alpha: style === 'alpha' ? prev.likes_alpha + 1 : prev.likes_alpha
        };
      });
      
      console.log(`Liked article ${articleId} with style ${style}`);
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleComment = async (articleId: string, comment: { name: string; email: string; text: string; style: StyleType }) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

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
      
      setComments(prev => [...prev, newComment]);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Article not found</h1>
          <Link to="/" className="text-purple-500 hover:text-purple-600">Go back to home</Link>
        </div>
      </div>
    );
  }

  const pageTitle = `${article.title} - GenZ News`;
  const pageDescription = getArticleExcerpt();

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={article.category} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={article.image_url || 'https://slangpress.netlify.app/default-og-image.jpg'} />
        <meta property="article:published_time" content={formatISODate(article.published_at)} />
        <meta property="article:section" content={article.category} />
        <link rel="canonical" href={`https://slangpress.netlify.app/article/${article.slug}`} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "description": pageDescription,
            "image": article.image_url,
            "datePublished": formatISODate(article.published_at),
            "dateModified": formatISODate(article.created_at),
            "author": {
              "@type": "Organization",
              "name": "GenZ News"
            },
            "publisher": {
              "@type": "Organization",
              "name": "GenZ News",
              "logo": {
                "@type": "ImageObject",
                "url": "https://slangpress.netlify.app/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://slangpress.netlify.app/article/${article.slug}`
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-full transition-colors"
                >
                  <ArrowLeft className="text-gray-600 dark:text-gray-400" size={20} />
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">GenZ News</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Article View</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-full transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="text-yellow-500" size={20} />
                  ) : (
                    <Moon className="text-gray-600" size={20} />
                  )}
                </button>

                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-full transition-colors"
                    >
                      <User className="text-gray-600 dark:text-gray-400" size={20} />
                    </button>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 top-12 bg-white dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200 dark:border-gray-800/50 rounded-xl p-2 min-w-48 shadow-xl"
                      >
                        <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800/50">
                          {user?.email}
                        </div>
                        <Link
                          to="/feed"
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                        >
                          <User size={16} />
                          My Feed
                        </Link>
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
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                      <LogIn size={16} />
                      <span className="hidden sm:inline">Sign In</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200"
                    >
                      <UserPlus size={16} />
                      <span className="hidden sm:inline">Sign Up</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-10">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Article Header */}
            <div className="p-8 sm:p-10">
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
                    {article.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {formatDate(article.published_at)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag size={16} />
                      {article.category}
                    </div>
                    <div className="flex items-center gap-2">
                      <Rss size={16} />
                      {article.rss_source}
                    </div>
                  </div>
                </div>
                <div className="ml-6 flex-shrink-0">
                  <img
                    src={getArticleImage(article)}
                    alt={getArticleImageAlt(article)}
                    onError={(e) => handleImageError(e, article)}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shadow-lg"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <ToggleTabs
                  activeStyle={activeStyle}
                  onStyleChange={setActiveStyle}
                  className="max-w-xs"
                />
                <div className="flex items-center gap-4">
                  {article.original_url && (
                    <a
                      href={article.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-100 dark:bg-gray-800/50 rounded-full transition-colors"
                    >
                      <ExternalLink size={14} />
                      <span className="hidden sm:inline">Source</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      navigator.share?.({
                        title: article.title,
                        text: getContent(),
                        url: window.location.href
                      }) || navigator.clipboard.writeText(window.location.href);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-100 dark:bg-gray-800/50 rounded-full transition-colors"
                  >
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="px-8 sm:px-10 pb-8">
              <motion.div
                key={activeStyle}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="prose prose-lg max-w-none"
              >
                <div className={`text-lg leading-relaxed ${
                  activeStyle === 'genz' 
                    ? 'text-pink-800 dark:text-pink-100' 
                    : activeStyle === 'alpha'
                    ? 'text-orange-800 dark:text-orange-100'
                    : 'text-gray-700 dark:text-gray-200'
                }`}>
                  {getFormattedContent()}
                </div>
              </motion.div>
            </div>

            {/* Reactions */}
            <ReactionBar
              articleId={article.id}
              currentStyle={activeStyle}
              likes={{
                normal: article.likes_normal,
                genz: article.likes_genz,
                alpha: article.likes_alpha
              }}
              commentCount={comments.length}
              onLike={(style) => handleLike(article.id, style)}
              onComment={() => user ? setShowComments(!showComments) : setShowAuthPrompt(true)}
              onShare={() => {
                navigator.share?.({
                  title: article.title,
                  text: getContent(),
                  url: window.location.href
                }) || navigator.clipboard.writeText(window.location.href);
              }}
              originalUrl={article.original_url}
            />

            {/* Comments */}
            <CommentBox
              isOpen={showComments}
              onClose={() => setShowComments(false)}
              onSubmit={(comment) => handleComment(article.id, comment)}
              currentStyle={activeStyle}
              isLoggedIn={!!user}
            />

            {/* Existing Comments */}
            {comments.length > 0 && showComments && (
              <div className="border-t border-gray-200/50 dark:border-gray-800/30 p-6 bg-gray-50/50 dark:bg-gray-900/20">
                <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-4">
                  Comments ({comments.length})
                </h4>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-white/60 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800 dark:text-white">{comment.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-200">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.article>
        </div>

        {/* Auth Prompt Modal */}
        {showAuthPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAuthPrompt(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Join GenZ News
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Sign up to like, comment, and personalize your news experience!
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/signup"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200"
                    onClick={() => setShowAuthPrompt(false)}
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    onClick={() => setShowAuthPrompt(false)}
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  );
}