import type { IUser } from '../interfaces/IUser';
import { getApiHeaders } from '../utils/api-headers';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface AuthResponse {
  user: IUser;
  token: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export class UserApi {
  static async getAllUsers(): Promise<IUser[]> {
    const response = await fetch(`${API_BASE_URL}/api/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  }

  static async getUserById(id: number): Promise<IUser> {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  }

  static async createUser(userData: Partial<IUser> & { password: string }): Promise<IUser> {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  }

  static async updateUser(id: number, userData: Partial<IUser>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
  }

  static async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }

  static async getUserWithFriends(id: number): Promise<IUser> {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/with-friends`);
    if (!response.ok) {
      throw new Error('Failed to fetch user with friends');
    }
    return response.json();
  }

  static async getUserWithTasks(id: number): Promise<IUser> {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch user with tasks');
    }
    return response.json();
  }

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  }

  static async logout(token: string): Promise<void> {
    localStorage.setItem('token', token);
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getApiHeaders(true),
    });
    if (!response.ok) {
      throw new Error('Logout failed');
    }
  }

  static async getCurrentUser(token: string): Promise<IUser> {
    localStorage.setItem('token', token);
    const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
      headers: getApiHeaders(true),
    });
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    return response.json();
  }

  static async googleAuth(googleToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ google_token: googleToken }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Google authentication failed');
    }
    return response.json();
  }

  static async banUser(id: number): Promise<void> {
    const token = localStorage.getItem('authToken');
    localStorage.setItem('token', token || '');
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/ban`, {
      method: 'PUT',
      headers: getApiHeaders(true),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to ban user');
    }
  }

  static async unbanUser(id: number): Promise<void> {
    const token = localStorage.getItem('authToken');
    localStorage.setItem('token', token || '');
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/unban`, {
      method: 'PUT',
      headers: getApiHeaders(true),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unban user');
    }
  }
}
