import { useCallback, useEffect } from 'react';
import { TaskApi } from '../apis/task-api';
import type { ITask } from '../interfaces/ITask';
import type { IUser } from '../interfaces/IUser';
import type { AppAction } from './use-app-state';

export const useTaskManagement = (
  dispatch: React.Dispatch<AppAction>,
  currentUser: IUser | null,
  tasks: ITask[],
  selectedTask: ITask | null
) => {
  const loadTasks = useCallback(async () => {
    if (!currentUser) return;
    
    dispatch({ type: 'SET_TASKS_LOADING', payload: true });
    dispatch({ type: 'SET_TASKS_ERROR', payload: null });
    try {
      const userTasks = await TaskApi.getUserTasks(currentUser.id);
      dispatch({ type: 'SET_TASKS', payload: userTasks });
      const inProgressTask = userTasks.find(t => t.status === 'in_progress');
      if (inProgressTask && !selectedTask) {
        dispatch({ type: 'SET_SELECTED_TASK', payload: inProgressTask });
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      dispatch({ type: 'SET_TASKS_ERROR', payload: error instanceof Error ? error.message : 'Failed to load tasks' });
    } finally {
      dispatch({ type: 'SET_TASKS_LOADING', payload: false });
    }
  }, [currentUser, selectedTask, dispatch]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskSelect = useCallback((task: ITask) => {
    dispatch({ type: 'SET_SELECTED_TASK', payload: task });
  }, [dispatch]);

  const handleTaskComplete = useCallback(async (taskId: number) => {
    try {
      await TaskApi.updateTaskStatus(taskId, 'completed');
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed', updated_at: new Date().toISOString() }
          : task
      );
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
    } catch (error) {
      console.error('Failed to complete task:', error);
      dispatch({ type: 'SET_TASKS_ERROR', payload: error instanceof Error ? error.message : 'Failed to complete task' });
    }
  }, [tasks, dispatch]);

  const handleTaskAdd = useCallback(async (newTask: Omit<ITask, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentUser) return;
    
    try {
      const taskData = {
        ...newTask,
        owner_id: currentUser.id
      };
      const createdTask = await TaskApi.createTask(taskData);
      dispatch({ type: 'SET_TASKS', payload: [createdTask, ...tasks] });
    } catch (error) {
      console.error('Failed to create task:', error);
      dispatch({ type: 'SET_TASKS_ERROR', payload: error instanceof Error ? error.message : 'Failed to create task' });
    }
  }, [currentUser, tasks, dispatch]);

  const handleTaskDelete = useCallback(async (taskId: number) => {
    try {
      await TaskApi.deleteTask(taskId);
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      dispatch({ type: 'SET_TASKS', payload: filteredTasks });
      if (selectedTask?.id === taskId) {
        dispatch({ type: 'SET_SELECTED_TASK', payload: null });
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      dispatch({ type: 'SET_TASKS_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete task' });
    }
  }, [tasks, selectedTask, dispatch]);

  const handleTaskEdit = useCallback(async (taskId: number, updates: Partial<ITask>) => {
    try {
      await TaskApi.updateTask(taskId, updates);
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      );
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      if (selectedTask?.id === taskId) {
        dispatch({ type: 'SET_SELECTED_TASK', payload: { ...selectedTask, ...updates, updated_at: new Date().toISOString() } });
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      dispatch({ type: 'SET_TASKS_ERROR', payload: error instanceof Error ? error.message : 'Failed to update task' });
    }
  }, [tasks, selectedTask, dispatch]);

  const handleTaskAssign = useCallback(async (taskId: number, userId: number | null) => {
    try {
      if (userId) {
        await TaskApi.assignTask(taskId, userId);
      } else {
        await TaskApi.updateTask(taskId, { assigned_to_id: undefined });
      }
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, assigned_to_id: userId || undefined, updated_at: new Date().toISOString() }
          : task
      );
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      if (selectedTask?.id === taskId) {
        dispatch({ type: 'SET_SELECTED_TASK', payload: { ...selectedTask, assigned_to_id: userId || undefined, updated_at: new Date().toISOString() } });
      }
    } catch (error) {
      console.error('Failed to assign task:', error);
      dispatch({ type: 'SET_TASKS_ERROR', payload: error instanceof Error ? error.message : 'Failed to assign task' });
    }
  }, [tasks, selectedTask, dispatch]);

  const handleSessionComplete = useCallback((sessionType: 'focus' | 'short-break' | 'long-break') => {
    if (sessionType === 'focus' && selectedTask) {
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id 
          ? { 
              ...task, 
              status: 'in_progress'
            }
          : task
      );
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
    }
  }, [selectedTask, tasks, dispatch]);

  return {
    handleTaskSelect,
    handleTaskComplete,
    handleTaskAdd,
    handleTaskDelete,
    handleTaskEdit,
    handleTaskAssign,
    handleSessionComplete
  };
};

