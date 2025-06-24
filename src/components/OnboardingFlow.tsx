import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, BookOpen, Sparkles, Zap, Check, Heart, Gamepad2, Briefcase, Atom, Trophy, Music, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type StyleType = 'normal' | 'genz' | 'alpha';

interface OnboardingFlowProps {
  onComplete: (preferences: { style: StyleType; interests: string[] }) => void;
}

const styleOptions = [
  {
    key: 'normal' as const,
    title: 'Professional',
    subtitle: 'Clean & Informative',
    description: 'Get straight facts with professional summaries. Perfect for staying informed without the noise.',
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20',
    textColor: 'text-blue-500 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-500/30',
    example: 'Breaking: New AI technology revolutionizes healthcare diagnostics with 95% accuracy rate in clinical trials.'
  },
  {
    key: 'genz' as const,
    title: 'Gen-Z Vibes',
    subtitle: 'Fun & Expressive',
    description: 'News with personality! Emojis, modern slang, and TikTok energy that makes current events actually engaging.',
    icon: Sparkles,
    color: 'from-pink-500 to-purple-500',
    bgColor: 'from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20',
    textColor: 'text-pink-500 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-500/30',
    example: "Y'all, this new AI is absolutely SERVING in healthcare! 🏥✨ 95% accuracy? That's giving main character energy! 💅 #HealthTech"
  },
  {
    key: 'alpha' as const,
    title: 'Alpha Mode',
    subtitle: 'Gaming & Memes',
    description: 'News in Discord language. Short, punchy, and packed with gaming references that hit different.',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20',
    textColor: 'text-orange-500 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-500/30',
    example: 'AI healthcare = OP buff 🔥 95% accuracy rate = no cap. Healthcare getting major W patch notes 💪 #TechWins'
  }
];

const interestOptions = [
  { key: 'technology', label: 'Technology', icon: Zap, color: 'text-blue-500 dark:text-blue-400' },
  { key: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'text-green-500 dark:text-green-400' },
  { key: 'entertainment', label: 'Entertainment', icon: Music, color: 'text-pink-500 dark:text-pink-400' },
  { key: 'sports', label: 'Sports', icon: Trophy, color: 'text-yellow-500 dark:text-yellow-400' },
  { key: 'business', label: 'Business', icon: Briefcase, color: 'text-purple-500 dark:text-purple-400' },
  { key: 'science', label: 'Science', icon: Atom, color: 'text-cyan-500 dark:text-cyan-400' },
  { key: 'lifestyle', label: 'Lifestyle', icon: Heart, color: 'text-red-500 dark:text-red-400' }
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<StyleType | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { theme, toggleTheme } = useTheme();

  const handleStyleSelect = (style: StyleType) => {
    setSelectedStyle(style);
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (currentStep === 0 && selectedStyle) {
      setCurrentStep(1);
    } else if (currentStep === 1 && selectedInterests.length > 0) {
      onComplete({ style: selectedStyle!, interests: selectedInterests });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
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

      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-4">
              {[0, 1].map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    currentStep >= step 
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {currentStep > step ? <Check size={16} /> : step + 1}
                  </div>
                  {step < 1 && (
                    <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
                      currentStep > step ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' : 'bg-gray-200 dark:bg-gray-800'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {currentStep === 0 ? 'Choose Your News Style' : 'Pick Your Interests'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentStep === 0 
                ? 'How do you like your news served?' 
                : 'What topics get you excited?'
              }
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="style-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {styleOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStyle === option.key;
                
                return (
                  <motion.button
                    key={option.key}
                    onClick={() => handleStyleSelect(option.key)}
                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      isSelected
                        ? `border-transparent bg-gradient-to-r ${option.bgColor} backdrop-blur-lg shadow-lg`
                        : 'border-gray-200 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg hover:border-gray-300 dark:hover:border-gray-700/50 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${option.color} shadow-lg`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{option.title}</h3>
                          <span className={`text-sm px-2 py-1 rounded-full ${option.textColor} bg-current/10 border ${option.borderColor}`}>
                            {option.subtitle}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{option.description}</p>
                        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700/50">
                          <p className="text-sm text-gray-700 dark:text-gray-200 italic">"{option.example}"</p>
                        </div>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Check size={14} className="text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="interest-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {interestOptions.map((interest) => {
                  const Icon = interest.icon;
                  const isSelected = selectedInterests.includes(interest.key);
                  
                  return (
                    <motion.button
                      key={interest.key}
                      onClick={() => handleInterestToggle(interest.key)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-transparent bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 backdrop-blur-lg shadow-lg'
                          : 'border-gray-200 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg hover:border-gray-300 dark:hover:border-gray-700/50 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-center">
                        <Icon className={`mx-auto mb-2 ${interest.color}`} size={32} />
                        <p className="text-gray-800 dark:text-white font-medium">{interest.label}</p>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Check size={12} className="text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
                Select at least one interest to continue
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              currentStep === 0
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-lg'
            }`}
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={
              (currentStep === 0 && !selectedStyle) ||
              (currentStep === 1 && selectedInterests.length === 0)
            }
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg ${
              ((currentStep === 0 && selectedStyle) || (currentStep === 1 && selectedInterests.length > 0))
                ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentStep === 1 ? 'Get Started' : 'Next'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}