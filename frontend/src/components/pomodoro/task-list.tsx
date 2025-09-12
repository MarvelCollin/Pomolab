import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Play, Check, Clock, User, Edit3, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ITask } from '../../interfaces/ITask';

interface TaskListProps {
  tasks: ITask[];
  onTaskSelect: (task: ITask) => void;
  onTaskComplete: (taskId: number) => void;
  onTaskAdd: (task: Omit<ITask, 'id' | 'created_at' | 'updated_at'>) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskEdit?: (taskId: number, updates: Partial<ITask>) => void;
  selectedTaskId?: number;
  isMinimized?: boolean;
}

export default function TaskList({ tasks, onTaskSelect, onTaskComplete, onTaskAdd, onTaskDelete, onTaskEdit, selectedTaskId, isMinimized = false }: TaskListProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
  const [addingTask, setAddingTask] = useState(false);

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      setAddingTask(true);
      
      onTaskAdd({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        owner_id: 1,
        assigned_to_id: undefined,
        status: 'pending',
        estimated_pomodoros: estimatedPomodoros,
        completed_pomodoros: 0
      });
      
      setNewTaskTitle('');
      setNewTaskDescription('');
      setEstimatedPomodoros(1);
      setAddingTask(false);
      setIsAddingTask(false);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    setCompletingTaskId(taskId);
    setTimeout(() => {
      onTaskComplete(taskId);
      setCompletingTaskId(null);
    }, 300);
  };

  const handleDeleteTask = (taskId: number) => {
    if (onTaskDelete) {
      onTaskDelete(taskId);
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (taskId: number) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.task-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10 backdrop-blur-2xl border border-green-500/20';
      case 'in_progress': return 'text-white bg-white/10 backdrop-blur-2xl border border-white/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 backdrop-blur-2xl border border-red-500/20';
      default: return 'text-white/70 bg-white/10 backdrop-blur-2xl border border-white/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-3 h-3" />;
      case 'in_progress': return <Play className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <motion.div 
      className="task-list h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-center justify-between bg-white/5 backdrop-blur-2xl rounded-xl border border-white/10 shadow-lg transition-all duration-500 ease-in-out ${isMinimized ? 'p-2 mb-2' : 'p-3 mb-4'}`}>
        <h2 className={`font-semibold text-white drop-shadow transition-all duration-500 ease-in-out ${isMinimized ? 'text-sm' : 'text-lg'}`}>
          Tasks {isMinimized && `(${tasks.filter(t => t.status !== 'completed').length})`}
        </h2>
        <button
          onClick={() => setIsAddingTask(true)}
          className={`bg-white/10 backdrop-blur-2xl hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out ${
            isMinimized ? 'opacity-0 scale-0 w-0 h-0 overflow-hidden' : 'opacity-100 scale-100 w-8 h-8'
          }`}
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      {isMinimized && tasks.length > 0 && (
        <div 
          className="bg-white/10 backdrop-blur-2xl rounded-xl p-2 border border-white/10 shadow-lg transition-all duration-500 ease-in-out"
        >
          {(() => {
            const activeTask = tasks.find(t => t.status === 'in_progress' || selectedTaskId === t.id) || tasks.find(t => t.status === 'pending');
            if (!activeTask) return (
              <p className="text-white/60 text-xs text-center py-2">No active tasks</p>
            );
            return (
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{activeTask.title}</p>
                  <div className="flex items-center gap-2 text-white/60 text-xs mt-1">
                    <span>🍅 {activeTask.completed_pomodoros}/{activeTask.estimated_pomodoros}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-1 ml-2">
                      <div
                        className="bg-white/60 h-1 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (activeTask.completed_pomodoros / activeTask.estimated_pomodoros) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {isAddingTask && !isMinimized && (
          <motion.div 
            className="bg-white/5 backdrop-blur-2xl rounded-xl p-3 mb-3 border border-white/10 shadow-lg"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full bg-white/10 backdrop-blur-2xl border border-white/10 rounded-lg px-3 py-2 outline-none text-white font-medium mb-2 placeholder-white/50 text-sm"
              autoFocus
            />
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Description (optional)..."
              className="w-full bg-white/10 backdrop-blur-2xl border border-white/10 rounded-lg px-3 py-2 outline-none text-white/80 text-xs mb-2 placeholder-white/40 resize-none"
              rows={2}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70">Est:</span>
                <input
                  type="number"
                  value={estimatedPomodoros}
                  onChange={(e) => setEstimatedPomodoros(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-12 bg-white/15 backdrop-blur-2xl border border-white/10 rounded-lg px-2 py-1 text-xs text-center outline-none text-white"
                />
                <span className="text-xs">🍅</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-lg text-xs text-white/70 hover:bg-white/20 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={addingTask}
                  className="px-3 py-1 bg-white/20 backdrop-blur-2xl border border-white/10 text-white rounded-lg text-xs hover:bg-white/30 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {addingTask && (
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}

      <div 
        className={`flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 transition-all duration-500 ease-in-out ${
          isMinimized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
        }`}
      >
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskSelect(task)}
            className={`bg-white/10 backdrop-blur-2xl rounded-xl p-3 border transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:bg-white/15 transform hover:-translate-y-0.5 ${
              selectedTaskId === task.id 
                ? 'border-l-4 border-l-white border-r border-t border-b border-r-white/20 border-t-white/20 border-b-white/20 bg-white/15 shadow-xl' 
                : 'border-white/10 hover:border-white/15'
            } ${completingTaskId === task.id ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-medium text-white text-sm flex-1 mr-2 drop-shadow">{task.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                  {task.status.replace('_', ' ')}
                </span>
                <div className="relative task-menu">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(task.id);
                    }}
                    className="p-0.5 hover:bg-white/10 backdrop-blur-2xl rounded-lg transition-all duration-200"
                  >
                    <MoreHorizontal className="w-3 h-3 text-white/60" />
                  </button>
                  
                  {openMenuId === task.id && (
                    <div className="absolute right-0 top-6 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl min-w-[140px] animate-in fade-in-0 zoom-in-95 duration-150">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-xs text-white/90 hover:bg-white/20 flex items-center gap-2 rounded-t-xl transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="w-full px-4 py-2 text-xs text-red-400 hover:bg-red-500/30 flex items-center gap-2 rounded-b-xl transition-colors border-t border-white/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {task.description && (
              <p className="text-xs text-white/70 mb-2 line-clamp-2">{task.description}</p>
            )}
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-white/70">
                  <span>🍅</span>
                  {task.completed_pomodoros}/{task.estimated_pomodoros}
                </span>
                {task.assigned_to_id && (
                  <span className="flex items-center gap-1 text-white/60">
                    <User className="w-3 h-3" />
                    Assigned
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {task.status === 'completed' ? (
                  <span className="text-green-400 font-medium text-xs">✓ Done</span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompleteTask(task.id);
                    }}
                    disabled={completingTaskId === task.id}
                    className="px-2 py-1 bg-green-500/50 backdrop-blur-2xl border border-green-400/20 hover:bg-green-500/70 text-white rounded-lg text-xs transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center gap-1"
                  >
                    {completingTaskId === task.id && (
                      <div className="w-2 h-2 border border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    Done
                  </button>
                )}
              </div>
            </div>
            
            {task.estimated_pomodoros > 0 && (
              <div className="mt-2">
                <div className="w-full bg-white/10 backdrop-blur-2xl rounded-full h-1 border border-white/10">
                  <div
                    className="bg-gradient-to-r from-white/60 to-white/40 h-1 rounded-full transition-all duration-300 shadow-sm"
                    style={{
                      width: `${Math.min(100, (task.completed_pomodoros / task.estimated_pomodoros) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {tasks.length === 0 && !isAddingTask && (
          <motion.div 
            className="text-center py-8 text-white/60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="bg-white/10 backdrop-blur-2xl rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-white/10">
              <Clock className="w-8 h-8 opacity-60" />
            </div>
            <p className="text-sm font-medium mb-1">No tasks yet</p>
            <p className="text-xs opacity-80">Add a task to start your session</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
