import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Image as ImageIcon, 
  X, 
  Play, 
  Volume2, 
  VolumeX,
  Minimize2,
  Maximize2,
  Timer,
  CheckSquare,
  Menu,
  Eye,
  EyeOff,
  Waves,
  Square,
  User,
  LogOut
} from 'lucide-react';
import type { IBackground } from '../../interfaces/IBackground';
import type { IMusic } from '../../interfaces/IMusic';
import type { IAudioEffect } from '../../interfaces/IAudioEffect';
import type { IUser } from '../../interfaces/IUser';

interface ToolBarProps {
  showBackgroundSelector: boolean;
  setShowBackgroundSelector: (show: boolean) => void;
  showMusicPlayer: boolean;
  setShowMusicPlayer: (show: boolean) => void;
  showAudioEffects: boolean;
  setShowAudioEffects: (show: boolean) => void;
  isMinimalMode: boolean;
  setIsMinimalMode: (minimal: boolean) => void;
  pomodoroMinimized: boolean;
  setPomodoroMinimized: (minimized: boolean) => void;
  tasksMinimized: boolean;
  setTasksMinimized: (minimized: boolean) => void;
  backgrounds: IBackground[];
  activeBackground: IBackground | null;
  onBackgroundChange: (background: IBackground) => void;
  musics: IMusic[];
  currentMusic: IMusic | null;
  onPlayMusic: (music: IMusic) => void;
  audioEffects: IAudioEffect[];
  onPlayEffect: (effect: IAudioEffect) => void;
  onStopEffect: (effectId: string) => void;
  onSetEffectVolume: (effectId: string, volume: number) => void;
  onToggleEffectMute: (effectId: string) => void;
  onStopAllEffects: () => void;
  getMasterVolume: () => number;
  onSetMasterVolume: (volume: number) => void;
  onToggleMasterMute: () => void;
  currentUser: IUser | null;
  onShowLogin: () => void;
  onLogout: () => void;
}

function ToolBar({ 
  showBackgroundSelector, 
  setShowBackgroundSelector,
  showMusicPlayer,
  setShowMusicPlayer,
  showAudioEffects,
  setShowAudioEffects,
  isMinimalMode,
  setIsMinimalMode,
  pomodoroMinimized,
  setPomodoroMinimized,
  tasksMinimized,
  setTasksMinimized,
  backgrounds,
  activeBackground,
  onBackgroundChange,
  musics,
  currentMusic,
  onPlayMusic,
  audioEffects,
  onPlayEffect,
  onStopEffect,
  onSetEffectVolume,
  onToggleEffectMute,
  onStopAllEffects,
  getMasterVolume,
  onSetMasterVolume,
  onToggleMasterMute,
  currentUser,
  onShowLogin,
  onLogout
}: ToolBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMainMenu, setShowMainMenu] = useState(false);

  useEffect(() => {
    let ticking = false;
    const controlToolbar = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (typeof window !== 'undefined') {
            const scrollY = window.scrollY;
            if (scrollY > lastScrollY && scrollY > 100) {
              setIsVisible(false);
            } else {
              setIsVisible(true);
            }
            setLastScrollY(scrollY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlToolbar, { passive: true });
      return () => window.removeEventListener('scroll', controlToolbar);
    }
  }, [lastScrollY]);

  return (
    <motion.div
      className="fixed top-4 right-4 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: isVisible ? 1 : 0.9, 
        y: isVisible ? 0 : -5
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex flex-col items-end gap-3">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-2 shadow-2xl hover:bg-white/15 transition-colors duration-200">
          <button
            onClick={() => setShowMainMenu(!showMainMenu)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 group relative"
          >
            <motion.div
              animate={{ rotate: showMainMenu ? 45 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Menu className="w-5 h-5 text-white group-hover:text-white/90" />
            </motion.div>
          </button>
        </div>

        <AnimatePresence>
          {showMainMenu && (
            <motion.div
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-2.5 shadow-2xl min-w-[180px]"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="space-y-0.5">
                {/* User Authentication Section */}
                {currentUser ? (
                  <motion.div
                    className="bg-white/10 backdrop-blur-2xl rounded-lg p-2 border border-white/10 mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        {currentUser.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white/90" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {currentUser.username}
                        </p>
                        <p className="text-white/60 text-xs truncate">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => {
                        onLogout();
                        setShowMainMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut className="w-4 h-4 text-white/90" />
                      <span className="text-white text-sm font-medium">Sign Out</span>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => {
                      onShowLogin();
                      setShowMainMenu(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group mb-2 bg-white/10 backdrop-blur-2xl border border-white/10"
                    whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <User className="w-4 h-4 text-white/90" />
                    <span className="text-white text-sm font-medium">Sign In</span>
                  </motion.button>
                )}

                <button
                  onClick={() => {
                    setPomodoroMinimized(!pomodoroMinimized);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <Timer className="w-4 h-4 text-white/90" />
                  <span className="text-white text-sm font-medium">
                    {pomodoroMinimized ? "Expand Timer" : "Minimize Timer"}
                  </span>
                  <div className="ml-auto">
                    {pomodoroMinimized ? (
                      <Maximize2 className="w-4 h-4 text-white/60" />
                    ) : (
                      <Minimize2 className="w-4 h-4 text-white/60" />
                    )}
                  </div>
                </button>

                <motion.button
                  onClick={() => {
                    setTasksMinimized(!tasksMinimized);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckSquare className="w-4 h-4 text-white/90" />
                  <span className="text-white text-sm font-medium">
                    {tasksMinimized ? "Expand Tasks" : "Minimize Tasks"}
                  </span>
                  <motion.div
                    className="ml-auto"
                    animate={{ rotate: tasksMinimized ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tasksMinimized ? (
                      <Maximize2 className="w-4 h-4 text-white/60" />
                    ) : (
                      <Minimize2 className="w-4 h-4 text-white/60" />
                    )}
                  </motion.div>
                </motion.button>

                <div className="h-px bg-white/20 my-2" />

                <motion.button
                  onClick={() => {
                    setShowBackgroundSelector(!showBackgroundSelector);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ImageIcon className="w-4 h-4 text-white/90" />
                  <span className="text-white text-sm font-medium">Backgrounds</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    setShowMusicPlayer(!showMusicPlayer);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <Music className="w-4 h-4 text-white/90" />
                    {currentMusic && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <span className="text-white text-sm font-medium">Music Library</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    setShowAudioEffects(!showAudioEffects);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Waves className="w-4 h-4 text-white/90" />
                  <span className="text-white text-sm font-medium">Audio Effects</span>
                </motion.button>

                <div className="h-px bg-white/20 my-2" />

                <motion.button
                  onClick={() => {
                    setIsMinimalMode(!isMinimalMode);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isMinimalMode ? (
                    <Eye className="w-4 h-4 text-white/90" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-white/90" />
                  )}
                  <span className="text-white text-sm font-medium">
                    {isMinimalMode ? "Show Interface" : "Minimal Mode"}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showBackgroundSelector && (
            <motion.div
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl max-w-sm"
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between mb-4">
                <motion.h3 
                  className="text-white font-medium text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Backgrounds
                </motion.h3>
                <motion.button
                  onClick={() => setShowBackgroundSelector(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >


                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {backgrounds.map((background, index) => (
                    <motion.div
                      key={background.id}
                      className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                        activeBackground?.id === background.id
                          ? 'border-white/50 ring-2 ring-white/30'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => onBackgroundChange(background)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {background.type === 'video' ? (
                        <video
                          src={background.url}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay={false}
                        />
                      ) : (
                        <img
                          src={background.url}
                          alt={background.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20" />

                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMusicPlayer && (
            <motion.div
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl max-w-sm"
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between mb-4">
                <motion.h3 
                  className="text-white font-medium text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Music Library
                </motion.h3>
                <motion.button
                  onClick={() => setShowMusicPlayer(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <motion.div 
                className="space-y-2 max-h-48 overflow-y-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {musics.map((music, index) => (
                  <motion.div
                    key={music.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentMusic?.id === music.id
                        ? 'bg-white/30 border border-white/40'
                        : 'bg-white/10 hover:bg-white/20 border border-white/10'
                    }`}
                    onClick={() => {
                      onPlayMusic(music);
                      setShowMusicPlayer(false);
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium truncate">{music.name}</p>
                          {currentMusic?.id === music.id && (
                            <motion.div
                              className="flex items-center gap-1"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                            </motion.div>
                          )}
                        </div>
                        {currentMusic?.id === music.id && (
                          <p className="text-green-400 text-xs font-medium">Now Playing</p>
                        )}
                      </div>

                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAudioEffects && (
            <motion.div
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl max-w-sm"
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between mb-4">
                <motion.h3 
                  className="text-white font-medium text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Audio Effects
                </motion.h3>
                <motion.button
                  onClick={() => setShowAudioEffects(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <motion.div 
                className="space-y-3 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="bg-white/10 backdrop-blur-2xl rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-xs font-medium">Master Controls</span>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={onToggleMasterMute}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {audioEffects.some(e => e.isActive && !e.isMuted) ? (
                          <Volume2 className="w-3 h-3 text-white/90" />
                        ) : (
                          <VolumeX className="w-3 h-3 text-white/60" />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={onStopAllEffects}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Square className="w-3 h-3 text-white/70" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-3 h-3 text-white/60" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={getMasterVolume()}
                      onChange={(e) => onSetMasterVolume(parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.6) ${getMasterVolume() * 100}%, rgba(255,255,255,0.2) ${getMasterVolume() * 100}%, rgba(255,255,255,0.2) 100%)`
                      }}
                    />
                    <Volume2 className="w-3 h-3 text-white/60" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="space-y-2 max-h-60 overflow-y-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {audioEffects.map((effect, index) => (
                  <motion.div
                    key={effect.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      effect.isActive
                        ? 'bg-white/20 border-white/30'
                        : 'bg-white/10 hover:bg-white/15 border-white/10'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{effect.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.button
                          onClick={() => effect.isActive ? onStopEffect(effect.id) : onPlayEffect(effect)}
                          className={`p-1 rounded-full transition-colors ${
                            effect.isActive 
                              ? 'bg-white/20 hover:bg-white/30' 
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {effect.isActive ? (
                            <Square className="w-3 h-3 text-white" />
                          ) : (
                            <Play className="w-3 h-3 text-white ml-0.5" />
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => onToggleEffectMute(effect.id)}
                          className="p-1 hover:bg-white/20 rounded-full transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {effect.isMuted ? (
                            <VolumeX className="w-3 h-3 text-white/60" />
                          ) : (
                            <Volume2 className="w-3 h-3 text-white/90" />
                          )}
                        </motion.button>

                      </div>
                    </div>
                    {effect.isActive && (
                      <motion.div 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <VolumeX className="w-3 h-3 text-white/60" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={effect.volume}
                          onChange={(e) => onSetEffectVolume(effect.id, parseFloat(e.target.value))}
                          className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.6) ${effect.volume * 100}%, rgba(255,255,255,0.2) ${effect.volume * 100}%, rgba(255,255,255,0.2) 100%)`
                          }}
                        />
                        <Volume2 className="w-3 h-3 text-white/60" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                {audioEffects.length === 0 && (
                  <motion.div 
                    className="text-center py-8 text-white/60"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className="bg-white/10 backdrop-blur-2xl rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center border border-white/10">
                      <Waves className="w-6 h-6 opacity-60" />
                    </div>
                    <p className="text-sm font-medium mb-1">No audio effects</p>
                    <p className="text-xs opacity-80">Upload some effects to enhance your focus</p>
                  </motion.div>
                )}
              </motion.div>


            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default memo(ToolBar);
