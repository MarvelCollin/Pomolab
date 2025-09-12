import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Music, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Minimize2,
  Maximize2,
  Timer,
  CheckSquare,
  Menu,
  Eye,
  EyeOff
} from 'lucide-react';
import type { IBackground } from '../../interfaces/IBackground';
import type { IMusic } from '../../interfaces/IMusic';

interface ToolBarProps {
  showBackgroundSelector: boolean;
  setShowBackgroundSelector: (show: boolean) => void;
  showMusicPlayer: boolean;
  setShowMusicPlayer: (show: boolean) => void;
  isMinimalMode: boolean;
  setIsMinimalMode: (minimal: boolean) => void;
  pomodoroMinimized: boolean;
  setPomodoroMinimized: (minimized: boolean) => void;
  tasksMinimized: boolean;
  setTasksMinimized: (minimized: boolean) => void;
  backgrounds: IBackground[];
  activeBackground: IBackground | null;
  uploadingBackground: boolean;
  onBackgroundChange: (background: IBackground) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteBackground: (background: IBackground, event: React.MouseEvent) => void;
  musics: IMusic[];
  currentMusic: IMusic | null;
  playerState: any;
  onPlayMusic: (music: IMusic) => void;
  onDeleteMusic: (music: IMusic, event: React.MouseEvent) => void;
  onTogglePlayPause: () => void;
  onNextMusic: () => void;
  onPreviousMusic: () => void;
  onToggleMute: () => void;
  loadRemainingBackgrounds: () => void;
  loadRemainingMusics: () => void;
}

export default function ToolBar({ 
  showBackgroundSelector, 
  setShowBackgroundSelector,
  showMusicPlayer,
  setShowMusicPlayer,
  isMinimalMode,
  setIsMinimalMode,
  pomodoroMinimized,
  setPomodoroMinimized,
  tasksMinimized,
  setTasksMinimized,
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
  onToggleMute,
  loadRemainingBackgrounds,
  loadRemainingMusics
}: ToolBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMainMenu, setShowMainMenu] = useState(false);

  useEffect(() => {
    const controlToolbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlToolbar);
      return () => window.removeEventListener('scroll', controlToolbar);
    }
  }, [lastScrollY]);

  return (
    <motion.div
      className="fixed top-4 right-4 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: isVisible ? 1 : 0.8, 
        y: isVisible ? 0 : -10,
        scale: isVisible ? 1 : 0.95
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex flex-col items-end gap-3">
        <motion.div 
          className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-3 shadow-2xl"
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            onClick={() => setShowMainMenu(!showMainMenu)}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: showMainMenu ? 45 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Menu className="w-6 h-6 text-white group-hover:text-white/90" />
            </motion.div>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showMainMenu && (
            <motion.div
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-3 shadow-2xl min-w-[200px]"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="space-y-1">
                <motion.button
                  onClick={() => {
                    setPomodoroMinimized(!pomodoroMinimized);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Timer className="w-5 h-5 text-white/90" />
                  <span className="text-white text-sm font-medium">
                    {pomodoroMinimized ? "Expand Timer" : "Minimize Timer"}
                  </span>
                  <motion.div
                    className="ml-auto"
                    animate={{ rotate: pomodoroMinimized ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    {pomodoroMinimized ? (
                      <Maximize2 className="w-4 h-4 text-white/60" />
                    ) : (
                      <Minimize2 className="w-4 h-4 text-white/60" />
                    )}
                  </motion.div>
                </motion.button>

                <motion.button
                  onClick={() => {
                    setTasksMinimized(!tasksMinimized);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckSquare className="w-5 h-5 text-white/90" />
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
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ImageIcon className="w-5 h-5 text-white/90" />
                  <span className="text-white text-sm font-medium">Backgrounds</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    setShowMusicPlayer(!showMusicPlayer);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Music className="w-5 h-5 text-white/90" />
                  <span className="text-white text-sm font-medium">Music Player</span>
                </motion.button>

                <div className="h-px bg-white/20 my-2" />

                <motion.button
                  onClick={() => {
                    setIsMinimalMode(!isMinimalMode);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isMinimalMode ? (
                    <Eye className="w-5 h-5 text-white/90" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-white/90" />
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
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={onFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingBackground}
                  />
                  <motion.div 
                    className="border-2 border-dashed border-white/30 rounded-xl p-4 text-center hover:border-white/50 transition-colors"
                    whileHover={{ scale: 1.02, borderColor: "rgba(255, 255, 255, 0.6)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      animate={{ y: uploadingBackground ? [0, -2, 0] : 0 }}
                      transition={{ duration: 1, repeat: uploadingBackground ? Infinity : 0 }}
                    >
                      <Upload className="w-6 h-6 text-white/70 mx-auto mb-2" />
                    </motion.div>
                    <p className="text-white/70 text-xs">
                      {uploadingBackground ? 'Uploading...' : 'Upload Background'}
                    </p>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {backgrounds.slice(0, 6).map((background, index) => (
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
                      <motion.button
                        onClick={(e) => onDeleteBackground(background, e)}
                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                {backgrounds.length > 6 && (
                  <motion.button
                    onClick={loadRemainingBackgrounds}
                    className="w-full p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Load More Backgrounds
                  </motion.button>
                )}
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
                {musics.slice(0, 8).map((music, index) => (
                  <motion.div
                    key={music.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentMusic?.id === music.id
                        ? 'bg-white/30 border border-white/40'
                        : 'bg-white/10 hover:bg-white/20 border border-white/10'
                    }`}
                    onClick={() => onPlayMusic(music)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{music.name}</p>
                        <p className="text-white/60 text-xs truncate">{music.artist || 'Unknown Artist'}</p>
                      </div>
                      <motion.button
                        onClick={(e) => onDeleteMusic(music, e)}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors ml-2"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-3 h-3 text-white/70" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {musics.length > 8 && (
                <motion.button
                  onClick={loadRemainingMusics}
                  className="w-full p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors mt-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Load More Music
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
