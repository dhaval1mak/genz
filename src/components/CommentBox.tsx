import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

type StyleType = 'normal' | 'genz' | 'alpha';

interface CommentBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: { name: string; email: string; text: string; style: StyleType }) => void;
  currentStyle: StyleType;
  isLoggedIn?: boolean;
}

export default function CommentBox({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentStyle, 
  isLoggedIn = false 
}: CommentBoxProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    text: ''
  });
  const { theme: _ } = useTheme(); // Unused but keeping context available

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.text.trim()) {
      onSubmit({
        name: isLoggedIn ? 'User' : formData.name,
        email: isLoggedIn ? 'user@example.com' : formData.email,
        text: formData.text,
        style: currentStyle
      });
      setFormData({ name: '', email: '', text: '' });
      onClose();
    }
  };

  const getPlaceholder = () => {
    switch (currentStyle) {
      case 'genz':
        return "Drop your thoughts bestie! ✨";
      case 'alpha':
        return "What's your take? 🔥";
      default:
        return "Share your thoughts...";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="border-t border-gray-200/50 dark:border-gray-800/30 p-4 bg-gray-50/50 dark:bg-gray-900/20 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Add a Comment</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800/50 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoggedIn && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="px-4 py-2 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="px-4 py-2 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            )}

            <textarea
              placeholder={getPlaceholder()}
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
              required
            />

            <div className="flex justify-end">
              <motion.button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                whileTap={{ scale: 0.95 }}
                disabled={!formData.text.trim() || (!isLoggedIn && (!formData.name.trim() || !formData.email.trim()))}
              >
                <Send size={16} />
                Post Comment
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}