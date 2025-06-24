import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ToggleTabs from './ToggleTabs';
import ReactionBar from './ReactionBar';
import CommentBox from './CommentBox';
import { Article, Comment } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { Clock, Tag, Rss, ExternalLink } from 'lucide-react';

type StyleType = 'normal' | 'genz' | 'alpha';

interface NewsCardProps {
  article: Article;
  onLike: (articleId: string, style: StyleType) => void;
  onComment: (articleId: string, comment: { name: string; email: string; text: string; style: StyleType }) => void;
  comments: Comment[];
  defaultStyle?: StyleType;
  isLoggedIn?: boolean;
}

export default function NewsCard({ 
  article, 
  onLike, 
  onComment, 
  comments, 
  defaultStyle = 'normal',
  isLoggedIn = false 
}: NewsCardProps) {
  const [activeStyle, setActiveStyle] = useState<StyleType>(defaultStyle);
  const [showComments, setShowComments] = useState(false);
  const { theme: _ } = useTheme();

  const getContent = () => {
    switch (activeStyle) {
      case 'genz': return article.genz;
      case 'alpha': return article.alpha;
      default: return article.normal;
    }
  };

  // Truncate content to first 100 words for the feed/homepage
  const getPreviewContent = () => {
    const content = getContent();
    const words = content.split(/\s+/);
    const wordLimit = 100;
    
    if (words.length <= wordLimit) {
      return content;
    }
    
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const getStyleBadge = () => {
    switch (activeStyle) {
      case 'genz':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-500 dark:text-pink-400 rounded-full text-xs font-medium border border-pink-200 dark:border-pink-500/30">
            ✨ Gen-Z Vibes
          </div>
        );
      case 'alpha':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-500 dark:text-orange-400 rounded-full text-xs font-medium border border-orange-200 dark:border-orange-500/30">
            🔥 Alpha Mode
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-500 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-500/30">
            📰 Professional
          </div>
        );
    }
  };

  const getContentStyle = () => {
    switch (activeStyle) {
      case 'genz':
        return 'text-pink-800 dark:text-pink-100 leading-relaxed';
      case 'alpha':
        return 'text-orange-800 dark:text-orange-100 leading-relaxed';
      default:
        return 'text-gray-700 dark:text-gray-200 leading-relaxed';
    }
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-2xl overflow-hidden hover:border-gray-300/50 dark:hover:border-gray-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 dark:hover:shadow-purple-500/10"
    >
      {/* Header */}
      <div className="p-7 pb-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <Link to={`/article/${article.slug}`}>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 leading-tight hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                {article.title}
              </h2>
            </Link>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {formatDate(article.published_at)}
              </div>
              <div className="flex items-center gap-1">
                <Tag size={14} />
                {article.category}
              </div>
              <div className="flex items-center gap-1">
                <Rss size={14} />
                {article.rss_source}
              </div>
            </div>
          </div>
          {article.image_url && (
            <div className="ml-5 flex-shrink-0">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-24 h-24 object-cover rounded-xl shadow-lg"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-5">
          <ToggleTabs
            activeStyle={activeStyle}
            onStyleChange={setActiveStyle}
            className="flex-1 max-w-xs"
          />
          {getStyleBadge()}
        </div>
      </div>

      {/* Content Preview */}
      <div className="px-7 pb-5">
        <motion.div
          key={activeStyle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="prose prose-invert max-w-none"
        >
          <p className={`${getContentStyle()} mb-4`}>
            {getPreviewContent()}
          </p>
          <Link 
            to={`/article/${article.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 mt-4"
          >
            Read full article
            <ExternalLink size={16} />
          </Link>
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
        onLike={(style) => onLike(article.id, style)}
        onComment={() => setShowComments(!showComments)}
        onShare={() => {
          navigator.share?.({
            title: article.title,
            text: getContent(),
            url: `${window.location.origin}/article/${article.slug}`
          }) || navigator.clipboard.writeText(`${window.location.origin}/article/${article.slug}`);
        }}
        originalUrl={article.original_url}
      />

      {/* Comments */}
      <CommentBox
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onSubmit={(comment) => onComment(article.id, comment)}
        currentStyle={activeStyle}
        isLoggedIn={isLoggedIn}
      />

      {/* Existing Comments */}
      {comments.length > 0 && showComments && (
        <div className="border-t border-gray-200/50 dark:border-gray-800/30 p-4 bg-gray-50/50 dark:bg-gray-900/20">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
            Comments ({comments.length})
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white/60 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{comment.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-200">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.article>
  );
}