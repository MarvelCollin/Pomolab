import { IUser } from '../interfaces/IUser';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/friends`);
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
}
