const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export interface IUserStats {
  user: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    created_at: string;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    byStatus: {
      status: string;
      count: number;
    }[];
  };
  friends: {
    total: number;
    pending: number;
    accepted: number;
  };
  groups: {
    total: number;
    created: number;
    joined: number;
  };
  messages: {
    total: number;
    sent: number;
    received: number;
    last7Days: {
      date: string;
      count: number;
    }[];
  };
}

export class StatsApi {
  static async getUserStats(userId: number): Promise<IUserStats> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    return response.json();
  }

  static async getTaskStats(userId: number): Promise<IUserStats['tasks']> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/task-stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch task stats');
    }
    return response.json();
  }

  static async getFriendStats(userId: number): Promise<IUserStats['friends']> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/friend-stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch friend stats');
    }
    return response.json();
  }

  static async getGroupStats(userId: number): Promise<IUserStats['groups']> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/group-stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch group stats');
    }
    return response.json();
  }

  static async getMessageStats(userId: number): Promise<IUserStats['messages']> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/message-stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch message stats');
    }
    return response.json();
  }
}
