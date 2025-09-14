import { useState, useEffect, memo } from 'react';
import { Plus, MoreHorizontal, Play, Check, Clock, User, Edit3, Trash2, Filter, UserPlus, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ITask } from '../../interfaces/ITask';
import type { IUser } from '../../interfaces/IUser';
import { FriendApi } from '../../apis/friend-api';
import { useDebounce } from '../../hooks/use-debounce';

interface TaskListProps {
  tasks: ITask[];
  onTaskSelect: (task: ITask) => void;
  onTaskComplete: (taskId: number) => Promise<void>;
  onTaskAdd: (task: Omit<ITask, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onTaskDelete?: (taskId: number) => Promise<void>;
  onTaskEdit?: (taskId: number, updates: Partial<ITask>) => Promise<void>;
  onTaskAssign?: (taskId: number, userId: number | null) => Promise<void>;
  selectedTaskId?: number;
  isMinimized?: boolean;
  currentUser?: IUser | null;
}

function TaskList({ tasks, onTaskSelect, onTaskComplete, onTaskAdd, onTaskDelete, onTaskEdit, onTaskAssign, selectedTaskId, isMinimized = false, currentUser }: TaskListProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
  const [addingTask, setAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('active'); 
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningTaskId, setAssigningTaskId] = useState<number | null>(null);
  const [availableUsers, setAvailableUsers] = useState<IUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const loadUsers = async () => {
      if (!currentUser) return;
      
      try {
        setSearchLoading(true);
        const [friendsResponse, usersResponse] = await Promise.all([
          FriendApi.getUserFriends(currentUser.id).catch(err => {
            console.error('Failed to fetch friends:', err);
            return [];
          }),
          FriendApi.getAllUsers().catch(err => {
            console.error('Failed to fetch users:', err);
            return [];
          })
        ]);
        
        const friends = Array.isArray(friendsResponse) ? friendsResponse : [];
        const users = Array.isArray(usersResponse) ? usersResponse : [];
        
        if (friends.length === 0 && users.length === 0) {
          setAvailableUsers([currentUser]);
          return;
        }
        
        const acceptedFriends = friends
          .filter(friend => friend && friend.status === 'accepted')
          .map(friend => {
            const friendUser = users.find(user => 
              user && user.id === (friend.user_id === currentUser.id ? friend.friend_id : friend.user_id)
            );
            return friendUser;
          })
          .filter(Boolean) as IUser[];
        
        setAvailableUsers([currentUser, ...acceptedFriends]);
      } catch (error) {
        console.error('Failed to load users:', error);
        setAvailableUsers([currentUser]);
      } finally {
        setSearchLoading(false);
      }
    };

    loadUsers();
  }, [currentUser]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearchQuery.trim() || !currentUser) {
        return;
      }

      try {
        setSearchLoading(true);
        const searchResults = await FriendApi.searchUsers(debouncedSearchQuery);
        
        const results = Array.isArray(searchResults) ? searchResults : [];
        
        const filteredResults = results.filter(user => user && user.id !== currentUser.id);
        
        const existingIds = availableUsers.map(user => user.id);
        const newUsers = filteredResults.filter(user => user && !existingIds.includes(user.id));
        
        setAvailableUsers(prev => [...prev, ...newUsers]);
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearchQuery, currentUser, availableUsers]);

  const handleAssignTask = (taskId: number) => {
    setAssigningTaskId(taskId);
    setShowAssignModal(true);
  };

  const handleAssignToUser = async (userId: number | null) => {
    if (assigningTaskId && onTaskAssign) {
      try {
        await onTaskAssign(assigningTaskId, userId);
        setShowAssignModal(false);
        setAssigningTaskId(null);
      } catch (error) {
        console.error('Failed to assign task:', error);
      }
    }
  };

  const getAssignedUserName = (task: ITask) => {
    if (!task.assigned_to_id) return null;
    const assignedUser = availableUsers.find(user => user.id === task.assigned_to_id);
    return assignedUser?.username || 'Unknown User';
  };

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      setAddingTask(true);
      
      try {
        await onTaskAdd({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || undefined,
          owner_id: 1,
          assigned_to_id: newTaskAssignee || undefined,
          status: 'pending'
        });
        
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskAssignee(null);
        setIsAddingTask(false);
      } catch (error) {
        console.error('Failed to add task:', error);
      } finally {
        setAddingTask(false);
      }
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    setCompletingTaskId(taskId);
    try {
      await onTaskComplete(taskId);
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setTimeout(() => {
        setCompletingTaskId(null);
      }, 300);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (onTaskDelete) {
      try {
        await onTaskDelete(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (taskId: number) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  const startEditing = (task: ITask, field?: 'title' | 'description') => {
    setEditingTaskId(task.id);
    setEditingField(field || null);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setOpenMenuId(null);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingField(null);
    setEditTitle('');
    setEditDescription('');
  };

  const saveEdit = async () => {
    if (editingTaskId && onTaskEdit) {
      try {
        const updates: Partial<ITask> = {
          title: editTitle.trim(),
          description: editDescription.trim() || undefined
        };
        await onTaskEdit(editingTaskId, updates);
        cancelEditing();
      } catch (error) {
        console.error('Failed to save task edit:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const handleDoubleClick = (task: ITask, field: 'title' | 'description') => {
    if (!isMinimized) {
      startEditing(task, field);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.task-menu') && !target.closest('.edit-form')) {
        setOpenMenuId(null);
        if (editingTaskId && !target.closest('.task-edit-input')) {
          cancelEditing();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingTaskId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10 backdrop-blur-2xl border border-green-500/20';
      case 'in_progress': return 'text-white bg-white/10 backdrop-blur-2xl border border-white/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 backdrop-blur-2xl border border-red-500/20';
      default: return 'text-white/70 bg-white/10 backdrop-blur-2xl border border-white/10';
    }
  };

  const getFilteredTasks = () => {
    switch (statusFilter) {
      case 'all':
        return tasks;
      case 'active':
        return tasks.filter(task => task.status !== 'completed' && task.status !== 'cancelled');
      case 'pending':
        return tasks.filter(task => task.status === 'pending');
      case 'in_progress':
        return tasks.filter(task => task.status === 'in_progress');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      case 'cancelled':
        return tasks.filter(task => task.status === 'cancelled');
      default:
        return tasks.filter(task => task.status !== 'completed');
    }
  };

  const filteredTasks = getFilteredTasks();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-3 h-3" />;
      case 'in_progress': return <Play className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <motion.div 
      className="task-list h-full flex flex-col min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`bg-white/5 backdrop-blur-2xl rounded-xl border border-white/10 shadow-lg transition-all duration-500 ease-in-out ${isMinimized ? 'p-2 mb-2' : 'p-3 mb-4'}`}>
        <div className="flex items-center justify-between">
          <h2 className={`font-semibold text-white drop-shadow transition-all duration-500 ease-in-out ${isMinimized ? 'text-sm' : 'text-lg'}`}>
            Tasks {isMinimized ? `(${filteredTasks.length})` : `(${filteredTasks.length})`}
          </h2>
          <div className="flex items-center gap-2">
            {!isMinimized && (
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`bg-white/10 backdrop-blur-2xl hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 w-8 h-8 ${
                  showFilter ? 'bg-white/20' : ''
                }`}
              >
                <Filter className="w-4 h-4 text-white" />
              </button>
            )}
            <button
              onClick={() => setIsAddingTask(true)}
              className={`bg-white/10 backdrop-blur-2xl hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out ${
                isMinimized ? 'opacity-0 scale-0 w-0 h-0 overflow-hidden' : 'opacity-100 scale-100 w-8 h-8'
              }`}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        
        {showFilter && !isMinimized && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-white/10"
          >
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'active', label: 'Active', count: tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length },
                { key: 'all', label: 'All', count: tasks.length },
                { key: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'pending').length },
                { key: 'in_progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length },
                { key: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length },
                { key: 'cancelled', label: 'Cancelled', count: tasks.filter(t => t.status === 'cancelled').length }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    statusFilter === filter.key
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {isMinimized && filteredTasks.length > 0 && (
        <div 
          className="bg-white/10 backdrop-blur-2xl rounded-xl p-2 border border-white/10 shadow-lg transition-all duration-500 ease-in-out"
        >
          {(() => {
            const activeTask = filteredTasks.find(t => t.status === 'in_progress' || selectedTaskId === t.id) || filteredTasks.find(t => t.status === 'pending');
            if (!activeTask) return (
              <p className="text-white/60 text-xs text-center py-2">No active tasks</p>
            );
            return (
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{activeTask.title}</p>
                  <div className="flex items-center gap-2 text-white/60 text-xs mt-1">
                    <span className="capitalize">{activeTask.status.replace('_', ' ')}</span>
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
            <select
              value={newTaskAssignee || ''}
              onChange={(e) => setNewTaskAssignee(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-white/10 backdrop-blur-2xl border border-white/10 rounded-lg px-3 py-2 outline-none text-white/80 text-xs mb-2"
            >
              <option value="">Assign to (optional)</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id} className="text-gray-900">
                  {user.username}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between">
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
        className={`flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40 transition-all duration-500 ease-in-out ${
          isMinimized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`}
        style={{
          maxHeight: isMinimized ? '0' : 'calc(80vh - 180px)',
          minHeight: isMinimized ? '0' : '200px'
        }}
      >
        {filteredTasks.map((task) => (
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
              {editingTaskId === task.id && (editingField === 'title' || editingField === null) ? (
                <div className="flex-1 mr-2 edit-form">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-white/15 backdrop-blur-2xl border border-white/20 rounded-lg px-2 py-1 text-white text-sm font-medium outline-none focus:border-white/40 task-edit-input"
                    autoFocus
                  />
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={cancelEditing}
                      className="px-2 py-1 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-lg text-xs text-white/70 hover:bg-white/20 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-2 py-1 bg-white/20 backdrop-blur-2xl border border-white/10 text-white rounded-lg text-xs hover:bg-white/30 transition-all duration-200"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <h3 
                  className="font-medium text-white text-sm flex-1 mr-2 drop-shadow cursor-pointer hover:text-white/80 transition-colors"
                  onDoubleClick={() => handleDoubleClick(task, 'title')}
                >
                  {task.title}
                </h3>
              )}
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
                          startEditing(task);
                        }}
                        className="w-full px-4 py-2 text-xs text-white/90 hover:bg-white/20 flex items-center gap-2 rounded-t-xl transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignTask(task.id);
                        }}
                        className="w-full px-4 py-2 text-xs text-white/90 hover:bg-white/20 flex items-center gap-2 transition-colors border-t border-white/10"
                      >
                        <UserPlus className="w-4 h-4" />
                        Assign
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
            
            {editingTaskId === task.id && editingField === 'description' ? (
              <div className="mb-2 edit-form">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Description (optional)..."
                  className="w-full bg-white/15 backdrop-blur-2xl border border-white/20 rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-white/40 resize-none task-edit-input"
                  rows={2}
                  autoFocus
                />
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={cancelEditing}
                    className="px-2 py-1 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-lg text-xs text-white/70 hover:bg-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-2 py-1 bg-white/20 backdrop-blur-2xl border border-white/10 text-white rounded-lg text-xs hover:bg-white/30 transition-all duration-200"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : task.description ? (
              <p 
                className="text-xs text-white/70 mb-2 line-clamp-2 cursor-pointer hover:text-white/50 transition-colors"
                onDoubleClick={() => handleDoubleClick(task, 'description')}
              >
                {task.description}
              </p>
            ) : (
              <p 
                className="text-xs text-white/40 mb-2 italic cursor-pointer hover:text-white/30 transition-colors"
                onDoubleClick={() => handleDoubleClick(task, 'description')}
              >
                Double-click to add description
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-white/70 capitalize">
                  {task.status.replace('_', ' ')}
                </span>
                {task.assigned_to_id && (
                  <span className="flex items-center gap-1 text-white/60">
                    <User className="w-3 h-3" />
                    {getAssignedUserName(task) || 'Assigned'}
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
          </div>
        ))}
        
        {filteredTasks.length === 0 && !isAddingTask && (
          <motion.div 
            className="text-center py-8 text-white/60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="bg-white/10 backdrop-blur-2xl rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-white/10">
              <Clock className="w-8 h-8 opacity-60" />
            </div>
            <p className="text-sm font-medium mb-1">
              {tasks.length === 0 ? 'No tasks yet' : `No ${statusFilter === 'active' ? 'active' : statusFilter} tasks`}
            </p>
            <p className="text-xs opacity-80">
              {tasks.length === 0 ? 'Add a task to start your session' : 
               statusFilter !== 'all' ? `Try changing the filter to see other tasks` : 'All tasks are filtered out'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Assign Task</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 outline-none focus:border-white/40"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {/* Unassign option */}
                <button
                  onClick={() => handleAssignToUser(null)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-white/60" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Unassign</p>
                    <p className="text-white/60 text-xs">Remove assignment</p>
                  </div>
                </button>

                {/* Available users */}
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAssignToUser(user.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                      ) : (
                        <Users className="w-4 h-4 text-white/60" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-white/60 text-xs">{user.email}</p>
                      {user.id === currentUser?.id && (
                        <span className="text-blue-400 text-xs">(You)</span>
                      )}
                    </div>
                  </button>
                ))}

                {searchLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}

                {availableUsers.length === 0 && !searchLoading && (
                  <div className="text-center py-8 text-white/60">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No users available</p>
                    <p className="text-xs opacity-80">Add friends to assign tasks</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(TaskList);
