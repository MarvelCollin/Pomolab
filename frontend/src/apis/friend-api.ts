import type { IFriend } from '../interfaces/IFriend';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export class FriendApi {
  static async getAllFriends(): Promise<IFriend[]> {
    const response = await fetch(`${API_BASE_URL}/api/friends`);
    if (!response.ok) {
      throw new Error('Failed to fetch friends');
    }
    return response.json();
  }

  static async getFriendById(id: number): Promise<IFriend> {
    const response = await fetch(`${API_BASE_URL}/api/friends/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch friend');
    }
    return response.json();
  }

  static async createFriendRequest(friendData: { user_id: number; friend_id: number; status: string }): Promise<IFriend> {
    const response = await fetch(`${API_BASE_URL}/api/friends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(friendData),
    });
    if (!response.ok) {
      throw new Error('Failed to create friend request');
    }
    return response.json();
  }

  static async updateFriend(id: number, status: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/friends/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update friend');
    }
  }

  static async deleteFriend(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/friends/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete friend');
    }
  }

  static async getUserFriends(userId: number): Promise<IFriend[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/friends`);
    if (!response.ok) {
      throw new Error('Failed to fetch user friends');
    }
    return response.json();
  }

  static async getFriendRequests(userId: number): Promise<IFriend[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/friend-requests`);
    if (!response.ok) {
      throw new Error('Failed to fetch friend requests');
    }
    return response.json();
  }

  static async getSentRequests(userId: number): Promise<IFriend[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/sent-requests`);
    if (!response.ok) {
      throw new Error('Failed to fetch sent requests');
    }
    return response.json();
  }

  static async updateFriendshipStatus(user_id: number, friend_id: number, status: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/friendship/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id, friend_id, status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update friendship status');
    }
  }
}
