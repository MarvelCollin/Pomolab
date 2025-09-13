import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PomodoroTimer from '../pomodoro/pomodoro-timer';
import TaskList from '../pomodoro/task-list';
import type { AppState, AppAction } from '../../hooks/use-app-state';
import type { ITask } from '../../interfaces/ITask';

interface MainContentProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  sessionDurations: {
    focus: number;
    'short-break': number;
    'long-break': number;
  };
  sessionLabels: {
    focus: string;
    'short-break': string;
    'long-break': string;
  };
  toggleTimer: () => void;
  resetTimer: () => void;
  handleSessionComplete: (sessionType: 'focus' | 'short-break' | 'long-break') => void;
  handleTaskSelect: (task: ITask) => void;
  handleTaskComplete: (taskId: number) => Promise<void>;
  handleTaskAdd: (task: Omit<ITask, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  handleTaskDelete: (taskId: number) => Promise<void>;
  handleTaskEdit: (taskId: number, updates: Partial<ITask>) => Promise<void>;
  handleTaskAssign: (taskId: number, userId: number | null) => Promise<void>;
}

const MainContent = memo(function MainContent({
  state,
  dispatch,
  sessionDurations,
  sessionLabels,
  toggleTimer,
  resetTimer,
  handleSessionComplete,
  handleTaskSelect,
  handleTaskComplete,
  handleTaskAdd,
  handleTaskDelete,
  handleTaskEdit,
  handleTaskAssign
}: MainContentProps) {
  if (state.ui.isMinimalMode) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.0, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative z-10 pt-20 pb-8 min-h-screen flex items-center"
    >
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className={`${(state.ui.tasksMinimized && !state.ui.pomodoroMinimized) ? 'lg:col-span-8' : (state.ui.pomodoroMinimized && !state.ui.tasksMinimized) ? 'lg:col-span-6' : (state.ui.pomodoroMinimized && state.ui.tasksMinimized) ? 'lg:col-span-10' : 'lg:col-span-7'} transition-all duration-500 ease-in-out`}>
            <div className={`rounded-3xl transition-all duration-500 ease-in-out ${state.ui.pomodoroMinimized ? 'p-3' : 'p-6'} h-full`}>
              <div 
                className={`text-center transition-all duration-500 ease-in-out ${
                  state.ui.pomodoroMinimized ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto mb-6'
                }`}
              >
                <h1 className="text-4xl font-bold leading-tight mb-2">
                  <span className="text-white drop-shadow-lg">POMOLAB</span>
                </h1>
              </div>
              
              {!state.ui.pomodoroMinimized && (
                <PomodoroTimer 
                  onSessionComplete={handleSessionComplete} 
                  isMinimized={false}
                  currentSession={state.pomodoro.currentSession}
                  timeLeft={state.pomodoro.timeLeft}
                  isRunning={state.pomodoro.isTimerRunning}
                  sessionCount={state.pomodoro.sessionCount}
                  soundEnabled={state.pomodoro.soundEnabled}
                  customDurations={state.pomodoro.customDurations}
                  sessionDurations={sessionDurations}
                  sessionLabels={sessionLabels}
                  onToggleTimer={toggleTimer}
                  onResetTimer={resetTimer}
                  onSetCurrentSession={(session) => dispatch({ type: 'UPDATE_POMODORO', payload: { currentSession: session } })}
                  onSetTimeLeft={(timeLeft) => dispatch({ type: 'UPDATE_POMODORO', payload: { timeLeft: typeof timeLeft === 'function' ? timeLeft(state.pomodoro.timeLeft) : timeLeft } })}
                  onSetSoundEnabled={(enabled) => dispatch({ type: 'UPDATE_POMODORO', payload: { soundEnabled: enabled } })}
                  onSetCustomDurations={(durations) => dispatch({ type: 'UPDATE_POMODORO', payload: { customDurations: typeof durations === 'function' ? durations(state.pomodoro.customDurations) : durations } })}
                  onSetSessionCount={(count) => dispatch({ type: 'UPDATE_POMODORO', payload: { sessionCount: count } })}
                />
              )}
              
              {state.selectedTask && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className={`bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-lg transition-all duration-500 ease-in-out ${
                    state.ui.pomodoroMinimized ? 'mt-3 p-2' : 'mt-6 p-4'
                  }`}
                >
                  <h3 className={`text-white/90 font-medium mb-1 transition-all duration-500 ${state.ui.pomodoroMinimized ? 'text-xs' : 'text-sm'}`}>
                    Current Task
                  </h3>
                  <p className={`text-white font-medium drop-shadow transition-all duration-500 ${state.ui.pomodoroMinimized ? 'text-sm' : 'text-base'}`}>
                    {state.selectedTask.title}
                  </p>
                  {state.selectedTask.description && !state.ui.pomodoroMinimized && (
                    <p className="text-white/70 text-xs mt-1">{state.selectedTask.description}</p>
                  )}
                  <div className={`flex items-center gap-3 text-white/60 text-xs transition-all duration-500 ${state.ui.pomodoroMinimized ? 'mt-1' : 'mt-2'}`}>
                    {!state.ui.pomodoroMinimized && <span className="capitalize">{state.selectedTask.status.replace('_', ' ')}</span>}
                  </div>
                </motion.div>
              )}
              
              <div 
                className={`text-center transition-all duration-500 ease-in-out ${
                  state.ui.pomodoroMinimized ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-6'
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

          <div className={`${(state.ui.pomodoroMinimized && !state.ui.tasksMinimized) ? 'lg:col-span-6' : (state.ui.tasksMinimized && !state.ui.pomodoroMinimized) ? 'lg:col-span-4' : (state.ui.pomodoroMinimized && state.ui.tasksMinimized) ? 'lg:col-span-2' : 'lg:col-span-5'} transition-all duration-500 ease-in-out flex flex-col`}>
            <div className={`rounded-3xl transition-all duration-500 ease-in-out ${state.ui.tasksMinimized ? 'p-2 max-h-[120px]' : 'p-4 flex-1 min-h-0'} ${state.ui.tasksMinimized ? 'overflow-hidden' : 'flex flex-col'}`}>
              {state.tasksError && !state.ui.tasksMinimized && (
                <div className="bg-red-500/10 backdrop-blur-2xl border border-red-500/20 rounded-xl p-3 mb-4">
                  <p className="text-red-400 text-sm">Error loading tasks: {state.tasksError}</p>
                </div>
              )}
              
              <TaskList
                tasks={state.tasks}
                onTaskSelect={handleTaskSelect}
                onTaskComplete={handleTaskComplete}
                onTaskAdd={handleTaskAdd}
                onTaskDelete={handleTaskDelete}
                onTaskEdit={handleTaskEdit}
                onTaskAssign={handleTaskAssign}
                selectedTaskId={state.selectedTask?.id}
                isMinimized={state.ui.tasksMinimized}
                currentUser={state.auth.currentUser}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
});

export default MainContent;
