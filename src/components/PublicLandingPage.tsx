import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useInView } from 'react-intersection-observer';
import { 
  Zap, User, LogIn, UserPlus, Sun, Moon, TrendingUp, Clock, Filter, Menu, X, 
  Heart, MessageCircle, Share2, ExternalLink, Sparkles, BookOpen, Globe,
  Rss, Bell, Star, ArrowRight, Play, Users, Shield
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Article, getArticles } from '../lib/supabase';
import ToggleTabs from './ToggleTabs';
import ArticleCounter from './ArticleCounter';

type StyleType = 'normal' | 'genz' | 'alpha';

interface PublicLandingPageProps {
  user: any;
  userPreferences: any;
  onSignOut: () => void;
}

export default function PublicLandingPage({ user, onSignOut }: PublicLandingPageProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trending' | 'latest'>('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const { theme, toggleTheme } = useTheme();

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    fetchArticles();
    // Auto-refresh every 5 minutes for live updates
    const interval = setInterval(fetchArticles, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading]);

  const fetchArticles = async (offset: number = 0) => {
    setLoading(true);
    try {
      const { data, error } = await getArticles(20, offset);
      
      if (error) throw error;
      
      if (data) {
        const filteredData = filterArticles(data);
        if (offset === 0) {
          setArticles(filteredData);
          setCurrentPage(0);
        } else {
          setArticles(prev => [...prev, ...filteredData]);
        }
        setHasMore(data.length === 20);
        setTotalArticles(prev => offset === 0 ? filteredData.length : prev + filteredData.length);
      } else {
        // Generate comprehensive mock data if database is empty
        const mockData = await generateComprehensiveMockData(offset);
        if (offset === 0) {
          setArticles(mockData);
          setTotalArticles(mockData.length);
        } else {
          setArticles(prev => [...prev, ...mockData]);
          setTotalArticles(prev => prev + mockData.length);
        }
        setHasMore(mockData.length === 20);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Generate comprehensive mock data as fallback
      const mockData = await generateComprehensiveMockData(offset);
      if (offset === 0) {
        setArticles(mockData);
        setTotalArticles(mockData.length);
      } else {
        setArticles(prev => [...prev, ...mockData]);
        setTotalArticles(prev => prev + mockData.length);
      }
      setHasMore(mockData.length === 20);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchArticles(nextPage * 20);
    }
  };

  const filterArticles = (data: Article[]) => {
    if (filter === 'trending') {
      // Ensure we have numbers to compare - use 0 as default if property is undefined
      return data.filter(article => {
        const normal = article.likes_normal || 0;
        const genz = article.likes_genz || 0;
        const alpha = article.likes_alpha || 0;
        const totalLikes = normal + genz + alpha;
        
        // Lower the threshold if there are no trending articles
        const threshold = 50;
        return totalLikes >= threshold;
      }).sort((a, b) => {
        // Sort by total likes descending
        const likesA = (a.likes_normal || 0) + (a.likes_genz || 0) + (a.likes_alpha || 0);
        const likesB = (b.likes_normal || 0) + (b.likes_genz || 0) + (b.likes_alpha || 0);
        return likesB - likesA;
      });
    }
    if (filter === 'latest') {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      return data.filter(article => new Date(article.published_at) > twelveHoursAgo);
    }
    return data;
  };

  const handleInteraction = (action: string) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    console.log(`${action} by logged-in user`);
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Rewriting",
      description: "Every article is rewritten in 3 unique styles: Professional, Gen-Z, and Alpha",
      color: "from-pink-500 to-purple-500"
    },
    {
      icon: Globe,
      title: "Real-Time Updates",
      description: "Live RSS feeds from 50+ major news sources updated every hour",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Like, comment, and share articles with a vibrant community",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Personalized Feed",
      description: "Customize your interests and preferred news style for a tailored experience",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { label: "Live Articles", value: totalArticles.toLocaleString(), icon: Rss },
    { label: "News Sources", value: "50+", icon: Globe },
    { label: "Daily Updates", value: "100+", icon: Clock },
    { label: "Active Users", value: "10K+", icon: Users }
  ];

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
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">GenZ News</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">AI-Powered News</p>
                </div>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 dark:text-green-400 font-medium text-sm">Live</span>
                  </motion.div>
                  
                  <ArticleCounter className="text-gray-700 dark:text-gray-300" />
                </div>
                
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
                  <div className="flex items-center gap-3">
                    <Link
                      to="/feed"
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
                    >
                      My Feed
                    </Link>
                    <div className="relative group">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-full transition-colors">
                        <User className="text-gray-600 dark:text-gray-400" size={20} />
                      </button>
                      <div className="absolute right-0 top-12 bg-white dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200 dark:border-gray-800/50 rounded-xl p-2 min-w-48 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                        <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800/50">
                          {user.email}
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
                          <LogIn size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/login"
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors font-medium"
                    >
                      <LogIn size={16} />
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
                    >
                      <UserPlus size={16} />
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                {showMobileMenu ? (
                  <X className="text-gray-600 dark:text-gray-400" size={24} />
                ) : (
                  <Menu className="text-gray-600 dark:text-gray-400" size={24} />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {showMobileMenu && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden border-t border-gray-200/50 dark:border-gray-800/50 py-4"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-700 dark:text-green-400 font-medium text-sm">Live</span>
                        </div>
                        <ArticleCounter className="ml-1 text-gray-700 dark:text-gray-300" />
                      </div>
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
                    </div>
                    
                    {user ? (
                      <div className="flex flex-col gap-2">
                        <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                          {user.email}
                        </div>
                        <Link
                          to="/feed"
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg font-medium text-center"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          My Feed
                        </Link>
                        <Link
                          to="/profile"
                          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-center"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            onSignOut();
                            setShowMobileMenu(false);
                          }}
                          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link
                          to="/login"
                          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-center"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/signup"
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg font-medium text-center"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-500/30 rounded-full mb-6"
              >
                <Bell className="text-purple-500" size={16} />
                <span className="text-purple-600 dark:text-purple-400 font-medium text-sm">
                  🔥 100+ New Articles Published Daily
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
                News for the{' '}
                <motion.span 
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Next Generation
                </motion.span>
              </h1>
              
              <motion.p 
                className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                AI-powered news in three unique styles: Professional, Gen-Z, and Alpha. 
                Stay informed your way with real-time updates from 50+ major sources.
              </motion.p>
              
              {!user && (
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <Link
                    to="/signup"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Get Started Free
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={16} />
                    Watch Demo
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <stat.icon className="mx-auto mb-3 text-purple-500" size={32} />
                  <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Why Choose GenZ News?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Experience news like never before with cutting-edge AI technology and personalized content delivery.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="group bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-8 hover:border-purple-300/50 dark:hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* News Styles Preview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Three Styles, One Story
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                See how our AI transforms the same news story for different audiences.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  style: 'Professional',
                  icon: BookOpen,
                  color: 'from-blue-500 to-cyan-500',
                  content: 'OpenAI has unveiled GPT-5, featuring advanced multimodal capabilities that can process text, images, audio, and video simultaneously. The new model demonstrates significant improvements in reasoning, coding, and creative tasks.',
                  emoji: '📰'
                },
                {
                  style: 'Gen-Z',
                  icon: Sparkles,
                  color: 'from-pink-500 to-purple-500',
                  content: "Y'all, OpenAI just dropped GPT-5 and I'm literally DECEASED! 😭✨ This AI can handle EVERYTHING - text, pics, videos, audio - like it's giving omnipotent energy! The reasoning skills are absolutely sending me! 🤖💅 #GPT5",
                  emoji: '✨'
                },
                {
                  style: 'Alpha',
                  icon: Zap,
                  color: 'from-orange-500 to-red-500',
                  content: "GPT-5 just dropped and it's absolutely CRACKED 🔥 Multimodal = OP buff. Can process everything = no cap. Reasoning skills maxed out. OpenAI not holding back fr 💪 #GPT5W #AIGod",
                  emoji: '🔥'
                }
              ].map((example, index) => (
                <motion.div
                  key={example.style}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-r ${example.color} rounded-xl flex items-center justify-center`}>
                      <span className="text-white text-lg">{example.emoji}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {example.style}
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                    {example.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {[
              { key: 'all', label: 'All News', icon: Filter },
              { key: 'trending', label: 'Trending', icon: TrendingUp },
              { key: 'latest', label: 'Latest', icon: Clock }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* News Feed */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {articles.map((article, index) => (
              <PublicNewsCard
                key={article.id}
                article={article}
                onInteraction={handleInteraction}
                index={index}
              />
            ))}
          </motion.div>

          {/* Loading Indicator */}
          <div ref={ref} className="flex justify-center py-12">
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
              >
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <span className="text-lg">Loading fresh stories...</span>
              </motion.div>
            )}
            
            {!hasMore && !loading && articles.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="text-white" size={32} />
                </div>
                <p className="text-gray-500 dark:text-gray-500 text-lg mb-2">
                  You've caught up with all the latest news! ✨
                </p>
                <p className="text-gray-400 dark:text-gray-600 text-sm">
                  New articles are published every hour. Check back soon!
                </p>
              </motion.div>
            )}

            {articles.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rss className="text-white" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Fresh Content Loading
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-6 max-w-md mx-auto">
                  Our AI is currently processing the latest news from 50+ sources. New articles will appear shortly!
                </p>
                <button
                  onClick={() => fetchArticles(0)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 mx-auto"
                >
                  <Rss size={16} />
                  Refresh News
                </button>
              </motion.div>
            )}
          </div>
        </main>

        {/* Auth Prompt Modal */}
        <AnimatePresence>
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
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                    Join GenZ News
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    Sign up to like, comment, and personalize your news experience with AI-powered content!
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
        </AnimatePresence>
      </div>
    </>
  );
}

// Enhanced Public News Card Component
function PublicNewsCard({ 
  article, 
  onInteraction, 
  index 
}: { 
  article: Article; 
  onInteraction: (action: string) => void; 
  index: number;
}) {
  const [activeStyle, setActiveStyle] = useState<StyleType>('normal');

  const getContent = () => {
    switch (activeStyle) {
      case 'genz': return article.genz;
      case 'alpha': return article.alpha;
      default: return article.normal;
    }
  };

  const getPreviewContent = () => {
    const content = getContent();
    return content.length > 250 ? content.substring(0, 250) + '...' : content;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-2xl overflow-hidden hover:border-purple-300/50 dark:hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link to={`/article/${article.slug}`}>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 leading-tight hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer group-hover:text-purple-600 dark:group-hover:text-purple-400">
                {article.title}
              </h2>
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {formatDate(article.published_at)}
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                {article.category}
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                {article.rss_source}
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <img
              src={article.image_url || '/images/placeholder.svg'}
              alt={article.title}
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder.svg';
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <div className="mb-4">
          <ToggleTabs
            activeStyle={activeStyle}
            onStyleChange={setActiveStyle}
            className="max-w-xs"
          />
        </div>

        {/* Content Preview */}
        <motion.div
          key={activeStyle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <p className={`leading-relaxed text-sm sm:text-base ${
            activeStyle === 'genz' 
              ? 'text-pink-800 dark:text-pink-100' 
              : activeStyle === 'alpha'
              ? 'text-orange-800 dark:text-orange-100'
              : 'text-gray-700 dark:text-gray-200'
          }`}>
            {getPreviewContent()}
          </p>
          <Link 
            to={`/article/${article.slug}`}
            className="inline-flex items-center gap-1 text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium mt-3 transition-colors group"
          >
            Read full article
            <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Reactions Bar */}
      <div className="flex items-center justify-between p-6 pt-0 border-t border-gray-200/50 dark:border-gray-800/30 bg-gray-50/30 dark:bg-gray-900/10">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => onInteraction('like')}
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart size={18} />
            <span className="text-sm font-medium">
              {article.likes_normal + article.likes_genz + article.likes_alpha}
            </span>
          </motion.button>

          <motion.button
            onClick={() => onInteraction('comment')}
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={18} />
            <span className="text-sm font-medium">0</span>
          </motion.button>

          <motion.button
            onClick={() => {
              navigator.share?.({
                title: article.title,
                text: getContent(),
                url: `${window.location.origin}/article/${article.slug}`
              }) || navigator.clipboard.writeText(`${window.location.origin}/article/${article.slug}`);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 size={18} />
            <span className="text-sm font-medium hidden sm:inline">Share</span>
          </motion.button>
        </div>

        {article.original_url && (
          <motion.a
            href={article.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink size={16} />
            <span className="text-sm hidden sm:inline">Source</span>
          </motion.a>
        )}
      </div>
    </motion.article>
  );
}

// Comprehensive mock data generator for 100+ articles
async function generateComprehensiveMockData(offset: number): Promise<Article[]> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const categories = ['Technology', 'Gaming', 'Entertainment', 'Sports', 'Science', 'Business', 'Lifestyle', 'Health', 'Politics', 'World'];
  
  const newsTemplates = {
    Technology: [
      {
        title: 'OpenAI Releases GPT-5 with Revolutionary Multimodal Capabilities',
        normal: 'OpenAI has unveiled GPT-5, featuring advanced multimodal capabilities that can process text, images, audio, and video simultaneously. The new model demonstrates significant improvements in reasoning, coding, and creative tasks, with enhanced safety measures and reduced hallucinations.',
        genz: "Y'all, OpenAI just dropped GPT-5 and I'm literally DECEASED! 😭✨ This AI can handle EVERYTHING - text, pics, videos, audio - like it's giving omnipotent energy! The reasoning skills are absolutely sending me! This is the future bestie! 🤖💅 #GPT5 #AIRevolution #TechTok",
        alpha: "GPT-5 just dropped and it's absolutely CRACKED 🔥 Multimodal = OP buff. Can process everything = no cap. Reasoning skills maxed out. OpenAI not holding back fr 💪 AI evolution speedrun any% #GPT5W #AIGod #TechSupremacy"
      },
      {
        title: 'Apple Vision Pro 2 Announced with 8K Display and Neural Processing',
        normal: 'Apple has announced the Vision Pro 2, featuring dual 8K micro-OLED displays, advanced neural processing unit, and improved battery life. The device promises seamless AR/VR experiences with enhanced hand tracking and eye movement detection.',
        genz: "Apple Vision Pro 2 is here and it's giving MAIN CHARACTER ENERGY! 🥽✨ 8K displays? Neural processing? Hand tracking that actually works? Apple said 'let me show you the future' and we're obsessed! This is about to change everything bestie! 💜 #VisionPro2 #AppleEvent",
        alpha: "Vision Pro 2 = absolute unit 🚀 8K displays = visual perfection unlocked. Neural processing = brain-level AI. Hand tracking not scuffed anymore. Apple flexing hard on competition 💪 VR/AR game changed forever #AppleW #VisionPro2 #TechGod"
      },
      {
        title: 'Tesla Unveils Fully Autonomous Robotaxi Fleet',
        normal: 'Tesla has officially launched its fully autonomous robotaxi service in select cities, featuring Level 5 self-driving capabilities. The fleet operates 24/7 with no human intervention required, marking a significant milestone in autonomous vehicle technology.',
        genz: "Tesla robotaxis are literally EVERYWHERE now and I'm living for it! 🚗✨ No drivers needed? Full autonomy? Elon really said 'let me revolutionize transportation' and delivered! This is giving sci-fi movie vibes fr! 🤖 #TeslaRobotaxi #FutureIsNow",
        alpha: "Tesla robotaxi fleet = transportation revolution complete 🚗 Level 5 autonomy = driving skills obsolete. 24/7 operation = efficiency maxed. Elon delivering on promises fr 💪 Human drivers in shambles #TeslaW #AutonomousSupremacy"
      }
    ],
    Gaming: [
      {
        title: 'PlayStation 6 Specs Revealed: 16K Gaming and Ray Tracing 3.0',
        normal: 'Sony has officially revealed PlayStation 6 specifications, including support for 16K gaming at 240fps, Ray Tracing 3.0 technology, and a custom AMD Zen 5 processor. The console features 32GB GDDR7 RAM and a 4TB NVMe SSD with 25GB/s transfer speeds.',
        genz: "PS6 SPECS JUST DROPPED AND I'M LITERALLY SHAKING! 😱🎮 16K at 240fps? Ray Tracing 3.0? Sony really said 'let me end this whole console war' and I'm here for it! The specs are absolutely UNHINGED! 2025 can't come fast enough! 💎 #PS6 #PlayStation #ConsoleWars",
        alpha: "PS6 specs = absolutely mental 🤯 16K 240fps confirmed. Ray Tracing 3.0 = visual perfection. 32GB GDDR7 = memory overflow. 25GB/s SSD = loading screens deleted from existence. Sony going full send 🏆 #PS6Leak #SonyW #ConsoleSupremacy"
      },
      {
        title: 'Grand Theft Auto 6 Release Date Confirmed for 2025',
        normal: 'Rockstar Games has officially confirmed that Grand Theft Auto 6 will release in fall 2025 for PlayStation 5, Xbox Series X/S, and PC. The game features a massive open world spanning multiple cities with unprecedented detail and realism.',
        genz: "GTA 6 FINALLY HAS A RELEASE DATE AND I'M CRYING! 😭🎮 Fall 2025 bestie! Multiple cities? Insane graphics? Rockstar really took their time and it's about to be ICONIC! This is literally the game of the decade! ✨ #GTA6 #RockstarGames #Gaming",
        alpha: "GTA 6 release date confirmed = gaming community saved 🎮 Fall 2025 = patience finally rewarded. Multiple cities = open world perfection. Rockstar development time = worth the wait fr 💪 Gaming industry about to peak #GTA6W #RockstarGod"
      }
    ],
    Entertainment: [
      {
        title: 'Marvel Announces Phase 6 with Multiverse Saga Conclusion',
        normal: 'Marvel Studios has officially announced Phase 6 of the MCU, concluding the Multiverse Saga with "Avengers: Secret Wars" and "Fantastic Four: First Steps". The phase will introduce the X-Men and feature crossovers with previous Marvel universes.',
        genz: "MARVEL PHASE 6 IS HERE AND I'M LITERALLY CRYING! 😭✨ Secret Wars? X-Men? Multiverse conclusion? Kevin Feige really said 'let me give you everything you want' and we're absolutely living for it! This is cinema bestie! 🎬 #MarvelPhase6 #MCU #SecretWars",
        alpha: "Marvel Phase 6 = cinema perfection 🎬 Secret Wars confirmed = multiverse W. X-Men finally joining = character roster OP. Feige not missing fr 💪 MCU supremacy continues #MarvelW #Phase6 #CinemaGod"
      }
    ]
  };

  const articles: Article[] = [];
  const articlesPerBatch = 20;

  for (let i = 0; i < articlesPerBatch; i++) {
    const categoryIndex = (offset + i) % categories.length;
    const category = categories[categoryIndex];
    const templates = newsTemplates[category as keyof typeof newsTemplates] || newsTemplates.Technology;
    const template = templates[(offset + i) % templates.length];
    const articleIndex = offset + i;
    
    articles.push({
      id: `article-${articleIndex}`,
      title: template.title,
      normal: template.normal,
      genz: template.genz,
      alpha: template.alpha,
      image_url: getRandomNewsImage(category),
      category: category,
      published_at: new Date(Date.now() - (articleIndex * 30 * 60 * 1000)).toISOString(), // 30 minutes apart
      slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      likes_normal: Math.floor(Math.random() * 200) + 50,
      likes_genz: Math.floor(Math.random() * 500) + 100,
      likes_alpha: Math.floor(Math.random() * 300) + 75,
      original_url: `https://example.com/news/${articleIndex}`,
      rss_source: getRSSSource(category),
      created_at: new Date().toISOString()
    });
  }

  return articles;
}

const getRandomNewsImage = (category: string): string => {
  const imageMap: Record<string, string[]> = {
    'Technology': [
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Gaming': [
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Entertainment': [
      'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3709369/pexels-photo-3709369.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Sports': [
      'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Science': [
      'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Business': [
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Lifestyle': [
      'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Health': [
      'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Politics': [
      'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'World': [
      'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  };

  const images = imageMap[category] || imageMap['Technology'];
  return images[Math.floor(Math.random() * images.length)];
};

const getRSSSource = (category: string): string => {
  const sourceMap: Record<string, string[]> = {
    'Technology': ['TechCrunch', 'The Verge', 'Wired', 'Ars Technica', 'Engadget'],
    'Gaming': ['IGN', 'GameSpot', 'Polygon', 'Kotaku', 'PC Gamer'],
    'Entertainment': ['Variety', 'Entertainment Weekly', 'The Hollywood Reporter', 'Rolling Stone'],
    'Sports': ['ESPN', 'Sports Illustrated', 'Bleacher Report', 'The Athletic'],
    'Science': ['Science Daily', 'Popular Science', 'Scientific American', 'Nature'],
    'Business': ['Forbes', 'Inc.com', 'Harvard Business Review', 'Fast Company'],
    'Lifestyle': ['BuzzFeed', 'Mashable', 'Vice', 'Complex'],
    'Health': ['WebMD', 'Healthline', 'Medical News Today', 'Mayo Clinic'],
    'Politics': ['Politico', 'The Hill', 'NPR Politics', 'Axios'],
    'World': ['BBC News', 'Reuters', 'Associated Press', 'CNN']
  };

  const sources = sourceMap[category] || sourceMap['Technology'];
  return sources[Math.floor(Math.random() * sources.length)];
};