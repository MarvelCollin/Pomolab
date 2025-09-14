import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Command } from 'lucide-react';
import type { ISearchBarProps } from '../../interfaces/ISearchBar';

export default function SearchBar({ onOpenModal }: ISearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenModal]);

  return (
    <motion.div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <motion.button
        onClick={onOpenModal}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="group relative flex items-center gap-3 px-4 py-2.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl shadow-lg hover:bg-white/15 hover:border-white/30 transition-all duration-200 min-w-[280px]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Search className="w-4 h-4 text-white/60 group-hover:text-white/80 transition-colors" />
        
        <span className="flex-1 text-left text-white/60 text-sm group-hover:text-white/80 transition-colors">
          Search friends...
        </span>

        <div className="flex items-center gap-1">
          <motion.kbd 
            className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] text-white/50 group-hover:bg-white/20 group-hover:text-white/70 transition-all"
            animate={{ 
              scale: isFocused ? 1.05 : 1,
              backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <Command className="w-2.5 h-2.5" />
          </motion.kbd>
          <motion.kbd 
            className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] text-white/50 group-hover:bg-white/20 group-hover:text-white/70 transition-all"
            animate={{ 
              scale: isFocused ? 1.05 : 1,
              backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            K
          </motion.kbd>
        </div>

        <motion.div
          className="absolute inset-0 rounded-xl border border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={{ scale: 0.95 }}
          whileHover={{ scale: 1 }}
        />
      </motion.button>
    </motion.div>
  );
}