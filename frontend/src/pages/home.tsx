import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Zap, Target, ChevronLeft, ChevronRight, Timer, CheckSquare, Eye, EyeOff } from 'lucide-react';
import PomodoroTimer from '../components/pomodoro/pomodoro-timer';
import TaskList from '../components/pomodoro/task-list';
import type { ITask } from '../interfaces/ITask';
import { dummyTasks } from '../data/dummy-data';
import '../app.css';


export default function Home() {
  const [tasks, setTasks] = useState<ITask[]>(dummyTasks);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(tasks.find(t => t.status === 'in_progress') || null);
  const [totalPomodoros, setTotalPomodoros] = useState(6);
  const [todayPomodoros, setTodayPomodoros] = useState(3);
  const [showPomodoro, setShowPomodoro] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [isMinimalMode, setIsMinimalMode] = useState(false);

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

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="home-page min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/video-lofi-2.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/5"></div>
      </div>

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
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
      </div>

      {!isMinimalMode && (
        <section className="relative z-10 pt-8 pb-8 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              
              {showPomodoro && (
                <div className={`${showTasks ? 'lg:col-span-7' : 'lg:col-span-8'} transition-all duration-500`}>
                  <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/10 h-full">
                    <div className="text-center mb-6">
                      <h1 className="text-4xl font-bold leading-tight mb-2">
                        <span className="text-white drop-shadow-lg">POMOLAB</span>
                      </h1>
                      <p className="text-white/80 text-sm drop-shadow">
                        Focus • Learn • Achieve
                      </p>
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
                </div>
              )}

              {showTasks && (
                <div className={`${showPomodoro ? 'lg:col-span-5' : 'lg:col-span-4'} transition-all duration-500`}>
                  <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-white/10 h-full max-h-[80vh]">
                    <TaskList
                      tasks={tasks}
                      onTaskSelect={handleTaskSelect}
                      onTaskComplete={handleTaskComplete}
                      onTaskAdd={handleTaskAdd}
                      selectedTaskId={selectedTask?.id}
                    />
                  </div>
                </div>
              )}

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
        </section>
      )}

      {isMinimalMode && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl px-6 py-3 border border-white/10 shadow-2xl">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg text-center">
              POMOLAB
            </h1>
          </div>
        </div>
      )}

      <section className="relative z-10 pb-12">
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
              
              <div className="text-center">
                <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 shadow-xl border border-white/10 max-w-xl mx-auto">
                  <h3 className="text-lg font-semibold text-white mb-3 drop-shadow">The Pomodoro Technique</h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-4">
                    Boost productivity with 25-minute focus sessions followed by short breaks.
                  </p>
                  <div className="flex justify-center items-center gap-6 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-white/80 rounded-full shadow-sm"></div>
                      25m Focus
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full shadow-sm"></div>
                      5m Break
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-white/40 rounded-full shadow-sm"></div>
                      15m Long Break
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
