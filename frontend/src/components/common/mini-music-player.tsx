import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Settings, Music, X } from 'lucide-react';
import { useMusic } from '../../hooks/use-music';

interface MiniMusicPlayerProps {
  showMusicPlayer: boolean;
  setShowMusicPlayer: (show: boolean) => void;
}

export default function MiniMusicPlayer({ showMusicPlayer, setShowMusicPlayer }: MiniMusicPlayerProps) {
  const [showMusicSettings, setShowMusicSettings] = useState(false);

  const {
    currentMusic,
    playerState,
    autoPlay,
    togglePlayPause,
    nextMusic,
    previousMusic,
    setVolume,
    toggleMute,
    toggleAutoPlay,
    seekTo
  } = useMusic();

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * playerState.duration;
    seekTo(newTime);
  };

  const handleVolumeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const volumeBar = event.currentTarget;
    const rect = volumeBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(percentage);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMusicSettings) {
        const target = event.target as Element;
        if (!target.closest('.music-settings-container')) {
          setShowMusicSettings(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMusicSettings]);

  if (!currentMusic || showMusicPlayer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 left-4 z-40"
    >
      <div className="relative group music-settings-container">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-3 shadow-xl max-w-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              {playerState.isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{currentMusic.name}</div>
              <div className="text-white/60 text-xs flex items-center gap-2 mt-1">
                <span>{formatTime(playerState.currentTime)}</span>
                <div 
                  className="flex-1 bg-white/20 rounded-full h-1 overflow-hidden cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-white/80 transition-all duration-200"
                    style={{ width: `${(playerState.currentTime / playerState.duration) * 100}%` }}
                  />
                </div>
                <span>{formatTime(playerState.duration)}</span>
              </div>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => setShowMusicPlayer(true)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <Music className="w-3 h-3 text-white" />
              </button>
              
              <button
                onClick={() => setShowMusicSettings(!showMusicSettings)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <Settings className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showMusicSettings && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-0 mb-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-3 shadow-2xl w-64"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">Music Settings</span>
                  <button
                    onClick={() => setShowMusicSettings(false)}
                    className="w-5 h-5 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Auto Play</span>
                  <button
                    onClick={toggleAutoPlay}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      autoPlay ? 'bg-green-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      autoPlay ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-white/80 text-sm">Volume</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                    >
                      {playerState.isMuted ? (
                        <VolumeX className="w-3 h-3 text-white" />
                      ) : (
                        <Volume2 className="w-3 h-3 text-white" />
                      )}
                    </button>
                    
                    <div 
                      className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden cursor-pointer"
                      onClick={handleVolumeClick}
                    >
                      <div 
                        className="h-full bg-white/80 transition-all duration-200"
                        style={{ width: `${playerState.volume * 100}%` }}
                      />
                    </div>
                    
                    <span className="text-white/60 text-xs min-w-[2.5rem]">
                      {Math.round(playerState.volume * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={previousMusic}
                    className="flex-1 bg-white/10 hover:bg-white/20 rounded-lg p-2 flex items-center justify-center gap-2 transition-colors"
                  >
                    <SkipBack className="w-3 h-3 text-white" />
                    <span className="text-white text-xs">Previous</span>
                  </button>
                  
                  <button
                    onClick={nextMusic}
                    className="flex-1 bg-white/10 hover:bg-white/20 rounded-lg p-2 flex items-center justify-center gap-2 transition-colors"
                  >
                    <SkipForward className="w-3 h-3 text-white" />
                    <span className="text-white text-xs">Next</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}