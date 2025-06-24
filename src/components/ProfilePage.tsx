import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, User, Mail, Settings, Sun, Moon, LogOut, Edit3, Save, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { updateUserPreferences } from '../lib/supabase';

type StyleType = 'normal' | 'genz' | 'alpha';

interface ProfilePageProps {
  user: any;
  userPreferences: {
    preferred_style: StyleType;
    interests: string[];
    onboarding_completed: boolean;
  };
  onSignOut: () => void;
  onUpdatePreferences: (preferences: any) => void;
}

const interestOptions = [
  { key: 'technology', label: 'Technology' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'sports', label: 'Sports' },
  { key: 'business', label: 'Business' },
  { key: 'science', label: 'Science' },
  { key: 'lifestyle', label: 'Lifestyle' }
];

const styleOptions = [
  { key: 'normal' as const, label: 'Professional', color: 'from-blue-500 to-cyan-500' },
  { key: 'genz' as const, label: 'Gen-Z', color: 'from-pink-500 to-purple-500' },
  { key: 'alpha' as const, label: 'Alpha', color: 'from-orange-500 to-red-500' }
];

export default function ProfilePage({ user, userPreferences, onSignOut, onUpdatePreferences }: ProfilePageProps) {
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPreferences, setEditedPreferences] = useState(userPreferences);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUserPreferences(user.id, {
        ...editedPreferences,
        email: user.email
      });
      onUpdatePreferences(editedPreferences);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedPreferences(userPreferences);
    setIsEditing(false);
  };

  const toggleInterest = (interest: string) => {
    setEditedPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <>
      <Helmet>
        <title>Profile - GenZ News</title>
        <meta name="description" content="Manage your GenZ News profile and preferences" />
        <link rel="canonical" href="https://alpha-z.netlify.app/profile" />
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
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">Profile</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your preferences</p>
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

                <button
                  onClick={onSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-8 shadow-xl"
          >
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {user.email?.split('@')[0] || 'User'}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail size={16} />
                    {user.email}
                  </div>
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Preferred Style */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Preferred News Style</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {styleOptions.map((style) => (
                  <button
                    key={style.key}
                    onClick={() => isEditing && setEditedPreferences(prev => ({ ...prev, preferred_style: style.key }))}
                    disabled={!isEditing}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      (isEditing ? editedPreferences.preferred_style : userPreferences.preferred_style) === style.key
                        ? `border-transparent bg-gradient-to-r ${style.color.replace('to-', 'to-').replace('from-', 'from-')}/20 backdrop-blur-lg shadow-lg`
                        : 'border-gray-200 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg hover:border-gray-300 dark:hover:border-gray-700/50'
                    } ${!isEditing ? 'cursor-default' : 'cursor-pointer hover:scale-105'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${style.color} mx-auto mb-2`}></div>
                    <h4 className="font-medium text-gray-800 dark:text-white">{style.label}</h4>
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Interests</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {interestOptions.map((interest) => {
                  const isSelected = (isEditing ? editedPreferences.interests : userPreferences.interests).includes(interest.key);
                  return (
                    <button
                      key={interest.key}
                      onClick={() => isEditing && toggleInterest(interest.key)}
                      disabled={!isEditing}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 text-sm font-medium ${
                        isSelected
                          ? 'border-transparent bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 text-purple-600 dark:text-purple-400'
                          : 'border-gray-200 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400'
                      } ${!isEditing ? 'cursor-default' : 'cursor-pointer hover:scale-105'}`}
                    >
                      {interest.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Stats */}
            <div className="border-t border-gray-200/50 dark:border-gray-800/30 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {userPreferences.interests.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Interests</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {userPreferences.preferred_style === 'genz' ? 'Gen-Z' : userPreferences.preferred_style === 'alpha' ? 'Alpha' : 'Professional'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Preferred Style</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {new Date(user.created_at || Date.now()).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Member Since</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}