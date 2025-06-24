import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

type StyleType = 'normal' | 'genz' | 'alpha';

interface ReactionBarProps {
  articleId: string;
  currentStyle: StyleType;
  likes: { normal: number; genz: number; alpha: number };
  commentCount: number;
  onLike: (style: StyleType) => void;
  onComment: () => void;
  onShare: () => void;
  originalUrl?: string;
}

export default function ReactionBar({
  articleId,
  currentStyle,
  likes,
  commentCount,
  onLike,
  onComment,
  onShare,
  originalUrl
}: ReactionBarProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { theme } = useTheme();
  const currentLikes = likes[currentStyle];

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(currentStyle);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this news article!',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
    onShare();
  };

  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-200/50 dark:border-gray-800/30 bg-gray-50/30 dark:bg-gray-900/10">
      <div className="flex items-center gap-4">
        <motion.button
          onClick={handleLike}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
            isLiked
              ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              size={18} 
              className={isLiked ? 'fill-current' : ''} 
            />
          </motion.div>
          <span className="text-sm font-medium">{currentLikes + (isLiked ? 1 : 0)}</span>
        </motion.button>

        <motion.button
          onClick={onComment}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200"
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={18} />
          <span className="text-sm font-medium">{commentCount}</span>
        </motion.button>

        <motion.button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-all duration-200"
          whileTap={{ scale: 0.95 }}
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">Share</span>
        </motion.button>
      </div>

      {originalUrl && (
        <motion.a
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200"
          whileTap={{ scale: 0.95 }}
        >
          <ExternalLink size={16} />
          <span className="text-sm">Source</span>
        </motion.a>
      )}
    </div>
  );
}