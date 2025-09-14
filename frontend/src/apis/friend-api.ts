import type { IFriend } from '../interfaces/IFriend';
import type { IUser } from '../interfaces/IUser';
import { AuthTrigger, authOperations } from '../utils/auth-trigger';

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
    const friend = await this.getFriendById(id);
    const userId = friend.user_id;
    const friendId = friend.friend_id;
    
    await AuthTrigger.wrapApiCall(authOperations.update, async () => {
      const response = await fetch(`${API_BASE_URL}/api/friendship/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId, friend_id: friendId, status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update friendship status');
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/friends`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 401) {
        throw new Error('Unauthorized access');
      }
      if (response.status === 404) {
        throw new Error('User not found');
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch user friends: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching user friends:', error);
      throw error;
    }
  }

  static async getFriendRequests(userId: number): Promise<IFriend[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/friend-requests`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 401) {
        throw new Error('Unauthorized access');
      }
      if (response.status === 404) {
        throw new Error('User not found');
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch friend requests: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      throw error;
    }
  }

  static async getSentRequests(userId: number): Promise<IFriend[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/sent-requests`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 401) {
        throw new Error('Unauthorized access');
      }
      if (response.status === 404) {
        throw new Error('User not found');
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch sent requests: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      throw error;
    }
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
    try {
      if (query.length < 2) {
        return [];
      }
      const response = await fetch(`${API_BASE_URL}/api/users?search=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 401) {
        throw new Error('Unauthorized access');
      }
      if (response.status === 400) {
        throw new Error('Search query too short');
      }
      if (!response.ok) {
        throw new Error(`Failed to search users: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
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
