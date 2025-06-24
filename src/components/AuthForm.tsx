import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, Eye, EyeOff, Sparkles, Zap, BookOpen, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AuthFormProps {
  onAuth: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  loading: boolean;
  isSignUp?: boolean;
}

export default function AuthForm({ onAuth, loading, isSignUp: defaultIsSignUp = true }: AuthFormProps) {
  const location = useLocation();
  const isSignUpPage = location.pathname === '/signup';
  const [isSignUp, setIsSignUp] = useState(isSignUpPage || defaultIsSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { theme, toggleTheme } = useTheme();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onAuth(email, password, isSignUp);
    }
  };

  const pageTitle = isSignUp ? 'Sign Up - GenZ News' : 'Sign In - GenZ News';
  const pageDescription = isSignUp 
    ? 'Join GenZ News - AI-powered news aggregator with personalized content in Normal, Gen-Z, and Alpha styles.'
    : 'Sign in to GenZ News - Access your personalized AI-powered news feed.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://alpha-z.netlify.app${location.pathname}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          className="fixed top-4 right-4 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {theme === 'dark' ? (
            <Sun className="text-yellow-500" size={20} />
          ) : (
            <Moon className="text-slate-700" size={20} />
          )}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg"
            >
              <Zap className="text-white" size={32} />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">GenZ News</h1>
            <p className="text-gray-600 dark:text-gray-400">AI-powered news for the next generation</p>
          </div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="text-center p-3 bg-white/60 dark:bg-gray-800/30 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <BookOpen className="text-blue-500 mx-auto mb-2" size={20} />
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Professional</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 rounded-xl backdrop-blur-sm border border-pink-200/50 dark:border-pink-500/30 shadow-sm">
              <Sparkles className="text-pink-500 mx-auto mb-2" size={20} />
              <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Gen-Z</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-xl backdrop-blur-sm border border-orange-200/50 dark:border-orange-500/30 shadow-sm">
              <Zap className="text-orange-500 mx-auto mb-2" size={20} />
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Alpha</p>
            </div>
          </motion.div>

          {/* Auth Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex mb-6 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-1">
              <Link
                to="/signup"
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 text-center ${
                  isSignUpPage
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 text-center ${
                  !isSignUpPage
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Sign In
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      errors.email ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800/50 border rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      errors.password ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isSignUpPage ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  isSignUpPage ? 'Create Account' : 'Sign In'
                )}
              </motion.button>
            </form>

            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4">
              {isSignUpPage ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link
                to={isSignUpPage ? '/login' : '/signup'}
                className="text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
              >
                {isSignUpPage ? 'Sign In' : 'Sign Up'}
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}