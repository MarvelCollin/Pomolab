import { AnimatePresence, motion } from 'framer-motion';
import { Timer, CheckSquare, Eye, EyeOff, Image, X, Upload, Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import type { IToolBarProps } from '../../interfaces/IToolBar';

export default function ToolBar({
  showBackgroundSelector,
  setShowBackgroundSelector,
  showMusicPlayer,
  setShowMusicPlayer,
  isMinimalMode,
  setIsMinimalMode,
  showPomodoro,
  setShowPomodoro,
  showTasks,
  setShowTasks,
  backgrounds,
  activeBackground,
  uploadingBackground,
  onBackgroundChange,
  onFileUpload,
  onDeleteBackground,
  musics,
  currentMusic,
  playerState,
  onPlayMusic,
  onDeleteMusic,
  onTogglePlayPause,
  onNextMusic,
  onPreviousMusic,
  onToggleMute
}: IToolBarProps) {
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      >
        <button
          onClick={() => setShowBackgroundSelector(!showBackgroundSelector)}
          className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          <Image className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={() => setShowMusicPlayer(!showMusicPlayer)}
          className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          <Music className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={() => setIsMinimalMode(!isMinimalMode)}
          className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          {isMinimalMode ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
        </button>
        
        {!isMinimalMode && (
          <>
            <button
              onClick={() => setShowPomodoro(!showPomodoro)}
              className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 shadow-lg"
            >
              <Timer className="w-4 h-4 text-white" />
            </button>
            
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 shadow-lg"
            >
              <CheckSquare className="w-4 h-4 text-white" />
            </button>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {showBackgroundSelector && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 right-4 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl max-w-sm w-80"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium text-sm">Change Background</h3>
              <button
                onClick={() => setShowBackgroundSelector(false)}
                className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={onFileUpload}
                  className="hidden"
                  id="background-upload"
                />
                <button
                  onClick={() => document.getElementById('background-upload')?.click()}
                  disabled={uploadingBackground}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingBackground ? (
                    <>
                      <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Background
                    </>
                  )}
                </button>
              </label>
            </div>

            <div className="max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {backgrounds.map((background) => (
                  <div
                    key={background.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      activeBackground?.id === background.id
                        ? 'border-white/60 ring-2 ring-white/30'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => onBackgroundChange(background)}
                  >
                    {background.type === 'video' ? (
                      <video
                        className="w-full h-16 object-cover"
                        muted
                        preload="metadata"
                      >
                        <source src={background.url} type="video/mp4" />
                      </video>
                    ) : (
                      <div
                        className="w-full h-16 bg-cover bg-center"
                        style={{ backgroundImage: `url(${background.url})` }}
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    
                    <button
                      onClick={(e) => onDeleteBackground(background, e)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="text-white text-xs bg-black/50 rounded px-1 py-0.5 truncate">
                        {background.name}
                      </div>
                    </div>
                    
                    {activeBackground?.id === background.id && (
                      <div className="absolute top-1 left-1 w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
              
              {backgrounds.length === 0 && (
                <div className="text-center py-8 text-white/50 text-sm">
                  No backgrounds available
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMusicPlayer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 right-16 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl w-80"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium text-sm">Music Player</h3>
              <button
                onClick={() => setShowMusicPlayer(false)}
                className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>

            {currentMusic && (
              <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">{currentMusic.name}</h4>
                    <div className="flex items-center gap-2 text-white/60 text-xs mt-1">
                      <span>{formatTime(playerState.currentTime)}</span>
                      <span>/</span>
                      <span>{formatTime(playerState.duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  <button
                    onClick={onPreviousMusic}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <SkipBack className="w-4 h-4 text-white" />
                  </button>
                  
                  <button
                    onClick={onTogglePlayPause}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    {playerState.isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    )}
                  </button>
                  
                  <button
                    onClick={onNextMusic}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <SkipForward className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onToggleMute}
                    className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    {playerState.isMuted ? (
                      <VolumeX className="w-3 h-3 text-white" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-white" />
                    )}
                  </button>
                  
                  <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-white/60 transition-all duration-200"
                      style={{ width: `${playerState.volume * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {musics.map((music) => (
                  <div
                    key={music.id}
                    className={`relative group cursor-pointer rounded-lg p-3 border transition-all ${
                      currentMusic?.id === music.id
                        ? 'border-white/60 bg-white/10'
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                    onClick={() => onPlayMusic(music)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        {currentMusic?.id === music.id && playerState.isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{music.name}</div>
                      </div>
                      
                      <button
                        onClick={(e) => onDeleteMusic(music, e)}
                        className="w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    
                    {currentMusic?.id === music.id && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
              
              {musics.length === 0 && (
                <div className="text-center py-8 text-white/50 text-sm">
                  No music available
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
