import type { IFriend } from '../interfaces/IFriend';
import type { IUser } from '../interfaces/IUser';
import { AuthTrigger, authOperations } from '../services/auth-trigger.tsx';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export class FriendApi {
  static async getAllFriends(): Promise<IFriend[]> {
    const response = await fetch(`${API_BASE_URL}/api/friends`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch friends');
    }
    return response.json();
  }

  static async getFriendById(id: number): Promise<IFriend> {
    const response = await fetch(`${API_BASE_URL}/api/friends/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch friend');
    }
    return response.json();
  }

  static async createFriendRequest(friendData: { user_id: number; friend_id: number; status: string }): Promise<IFriend | null> {
    return AuthTrigger.wrapApiCall(authOperations.create, async () => {
      const response = await fetch(`${API_BASE_URL}/api/friends`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(friendData),
      });
      if (!response.ok) {
        throw new Error('Failed to create friend request');
      }
      return response.json();
    });
  }

  static async updateFriend(id: number, status: string): Promise<void> {
    await AuthTrigger.wrapApiCall(authOperations.update, async () => {
      const response = await fetch(`${API_BASE_URL}/api/friends/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update friend');
      }
    });
  }

  static async deleteFriend(id: number): Promise<void> {
    await AuthTrigger.wrapApiCall(authOperations.delete, async () => {
      const response = await fetch(`${API_BASE_URL}/api/friends/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to delete friend');
      }
    });
  }

  static async getUserFriends(userId: number): Promise<IFriend[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/friends`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user friends');
    }
    return response.json();
  }

  static async getFriendRequests(userId: number): Promise<IFriend[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/friend-requests`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch friend requests');
    }
    return response.json();
  }

  static async getSentRequests(userId: number): Promise<IFriend[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/sent-requests`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch sent requests');
    }
    return response.json();
  }

  static async updateFriendshipStatus(user_id: number, friend_id: number, status: string): Promise<void> {
    await AuthTrigger.wrapApiCall(authOperations.update, async () => {
      const response = await fetch(`${API_BASE_URL}/api/friendship/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id, friend_id, status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update friendship status');
      }
    });
  }

  static async searchUsers(query: string): Promise<IUser[]> {
    const response = await fetch(`${API_BASE_URL}/api/users?search=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to search users');
    }
    return response.json();
  }

  static async getAllUsers(): Promise<IUser[]> {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  }
}
