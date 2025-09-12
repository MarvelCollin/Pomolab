import { IMessage } from '../interfaces/IMessage';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export class MessageApi {
  static async getAllMessages(): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/messages`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  }

  static async getMessageById(id: number): Promise<IMessage> {
    const response = await fetch(`${API_BASE_URL}/api/messages/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch message');
    }
    return response.json();
  }

  static async createMessage(messageData: { from_user_id: number; to_user_id: number; message: string; task_id?: number }): Promise<IMessage> {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) {
      throw new Error('Failed to create message');
    }
    return response.json();
  }

  static async updateMessage(id: number, message: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      throw new Error('Failed to update message');
    }
  }

  static async deleteMessage(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete message');
    }
  }

  static async getMessagesByFromUser(fromUserId: number): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/messages/from/${fromUserId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages by from user');
    }
    return response.json();
  }

  static async getMessagesByToUser(toUserId: number): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/messages/to/${toUserId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages by to user');
    }
    return response.json();
  }

  static async getConversation(userId1: number, userId2: number): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/conversation/${userId1}/${userId2}`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    return response.json();
  }

  static async getTaskMessages(taskId: number): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/messages`);
    if (!response.ok) {
      throw new Error('Failed to fetch task messages');
    }
    return response.json();
  }

  static async getUserMessages(userId: number): Promise<IMessage[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/messages`);
    if (!response.ok) {
      throw new Error('Failed to fetch user messages');
    }
    return response.json();
  }

  static async sendMessage(messageData: { from_user_id: number; to_user_id: number; message: string; task_id?: number }): Promise<IMessage> {
    const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    return response.json();
  }
}
