const WEBSOCKET_SERVER_URL = 'http://localhost:8080';

export interface FriendNotificationData {
  action: 'request_sent' | 'request_accepted' | 'request_rejected' | 'friend_removed';
  user_id: number;
  friend_id: number;
  friendship_data?: any;
  user_data?: any;
  friend_data?: any;
}

export class WebSocketBroadcast {
  static async broadcastFriendNotification(data: FriendNotificationData): Promise<boolean> {
    try {
      const response = await fetch(`${WEBSOCKET_SERVER_URL}/broadcast/friend-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`WebSocket broadcast failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Friend notification broadcasted:', result);
      return true;
    } catch (error) {
      console.error('Error broadcasting friend notification:', error);
      return false;
    }
  }

  static async broadcastMessage(message: string, channel = 'message-channel'): Promise<boolean> {
    try {
      const response = await fetch(`${WEBSOCKET_SERVER_URL}/broadcast/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, channel }),
      });

      if (!response.ok) {
        throw new Error(`WebSocket broadcast failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Message broadcasted:', result);
      return true;
    } catch (error) {
      console.error('Error broadcasting message:', error);
      return false;
    }
  }

  static async broadcastTaskUpdate(task: any, channel = 'task-updates'): Promise<boolean> {
    try {
      const response = await fetch(`${WEBSOCKET_SERVER_URL}/broadcast/task-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, channel }),
      });

      if (!response.ok) {
        throw new Error(`WebSocket broadcast failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Task update broadcasted:', result);
      return true;
    } catch (error) {
      console.error('Error broadcasting task update:', error);
      return false;
    }
  }
}
