import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Timer, CheckSquare, Music, ImageIcon, Waves, User, Users, UserPlus } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFriendsModal?: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'timer' | 'task' | 'music' | 'background' | 'effect' | 'user' | 'friends';
  icon: React.ComponentType<any>;
  action: () => void;
}

export default function SearchModal({ isOpen, onClose, onOpenFriendsModal }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allResults: SearchResult[] = [
    {
      id: 'start-timer',
      title: 'Start Pomodoro Timer',
      description: 'Begin a 25-minute focus session',
      category: 'timer',
      icon: Timer,
      action: () => console.log('Start timer')
    },
    {
      id: 'pause-timer',
      title: 'Pause Timer',
      description: 'Pause the current session',
      category: 'timer',
      icon: Timer,
      action: () => console.log('Pause timer')
    },
    {
      id: 'reset-timer',
      title: 'Reset Timer',
      description: 'Reset current session to beginning',
      category: 'timer',
      icon: Timer,
      action: () => console.log('Reset timer')
    },
    {
      id: 'add-task',
      title: 'Add New Task',
      description: 'Create a new task for your session',
      category: 'task',
      icon: CheckSquare,
      action: () => console.log('Add task')
    },
    {
      id: 'complete-task',
      title: 'Complete Current Task',
      description: 'Mark the current task as completed',
      category: 'task',
      icon: CheckSquare,
      action: () => console.log('Complete task')
    },
    {
      id: 'music-library',
      title: 'Open Music Library',
      description: 'Browse and play background music',
      category: 'music',
      icon: Music,
      action: () => console.log('Open music')
    },
    {
      id: 'background-selector',
      title: 'Change Background',
      description: 'Select a new background image or video',
      category: 'background',
      icon: ImageIcon,
      action: () => console.log('Change background')
    },
    {
      id: 'audio-effects',
      title: 'Audio Effects',
      description: 'Control ambient sounds and effects',
      category: 'effect',
      icon: Waves,
      action: () => console.log('Audio effects')
    },
    {
      id: 'profile',
      title: 'User Profile',
      description: 'View and edit your profile',
      category: 'user',
      icon: User,
      action: () => console.log('Profile')
    },
    {
      id: 'friends-list',
      title: 'Friends List',
      description: 'View and manage your friends',
      category: 'friends',
      icon: Users,
      action: () => {
        if (onOpenFriendsModal) {
          onOpenFriendsModal();
        }
      }
    },
    {
      id: 'add-friends',
      title: 'Add Friends',
      description: 'Find and add new friends',
      category: 'friends',
      icon: UserPlus,
      action: () => {
        if (onOpenFriendsModal) {
          onOpenFriendsModal();
        }
      }
    },
    {
      id: 'friend-requests',
      title: 'Friend Requests',
      description: 'View pending friend requests',
      category: 'friends',
      icon: Users,
      action: () => {
        if (onOpenFriendsModal) {
          onOpenFriendsModal();
        }
      }
    }
  ];

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults(allResults.slice(0, 6));
    } else {
      const filtered = allResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      results[selectedIndex].action();
      onClose();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'timer': return 'text-orange-400';
      case 'task': return 'text-green-400';
      case 'music': return 'text-blue-400';
      case 'background': return 'text-purple-400';
      case 'effect': return 'text-cyan-400';
      case 'user': return 'text-pink-400';
      case 'friends': return 'text-emerald-400';
      default: return 'text-white/60';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          <motion.div
            className="relative w-full max-w-2xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <Search className="w-5 h-5 text-white/60" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for commands, tasks, or settings..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg"
              />
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result, index) => {
                    const IconComponent = result.icon;
                    return (
                      <motion.div
                        key={result.id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                          index === selectedIndex
                            ? 'bg-white/20 border border-white/30'
                            : 'hover:bg-white/10 border border-transparent'
                        }`}
                        onClick={() => {
                          result.action();
                          onClose();
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className={`p-2 rounded-lg bg-white/10 ${getCategoryColor(result.category)}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">{result.title}</p>
                          <p className="text-white/60 text-xs truncate">{result.description}</p>
                        </div>
                        <div className="text-white/40 text-xs uppercase tracking-wider">
                          {result.category}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-white/40" />
                  </div>
                  <p className="text-white/60 text-sm">No results found</p>
                  <p className="text-white/40 text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">enter</kbd>
                    select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">esc</kbd>
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
