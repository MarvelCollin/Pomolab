import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Zap, Target, Timer, CheckSquare, Eye, EyeOff, Image, X } from 'lucide-react';
import PomodoroTimer from '../components/pomodoro/pomodoro-timer';
import TaskList from '../components/pomodoro/task-list';
import type { ITask } from '../interfaces/ITask';
import { dummyTasks } from '../data/dummy-data';
import { useBackground } from '../hooks/use-background';
import type { IBackground } from '../interfaces/IBackground';
import '../app.css';

export default function Home() {
  const [tasks, setTasks] = useState<ITask[]>(dummyTasks);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(tasks.find(t => t.status === 'in_progress') || null);
  const [totalPomodoros, setTotalPomodoros] = useState(6);
  const [todayPomodoros, setTodayPomodoros] = useState(3);
  const [showPomodoro, setShowPomodoro] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [isMinimalMode, setIsMinimalMode] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  
  const { 
    backgrounds, 
    activeBackground, 
    loading: backgroundsLoading, 
    changeBackground,
    uploadBackground,
    deleteBackground 
  } = useBackground();

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
      setTodayPomodoros(prev => prev + 1);
      setTotalPomodoros(prev => prev + 1);
    }
  }, [selectedTask]);

  const handleBackgroundLoad = () => {
    setBackgroundLoaded(true);
    setTimeout(() => {
      setShowContent(true);
    }, 500);
  };

  const handleBackgroundChange = (background: IBackground) => {
    changeBackground(background);
    setShowBackgroundSelector(false);
    setBackgroundLoaded(false);
    setShowContent(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadBackground(file);
    if (result) {
      handleBackgroundChange(result);
    }
    event.target.value = '';
  };

  const handleDeleteBackground = async (background: IBackground, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteBackground(background);
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

  const renderBackground = () => {
    if (!activeBackground && !backgroundsLoading) {
      return (
        <div 
          className="absolute inset-0"
          style={{ background: 'var(--gradient-soft)' }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,243,213,0.1),transparent_50%)]" />
        </div>
      );
    }

    if (!activeBackground) return null;

    if (activeBackground.type === 'video') {
      return (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          key={activeBackground.id}
          onLoadedData={handleBackgroundLoad}
          onCanPlayThrough={handleBackgroundLoad}
        >
          <source src={activeBackground.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <div
        className="w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${activeBackground.url})`,
          opacity: backgroundLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
        onLoad={handleBackgroundLoad}
      />
    );
  };

  const isLoading = backgroundsLoading || !backgroundLoaded || !showContent;

  return (
    <div className="home-page min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        {renderBackground()}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/5"></div>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'var(--gradient-soft)' }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,243,213,0.2),transparent_50%)]" />
            
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
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
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative"
              >
                <div className="w-64 h-1 bg-amber-800/20 rounded-full overflow-hidden mx-auto">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
                <p className="text-amber-800/60 text-sm mt-4">
                  Loading your productive environment
                </p>
              </motion.div>

              <motion.div
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="fixed top-4 right-4 z-50 flex flex-col gap-2"
            >
              <button
                onClick={() => setShowBackgroundSelector(!showBackgroundSelector)}
                className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 shadow-lg"
              >
                <Image className="w-4 h-4 text-white" />
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
                        onChange={handleFileUpload}
                        className="hidden"
                      />
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
                          onClick={() => handleBackgroundChange(background)}
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
                            onClick={(e) => handleDeleteBackground(background, e)}
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

            {!isMinimalMode && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 pt-20 pb-8 min-h-screen flex items-center"
              >
                <div className="max-w-7xl mx-auto px-4 w-full">
                  <div className="grid lg:grid-cols-12 gap-6 items-start">
                    
                    <AnimatePresence>
                      {showPomodoro && (
                        <motion.div
                          className={`${showTasks ? 'lg:col-span-7' : 'lg:col-span-8'}`}
                          initial={{ opacity: 0, y: 40, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 40, scale: 0.98 }}
                          transition={{ duration: 0.5, ease: [0.4, 0.2, 0.2, 1] }}
                        >
                          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/10 h-full">
                            <div className="text-center mb-6">
                              <h1 className="text-4xl font-bold leading-tight mb-2">
                                <span className="text-white drop-shadow-lg">POMOLAB</span>
                              </h1>
                            </div>
                            <PomodoroTimer onSessionComplete={handleSessionComplete} />
                            {selectedTask && (
                              <div className="mt-6 bg-white/5 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-lg">
                                <h3 className="text-white/90 font-medium mb-1 text-sm">Current Task</h3>
                                <p className="text-white font-medium drop-shadow">{selectedTask.title}</p>
                                {selectedTask.description && (
                                  <p className="text-white/70 text-xs mt-1">{selectedTask.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-white/60 text-xs">
                                  <span>🍅 {selectedTask.completed_pomodoros}/{selectedTask.estimated_pomodoros}</span>
                                  <span className="capitalize">{selectedTask.status.replace('_', ' ')}</span>
                                </div>
                              </div>
                            )}
                            <div className="mt-6 text-center">
                              <Link
                                to="/learn-together"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/20 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                              >
                                Join Learning Session
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {showTasks && (
                        <motion.div
                          className={`${showPomodoro ? 'lg:col-span-5' : 'lg:col-span-4'}`}
                          initial={{ opacity: 0, y: 40, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 40, scale: 0.98 }}
                          transition={{ duration: 0.5, ease: [0.4, 0.2, 0.2, 1] }}
                        >
                          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-white/10 h-full max-h-[80vh]">
                            <TaskList
                              tasks={tasks}
                              onTaskSelect={handleTaskSelect}
                              onTaskComplete={handleTaskComplete}
                              onTaskAdd={handleTaskAdd}
                              selectedTaskId={selectedTask?.id}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!showPomodoro && !showTasks && (
                      <div className="lg:col-span-12 text-center">
                        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/10 max-w-2xl mx-auto">
                          <h1 className="text-5xl font-bold leading-tight mb-4">
                            <span className="text-white drop-shadow-lg">POMOLAB</span>
                          </h1>
                          <p className="text-white/80 text-lg drop-shadow mb-6">
                            Focus • Learn • Achieve
                          </p>
                          <p className="text-white/60 text-sm">
                            Use the controls in the top-right to show your timer and tasks
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative z-10 pb-12"
            >
              <div className="max-w-6xl mx-auto px-4">
                {!isMinimalMode && (
                  <>
                    <div className="grid md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-white/10 text-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xl font-bold text-white mb-1 drop-shadow">{todayPomodoros}</div>
                        <div className="text-xs text-white/70">Today's Focus</div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-white/10 text-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xl font-bold text-white mb-1 drop-shadow">{totalPomodoros}</div>
                        <div className="text-xs text-white/70">Total Sessions</div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-white/10 text-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xl font-bold text-white mb-1 drop-shadow">{completedTasks}</div>
                        <div className="text-xs text-white/70">Completed</div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-white/10 text-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-xl font-bold text-white mb-1 drop-shadow">{inProgressTasks}</div>
                        <div className="text-xs text-white/70">In Progress</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}