import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthForm from './components/AuthForm';
import OnboardingFlow from './components/OnboardingFlow';
import FeedScroller from './components/FeedScroller';
import ArticlePage from './components/ArticlePage';
import ProfilePage from './components/ProfilePage';
import PublicLandingPage from './components/PublicLandingPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { signUp, signIn, signOut, getCurrentUser, updateUserPreferences, getUserPreferences } from './lib/supabase';
import { Loader2 } from 'lucide-react';

type StyleType = 'normal' | 'genz' | 'alpha';

interface UserPreferences {
  preferred_style: StyleType;
  interests: string[];
  onboarding_completed: boolean;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const { data: preferences } = await getUserPreferences(currentUser.id);
        if (preferences) {
          setUserPreferences(preferences);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (email: string, password: string, isSignUp: boolean) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      const { data, error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      if (data.user) {
        setUser(data.user);
        
        // For existing users, check if they have completed onboarding
        if (!isSignUp) {
          const { data: preferences } = await getUserPreferences(data.user.id);
          if (preferences && preferences.onboarding_completed) {
            setUserPreferences(preferences);
          }
        }
        // New users will go through onboarding flow
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Auth error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOnboardingComplete = async (preferences: { style: StyleType; interests: string[] }) => {
    if (!user) return;
    
    try {
      const userPrefs: UserPreferences = {
        preferred_style: preferences.style,
        interests: preferences.interests,
        onboarding_completed: true
      };
      
      await updateUserPreferences(user.id, {
        ...userPrefs,
        email: user.email
      });
      
      setUserPreferences(userPrefs);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setUserPreferences(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-gray-800 dark:text-white"
          >
            <Loader2 className="animate-spin" size={24} />
            <span className="text-lg">Loading GenZ News...</span>
          </motion.div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        <Routes>
          {/* Public Landing Page */}
          <Route 
            path="/" 
            element={
              <PublicLandingPage 
                user={user}
                userPreferences={userPreferences}
                onSignOut={handleSignOut}
              />
            } 
          />
          
          {/* Auth Routes */}
          <Route 
            path="/signup" 
            element={
              !user ? (
                <AuthForm onAuth={handleAuth} loading={authLoading} isSignUp={true} />
              ) : !userPreferences?.onboarding_completed ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/feed" replace />
              )
            } 
          />
          <Route 
            path="/login" 
            element={
              !user ? (
                <AuthForm onAuth={handleAuth} loading={authLoading} isSignUp={false} />
              ) : !userPreferences?.onboarding_completed ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/feed" replace />
              )
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/onboarding" 
            element={
              user && !userPreferences?.onboarding_completed ? (
                <OnboardingFlow onComplete={handleOnboardingComplete} />
              ) : user && userPreferences?.onboarding_completed ? (
                <Navigate to="/feed" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/feed" 
            element={
              user && userPreferences?.onboarding_completed ? (
                <FeedScroller 
                  userPreferences={userPreferences} 
                  onSignOut={handleSignOut}
                  user={user}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              user && userPreferences?.onboarding_completed ? (
                <ProfilePage 
                  user={user} 
                  userPreferences={userPreferences}
                  onSignOut={handleSignOut}
                  onUpdatePreferences={setUserPreferences}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Article Page - Public but enhanced for logged in users */}
          <Route 
            path="/article/:slug" 
            element={
              <ArticlePage 
                user={user}
                userPreferences={userPreferences}
                onSignOut={handleSignOut}
              />
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-red-500/90 backdrop-blur-lg text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {error}
          </motion.div>
        )}
      </div>
    </ThemeProvider>
  );
}