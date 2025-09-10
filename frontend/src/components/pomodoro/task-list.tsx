import { useState } from 'react';
import { Plus, MoreHorizontal, Play, Check, Clock, User } from 'lucide-react';
import type { ITask } from '../../interfaces/ITask';

interface TaskListProps {
  tasks: ITask[];
  onTaskSelect: (task: ITask) => void;
  onTaskComplete: (taskId: number) => void;
  onTaskAdd: (task: Omit<ITask, 'id' | 'created_at' | 'updated_at'>) => void;
  selectedTaskId?: number;
}

export default function TaskList({ tasks, onTaskSelect, onTaskComplete, onTaskAdd, selectedTaskId }: TaskListProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onTaskAdd({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        owner_id: 1, // Current user ID (dummy)
        assigned_to_id: undefined,
        status: 'pending',
        estimated_pomodoros: estimatedPomodoros,
        completed_pomodoros: 0
      });
      
      setNewTaskTitle('');
      setNewTaskDescription('');
      setEstimatedPomodoros(1);
      setIsAddingTask(false);
    }
  };

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
    <div className="task-list h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white drop-shadow">Tasks</h2>
        <button
          onClick={() => setIsAddingTask(true)}
          className="w-8 h-8 bg-white/10 backdrop-blur-2xl hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      {isAddingTask && (
        <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-3 mb-3 border border-white/10 shadow-lg">
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
                className="px-3 py-1 bg-white/20 backdrop-blur-2xl border border-white/10 text-white rounded-lg text-xs hover:bg-white/30 transition-all duration-200 shadow-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskSelect(task)}
            className={`bg-white/10 backdrop-blur-2xl rounded-xl p-3 border transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:bg-white/15 ${
              selectedTaskId === task.id 
                ? 'border-white/20 ring-1 ring-white/10 bg-white/20' 
                : 'border-white/10 hover:border-white/15'
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-medium text-white text-sm flex-1 mr-2 drop-shadow">{task.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                  {task.status.replace('_', ' ')}
                </span>
                <button className="p-0.5 hover:bg-white/10 backdrop-blur-2xl rounded-lg">
                  <MoreHorizontal className="w-3 h-3 text-white/60" />
                </button>
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
                      onTaskComplete(task.id);
                    }}
                    className="px-2 py-1 bg-green-500/50 backdrop-blur-2xl border border-green-400/20 hover:bg-green-500/70 text-white rounded-lg text-xs transition-all duration-200 shadow-lg"
                  >
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
          <div className="text-center py-8 text-white/60">
            <div className="bg-white/10 backdrop-blur-2xl rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-white/10">
              <Clock className="w-8 h-8 opacity-60" />
            </div>
            <p className="text-sm font-medium mb-1">No tasks yet</p>
            <p className="text-xs opacity-80">Add a task to start your session</p>
          </div>
        )}
      </div>
    </div>
  );
}
