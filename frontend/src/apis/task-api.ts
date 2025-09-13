import type { ITask } from '../interfaces/ITask';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export class TaskApi {
  static async getAllTasks(): Promise<ITask[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  }

  static async getTaskById(id: number): Promise<ITask> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }
    return response.json();
  }

  static async createTask(taskData: { title: string; description?: string; owner_id: number; assigned_to_id?: number; group_id?: number; status: string }): Promise<ITask> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    return response.json();
  }

  static async updateTask(id: number, taskData: Partial<ITask>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
  }

  static async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  }

  static async getTasksByOwner(ownerId: number): Promise<ITask[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/owner/${ownerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks by owner');
    }
    return response.json();
  }

  static async getTasksByAssigned(assignedId: number): Promise<ITask[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/assigned/${assignedId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks by assigned');
    }
    return response.json();
  }

  static async getTasksByStatus(status: string): Promise<ITask[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/status/${status}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks by status');
    }
    return response.json();
  }

  static async getUserTasks(userId: number): Promise<ITask[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/all-tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch user tasks');
    }
    return response.json();
  }

  static async getTaskWithMessages(id: number): Promise<ITask> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/with-messages`);
    if (!response.ok) {
      throw new Error('Failed to fetch task with messages');
    }
    return response.json();
  }

  static async updateTaskStatus(id: number, status: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update task status');
    }
  }

  static async assignTask(id: number, user_id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id }),
    });
    if (!response.ok) {
      throw new Error('Failed to assign task');
    }
  }
}
