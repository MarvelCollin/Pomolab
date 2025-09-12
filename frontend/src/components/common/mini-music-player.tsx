import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Settings, Music, X } from 'lucide-react';
import type { IMusic, IMusicPlayerState } from '../../interfaces/IMusic';

interface MiniMusicPlayerProps {
  showMusicPlayer: boolean;
  setShowMusicPlayer: (show: boolean) => void;
  currentMusic: IMusic | null;
  playerState: IMusicPlayerState;
  autoPlay: boolean;
  onTogglePlayPause: () => void;
  onNextMusic: () => void;
  onPreviousMusic: () => void;
  onSetVolume: (volume: number) => void;
  onToggleMute: () => void;
  onToggleAutoPlay: () => void;
  onSeekTo: (time: number) => void;
}

export default function MiniMusicPlayer({ 
  showMusicPlayer, 
  setShowMusicPlayer,
  currentMusic,
  playerState,
  autoPlay,
  onTogglePlayPause,
  onNextMusic,
  onPreviousMusic,
  onSetVolume,
  onToggleMute,
  onToggleAutoPlay,
  onSeekTo
}: MiniMusicPlayerProps) {
  const [showMusicSettings, setShowMusicSettings] = useState(false);

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
    onSeekTo(newTime);
  };

  const handleVolumeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const volumeBar = event.currentTarget;
    const rect = volumeBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSetVolume(percentage);
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

  if (!currentMusic) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 left-4 z-40"
    >
      <div className="relative group music-settings-container">
        <div className={`bg-black/20 backdrop-blur-3xl border rounded-3xl overflow-hidden shadow-2xl max-w-sm transition-all duration-500 ${
          playerState.isPlaying 
            ? 'border-green-400/30 shadow-green-400/10' 
            : 'border-white/10'
        }`}>
          <div className="px-4 pt-3 pb-3">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onTogglePlayPause}
                className={`w-9 h-9 ${playerState.isPlaying ? 'bg-green-500/20' : 'bg-white/15'} hover:bg-white/25 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 relative`}
              >
                {playerState.isPlaying ? (
                  <Pause className="w-4 h-4 text-white drop-shadow-sm" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5 drop-shadow-sm" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate drop-shadow-sm">{currentMusic.name}</div>
                <div className="text-white/50 text-xs mt-0.5">
                  {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
                </div>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => setShowMusicPlayer(true)}
                  className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
                >
                  <Music className="w-3 h-3 text-white/80" />
                </button>
                
                <button
                  onClick={() => setShowMusicSettings(!showMusicSettings)}
                  className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
                >
                  <Settings className="w-3 h-3 text-white/80" />
                </button>
              </div>
            </div>
            
            <div 
              className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden cursor-pointer"
              onClick={handleProgressClick}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-white/90 to-white/70 rounded-full"
                style={{ width: `${(playerState.currentTime / playerState.duration) * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showMusicSettings && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute bottom-full left-0 mb-3 bg-black/30 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-2xl w-72"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-sm font-medium drop-shadow-sm">Music Settings</span>
                  <button
                    onClick={() => setShowMusicSettings(false)}
                    className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
                  >
                    <X className="w-3 h-3 text-white/80" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-white/80 text-sm">Auto Next Play</span>
                  <button
                    onClick={onToggleAutoPlay}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                      autoPlay ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-white/20'
                    }`}
                  >
                    <motion.div 
                      className="w-4 h-4 bg-white rounded-full shadow-lg absolute top-1"
                      animate={{
                        x: autoPlay ? 20 : 4
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </button>
                </div>

                <div className="space-y-3 p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Volume</span>
                    <span className="text-white/60 text-xs font-mono">
                      {Math.round(playerState.volume * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onToggleMute}
                      className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
                    >
                      {playerState.isMuted ? (
                        <VolumeX className="w-3 h-3 text-white/80" />
                      ) : (
                        <Volume2 className="w-3 h-3 text-white/80" />
                      )}
                    </button>
                    
                    <div 
                      className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden cursor-pointer"
                      onClick={handleVolumeClick}
                    >
                      <motion.div 
                        className="h-full bg-gradient-to-r from-white/90 to-white/70 rounded-full"
                        style={{ width: `${playerState.volume * 100}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={onPreviousMusic}
                    className="flex-1 bg-white/10 hover:bg-white/20 rounded-xl p-3 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                  >
                    <SkipBack className="w-4 h-4 text-white/80" />
                    <span className="text-white/80 text-xs font-medium">Previous</span>
                  </button>
                  
                  <button
                    onClick={onNextMusic}
                    className="flex-1 bg-white/10 hover:bg-white/20 rounded-xl p-3 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                  >
                    <SkipForward className="w-4 h-4 text-white/80" />
                    <span className="text-white/80 text-xs font-medium">Next</span>
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