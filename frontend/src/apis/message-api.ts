import type { IMessage } from '../interfaces/IMessage';
import { AuthTrigger, authOperations } from '../utils/auth-trigger';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export class MessageApi {
  static async getAllMessages(): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  }

  static async getMessageById(id: number): Promise<IMessage> {
    const response = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch message');
    }
    return response.json();
  }

  static async createMessage(messageData: { from_user_id: number; to_user_id: number; message: string; task_id?: number }): Promise<IMessage> {
    return AuthTrigger.wrapApiCall(authOperations.create, async () => {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      });
      if (!response.ok) {
        throw new Error('Failed to create message');
      }
      return response.json();
    });
  }

  static async updateMessage(id: number, message: string): Promise<void> {
    await AuthTrigger.wrapApiCall(authOperations.update, async () => {
      const response = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        throw new Error('Failed to update message');
      }
    });
  }

  static async deleteMessage(id: number): Promise<void> {
    await AuthTrigger.wrapApiCall(authOperations.delete, async () => {
      const response = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
    });
  }

  static async getMessagesByFromUser(fromUserId: number): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/messages/from/${fromUserId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch messages by from user');
    }
    return response.json();
  }

  static async getMessagesByToUser(toUserId: number): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/messages/to/${toUserId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch messages by to user');
    }
    return response.json();
  }

  static async getConversation(userId1: number, userId2: number): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/conversation/${userId1}/${userId2}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    return response.json();
  }

  static async getTaskMessages(taskId: number): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/messages`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch task messages');
    }
    return response.json();
  }

  static async getUserMessages(userId: number): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/messages`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user messages');
    }
    return response.json();
  }

  static async sendMessage(messageData: { from_user_id: number; to_user_id: number; message: string; task_id?: number }): Promise<IMessage> {
    return AuthTrigger.wrapApiCall(authOperations.create, async () => {
      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      return response.json();
    });
  }
}
