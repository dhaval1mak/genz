import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

type StyleType = 'normal' | 'genz' | 'alpha';

interface ToggleTabsProps {
  activeStyle: StyleType;
  onStyleChange: (style: StyleType) => void;
  className?: string;
}

const styles = [
  { key: 'normal' as const, label: 'Normal', emoji: '📰' },
  { key: 'genz' as const, label: 'GenZ', emoji: '✨' },
  { key: 'alpha' as const, label: 'Alpha', emoji: '🔥' }
];

export default function ToggleTabs({ activeStyle, onStyleChange, className = '' }: ToggleTabsProps) {
  const { theme: _ } = useTheme(); // Keep context available

  return (
    <div className={`relative flex bg-gray-100 dark:bg-gray-900/20 backdrop-blur-sm rounded-full p-1.5 ${className}`}>
      <motion.div
        className="absolute inset-y-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
        layoutId="activeTab"
        initial={false}
        animate={{
          x: styles.findIndex(s => s.key === activeStyle) * 100 + '%',
          width: `${100 / styles.length}%`,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      
      {styles.map((style) => (
        <button
          key={style.key}
          onClick={() => onStyleChange(style.key)}
          className={`relative z-10 flex-1 px-4 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
            activeStyle === style.key
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <span>{style.emoji}</span>
          <span>{style.label}</span>
        </button>
      ))}
    </div>
  );
}