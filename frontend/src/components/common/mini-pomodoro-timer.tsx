import { useRef } from 'react';
import { Play, Pause, RotateCcw, X, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import type { IMiniPomodoroTimer } from '../../interfaces/IMiniPomodoroTimer';

export default function MiniPomodoroTimer({
  currentSession,
  timeLeft,
  isRunning,
  onToggleTimer,
  onResetTimer,
  onClose,
  sessionLabels
}: IMiniPomodoroTimer) {
  const constraintsRef = useRef(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'focus':
        return 'bg-red-500/20 border-red-500/30';
      case 'short-break':
        return 'bg-green-500/20 border-green-500/30';
      case 'long-break':
        return 'bg-blue-500/20 border-blue-500/30';
      default:
        return 'bg-white/10 border-white/20';
    }
  };

  return (
    <motion.div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-50"
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        whileDrag={{ scale: 1.05, rotate: 2 }}
        className={`absolute top-20 right-6 backdrop-blur-3xl border rounded-3xl shadow-2xl pointer-events-auto overflow-hidden ${getSessionColor()}`}
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          
          <div className="relative p-4 min-w-[180px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GripVertical className="w-3 h-3 text-white/40 cursor-move" />
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isRunning 
                    ? currentSession === 'focus' 
                      ? 'bg-red-400 animate-pulse shadow-red-400/50 shadow-lg' 
                      : currentSession === 'short-break'
                      ? 'bg-green-400 animate-pulse shadow-green-400/50 shadow-lg'
                      : 'bg-blue-400 animate-pulse shadow-blue-400/50 shadow-lg'
                    : 'bg-white/40'
                }`} />
                <span className="text-white/90 text-xs font-medium tracking-wide">
                  {sessionLabels[currentSession]}
                </span>
              </div>
              <motion.button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-3 h-3 text-white/60 group-hover:text-white" />
              </motion.button>
            </div>

            <div className="text-center mb-4">
              <motion.div 
                className="text-3xl font-bold text-white mb-1 tracking-tight"
                animate={{ 
                  color: isRunning 
                    ? currentSession === 'focus' 
                      ? '#ef4444' 
                      : currentSession === 'short-break'
                      ? '#22c55e'
                      : '#3b82f6'
                    : '#ffffff'
                }}
                transition={{ duration: 0.3 }}
              >
                {formatTime(timeLeft)}
              </motion.div>
              <div className="w-8 h-0.5 bg-white/20 mx-auto rounded-full" />
            </div>

            <div className="flex items-center justify-center gap-3">
              <motion.button
                onClick={onToggleTimer}
                className={`w-10 h-10 rounded-full backdrop-blur-2xl border shadow-lg flex items-center justify-center transition-all duration-300 group ${
                  currentSession === 'focus' 
                    ? 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30' 
                    : currentSession === 'short-break'
                    ? 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30'
                    : 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30'
                } ${isRunning ? 'animate-pulse shadow-2xl' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRunning ? (
                  <Pause className="w-4 h-4 text-white group-hover:text-white/90" />
                ) : (
                  <Play className="w-4 h-4 text-white group-hover:text-white/90 ml-0.5" />
                )}
              </motion.button>
              
              <motion.button
                onClick={onResetTimer}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center hover:bg-white/20 shadow-lg transition-all duration-200 group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-3.5 h-3.5 text-white/70 group-hover:text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}