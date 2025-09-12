import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PomodoroTimer from '../components/pomodoro/pomodoro-timer';
import MiniPomodoroTimer from '../components/common/mini-pomodoro-timer';
import TaskList from '../components/pomodoro/task-list';
import MiniMusicPlayer from '../components/common/mini-music-player';
import ToolBar from '../components/common/tool-bar';
import AudioVisual from '../components/pomodoro/audio-visual';
import type { ITask } from '../interfaces/ITask';
import { dummyTasks } from '../data/dummy-data';
import { useBackground } from '../hooks/use-background';
import { useMusic } from '../hooks/use-music';
import { useAudioEffect } from '../hooks/use-audio-effect';
import type { IBackground } from '../interfaces/IBackground';
import type { IMusic } from '../interfaces/IMusic';
import type { IAudioEffect } from '../interfaces/IAudioEffect';
import '../app.css';

export default function Home() {
  const [tasks, setTasks] = useState<ITask[]>(dummyTasks);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(tasks.find(t => t.status === 'in_progress') || null);
  const [pomodoroMinimized, setPomodoroMinimized] = useState(false);
  const [tasksMinimized, setTasksMinimized] = useState(false);
  const [isMinimalMode, setIsMinimalMode] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [backgroundVisible, setBackgroundVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [showAudioEffects, setShowAudioEffects] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const [currentSession, setCurrentSession] = useState<'focus' | 'short-break' | 'long-break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customDurations, setCustomDurations] = useState({
    focus: 25,
    'short-break': 5,
    'long-break': 15
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sessionDurations = {
    focus: customDurations.focus * 60,
    'short-break': customDurations['short-break'] * 60,
    'long-break': customDurations['long-break'] * 60
  };

  const sessionLabels = {
    focus: 'Focus Time',
    'short-break': 'Short Break',
    'long-break': 'Long Break'
  };
  
  const { 
    backgrounds, 
    activeBackground, 
    loading: backgroundsLoading, 
    changeBackground,
    uploadBackground,
    deleteBackground,
    loadRemainingBackgrounds
  } = useBackground();

  const {
    musics,
    currentMusic,
    playerState,
    loading: musicLoading,
    autoPlay,
    playMusic,
    deleteMusic,
    togglePlayPause,
    nextMusic,
    previousMusic,
    toggleMute,
    toggleAutoPlay,
    seekTo,
    setVolume,
    loadRemainingMusics
  } = useMusic();

  const {
    audioEffects,
    loading: audioEffectsLoading,
    playEffect,
    pauseEffect,
    stopEffect,
    setEffectVolume,
    setEffectMuted,
    toggleEffectMute,
    pauseAllEffects,
    stopAllEffects,
    getMasterVolume,
    setMasterVolume,
    toggleMasterMute,
    uploadAudioEffect,
    deleteAudioEffect
  } = useAudioEffect();



  useEffect(() => {
    if (!backgroundsLoading && !musicLoading && !initialLoadComplete) {
      setBackgroundVisible(true);
      setBackgroundLoaded(true);
      setShowContent(true);
      setInitialLoadComplete(true);
      
      loadRemainingBackgrounds();
      loadRemainingMusics();
    }
  }, [backgroundsLoading, musicLoading, initialLoadComplete, loadRemainingBackgrounds, loadRemainingMusics]);



  const handleTaskSelect = useCallback((task: ITask) => {
    setSelectedTask(task);
  }, []);

  const handleTaskComplete = useCallback((taskId: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed' as const, completed_pomodoros: task.estimated_pomodoros }
        : task
    ));
  }, []);

  const handleTaskAdd = useCallback((newTask: Omit<ITask, 'id' | 'created_at' | 'updated_at'>) => {
    const task: ITask = {
      ...newTask,
      id: Math.max(...tasks.map(t => t.id)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTasks(prev => [task, ...prev]);
  }, [tasks]);

  const handleTaskDelete = useCallback((taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  }, [selectedTask]);

  const handleTaskEdit = useCallback((taskId: number, updates: Partial<ITask>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updated_at: new Date().toISOString() }
        : task
    ));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
    }
  }, [selectedTask]);

  const handleSessionComplete = useCallback((sessionType: 'focus' | 'short-break' | 'long-break') => {
    if (sessionType === 'focus' && selectedTask) {
      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id 
          ? { 
              ...task, 
              completed_pomodoros: Math.min(task.completed_pomodoros + 1, task.estimated_pomodoros),
              status: task.completed_pomodoros + 1 >= task.estimated_pomodoros ? 'completed' : 'in_progress'
            }
          : task
      ));
    }
  }, [selectedTask]);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    handleSessionComplete(currentSession);
    
    if (currentSession === 'focus') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      
      if (newCount % 4 === 0) {
        setCurrentSession('long-break');
        setTimeLeft(sessionDurations['long-break']);
      } else {
        setCurrentSession('short-break');
        setTimeLeft(sessionDurations['short-break']);
      }
    } else {
      setCurrentSession('focus');
      setTimeLeft(sessionDurations.focus);
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(sessionDurations[currentSession]);
  };

  const closeMiniTimer = () => {
    setPomodoroMinimized(false);
  };

  const handleBackgroundLoad = () => {
    setBackgroundLoaded(true);
    setTimeout(() => {
      setBackgroundVisible(true);
    }, 300);
    setTimeout(() => {
      setShowContent(true);
    }, 800);
  };

  const handleBackgroundChange = (background: IBackground) => {
    changeBackground(background);
    setShowBackgroundSelector(false);
    setBackgroundLoaded(false);
    setBackgroundVisible(false);
    setShowContent(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingBackground(true);
    const result = await uploadBackground(file);
    if (result) {
      handleBackgroundChange(result);
    }
    setUploadingBackground(false);
    event.target.value = '';
  };

  const handleDeleteBackground = async (background: IBackground, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteBackground(background);
  };

  const handleDeleteMusic = async (music: IMusic, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteMusic(music);
  };

  const handleDeleteAudioEffect = async (effect: IAudioEffect, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteAudioEffect(effect);
  };

  const renderBackground = () => {
    if (!activeBackground && !backgroundsLoading) {
      return (
        <motion.div 
          className="absolute inset-0"
          style={{ background: 'var(--gradient-soft)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: backgroundVisible ? 1 : 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (!backgroundLoaded) setBackgroundLoaded(true);
          }}
        >
          <motion.div 
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,243,213,0.1),transparent_50%)]"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: backgroundVisible ? 1 : 0 }}
            transition={{ duration: 2.0, ease: "easeOut" }}
          />
        </motion.div>
      );
    }

    if (!activeBackground) return null;

    if (activeBackground.type === 'video') {
      return (
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          key={activeBackground.id}
          onLoadedData={handleBackgroundLoad}
          onCanPlayThrough={handleBackgroundLoad}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: backgroundVisible ? 1 : 0, scale: 1 }}
          transition={{ 
            opacity: { duration: 1.5, ease: "easeInOut" },
            scale: { duration: 2.0, ease: "easeOut" }
          }}
        >
          <source src={activeBackground.url} type="video/mp4" />
          Your browser does not support the video tag.
        </motion.video>
      );
    }

    return (
      <motion.div
        className="w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${activeBackground.url})`
        }}
        onLoad={handleBackgroundLoad}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: backgroundVisible ? 1 : 0, scale: 1 }}
        transition={{ 
          opacity: { duration: 1.5, ease: "easeInOut" },
          scale: { duration: 2.0, ease: "easeOut" }
        }}
      />
    );
  };

  const isLoading = backgroundsLoading || musicLoading || !backgroundLoaded || !showContent || !initialLoadComplete;

  return (
    <div className="home-page min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        {renderBackground()}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: backgroundVisible ? 1 : 0 }}
          transition={{ duration: 1.0, delay: 0.8, ease: "easeInOut" }}
        />
      </div>

      <AudioVisual 
        currentMusic={currentMusic}
        playerState={playerState}
      />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'var(--gradient-soft)' }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,243,213,0.2),transparent_50%)]" />
            
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mb-8"
              >
                <h1 className="text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">
                    POMOLAB
                  </span>
                </h1>
                <p className="text-amber-800/80 text-lg">
                  Preparing your focus space...
                </p>
              </motion.div>

              <div className="flex items-center justify-center space-x-2 mb-8">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-3 h-3 bg-amber-700/40 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1.0, delay: 0.8 }}
                  className="relative"
                >
                  <div className="w-64 h-1 bg-amber-800/20 rounded-full overflow-hidden mx-auto">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-amber-800/60 text-sm mt-4">
                    Loading your productive environment
                  </p>
                </motion.div>              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-amber-700/30 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContent && (
          <>
            <ToolBar
              showBackgroundSelector={showBackgroundSelector}
              setShowBackgroundSelector={setShowBackgroundSelector}
              showMusicPlayer={showMusicPlayer}
              setShowMusicPlayer={setShowMusicPlayer}
              showAudioEffects={showAudioEffects}
              setShowAudioEffects={setShowAudioEffects}
              isMinimalMode={isMinimalMode}
              setIsMinimalMode={setIsMinimalMode}
              pomodoroMinimized={pomodoroMinimized}
              setPomodoroMinimized={setPomodoroMinimized}
              tasksMinimized={tasksMinimized}
              setTasksMinimized={setTasksMinimized}
              backgrounds={backgrounds}
              activeBackground={activeBackground}
              uploadingBackground={uploadingBackground}
              onBackgroundChange={handleBackgroundChange}
              onFileUpload={handleFileUpload}
              onDeleteBackground={handleDeleteBackground}
              musics={musics}
              currentMusic={currentMusic}
              playerState={playerState}
              onPlayMusic={playMusic}
              onDeleteMusic={handleDeleteMusic}
              onTogglePlayPause={togglePlayPause}
              onNextMusic={nextMusic}
              onPreviousMusic={previousMusic}
              onToggleMute={toggleMute}
              loadRemainingBackgrounds={loadRemainingBackgrounds}
              loadRemainingMusics={loadRemainingMusics}
              audioEffects={audioEffects}
              onPlayEffect={playEffect}
              onPauseEffect={pauseEffect}
              onStopEffect={stopEffect}
              onSetEffectVolume={setEffectVolume}
              onSetEffectMuted={setEffectMuted}
              onToggleEffectMute={toggleEffectMute}
              onPauseAllEffects={pauseAllEffects}
              onStopAllEffects={stopAllEffects}
              getMasterVolume={getMasterVolume}
              onSetMasterVolume={setMasterVolume}
              onToggleMasterMute={toggleMasterMute}
              onUploadAudioEffect={uploadAudioEffect}
              onDeleteAudioEffect={handleDeleteAudioEffect}
            />

            <MiniMusicPlayer 
              showMusicPlayer={showMusicPlayer} 
              setShowMusicPlayer={setShowMusicPlayer}
              currentMusic={currentMusic}
              playerState={playerState}
              autoPlay={autoPlay}
              onTogglePlayPause={togglePlayPause}
              onSeekTo={seekTo}
              onSetVolume={setVolume}
              onToggleMute={toggleMute}
              onToggleAutoPlay={toggleAutoPlay}
              onPreviousMusic={previousMusic}
              onNextMusic={nextMusic}
            />

            {!isMinimalMode && (
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative z-10 pt-20 pb-8 min-h-screen flex items-center"
              >
                <div className="max-w-7xl mx-auto px-4 w-full">
                  <div className="grid lg:grid-cols-12 gap-6 items-start">
                    
                    <div className={`${(tasksMinimized && !pomodoroMinimized) ? 'lg:col-span-8' : (pomodoroMinimized && !tasksMinimized) ? 'lg:col-span-6' : (pomodoroMinimized && tasksMinimized) ? 'lg:col-span-10' : 'lg:col-span-7'} transition-all duration-500 ease-in-out`}>
                      <div className={`rounded-3xl transition-all duration-500 ease-in-out ${pomodoroMinimized ? 'p-3' : 'p-6'} h-full`}>
                        <div 
                          className={`text-center transition-all duration-500 ease-in-out ${
                            pomodoroMinimized ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto mb-6'
                          }`}
                        >
                          <h1 className="text-4xl font-bold leading-tight mb-2">
                            <span className="text-white drop-shadow-lg">POMOLAB</span>
                          </h1>
                        </div>
                        {!pomodoroMinimized && (
                          <PomodoroTimer 
                            onSessionComplete={handleSessionComplete} 
                            isMinimized={false}
                            currentSession={currentSession}
                            timeLeft={timeLeft}
                            isRunning={isTimerRunning}
                            sessionCount={sessionCount}
                            soundEnabled={soundEnabled}
                            customDurations={customDurations}
                            sessionDurations={sessionDurations}
                            sessionLabels={sessionLabels}
                            onToggleTimer={toggleTimer}
                            onResetTimer={resetTimer}
                            onSetCurrentSession={setCurrentSession}
                            onSetTimeLeft={setTimeLeft}
                            onSetSoundEnabled={setSoundEnabled}
                            onSetCustomDurations={setCustomDurations}
                            onSetSessionCount={setSessionCount}
                          />
                        )}
                            {selectedTask && (
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className={`bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-lg transition-all duration-500 ease-in-out ${
                                  pomodoroMinimized ? 'mt-3 p-2' : 'mt-6 p-4'
                                }`}
                              ><h3 className={`text-white/90 font-medium mb-1 transition-all duration-500 ${pomodoroMinimized ? 'text-xs' : 'text-sm'}`}>Current Task</h3>
                                <p className={`text-white font-medium drop-shadow transition-all duration-500 ${pomodoroMinimized ? 'text-sm' : 'text-base'}`}>{selectedTask.title}</p>
                                {selectedTask.description && !pomodoroMinimized && (
                                  <p className="text-white/70 text-xs mt-1">{selectedTask.description}</p>
                                )}
                                <div className={`flex items-center gap-3 text-white/60 text-xs transition-all duration-500 ${pomodoroMinimized ? 'mt-1' : 'mt-2'}`}>
                                  <span>🍅 {selectedTask.completed_pomodoros}/{selectedTask.estimated_pomodoros}</span>
                                  {!pomodoroMinimized && <span className="capitalize">{selectedTask.status.replace('_', ' ')}</span>}
                                </div>
                              </motion.div>
                            )}
                        <div 
                          className={`text-center transition-all duration-500 ease-in-out ${
                            pomodoroMinimized ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-6'
                          }`}
                        >
                          <Link
                            to="/learn-together"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/20 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                          >
                            Join Learning Session
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className={`${(pomodoroMinimized && !tasksMinimized) ? 'lg:col-span-6' : (tasksMinimized && !pomodoroMinimized) ? 'lg:col-span-4' : (pomodoroMinimized && tasksMinimized) ? 'lg:col-span-2' : 'lg:col-span-5'} transition-all duration-500 ease-in-out flex flex-col`}>
                      <div className={`rounded-3xl transition-all duration-500 ease-in-out ${tasksMinimized ? 'p-2 max-h-[120px]' : 'p-4 flex-1 min-h-0'} ${tasksMinimized ? 'overflow-hidden' : 'flex flex-col'}`}>
                        <TaskList
                          tasks={tasks}
                          onTaskSelect={handleTaskSelect}
                          onTaskComplete={handleTaskComplete}
                          onTaskAdd={handleTaskAdd}
                          onTaskDelete={handleTaskDelete}
                          onTaskEdit={handleTaskEdit}
                          selectedTaskId={selectedTask?.id}
                          isMinimized={tasksMinimized}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-10 pb-12"
            >
              <div className="max-w-6xl mx-auto px-4">
              </div>
            </motion.section>

            {pomodoroMinimized && (
              <MiniPomodoroTimer
                currentSession={currentSession}
                timeLeft={timeLeft}
                isRunning={isTimerRunning}
                onToggleTimer={toggleTimer}
                onResetTimer={resetTimer}
                onClose={closeMiniTimer}
                sessionLabels={sessionLabels}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}