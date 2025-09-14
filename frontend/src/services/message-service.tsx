import { socketService } from './socket-service';
import { MessageApi } from '../apis/message-api';
import type { IMessage } from '../interfaces/IMessage';
import type { IUser } from '../interfaces/IUser';

export interface IMessageNotification {
  type: 'message_sent' | 'message_received';
  message: IMessage;
  from_user?: IUser;
  to_user?: IUser;
  timestamp: string;
}

class MessageService {
  private messageListeners: { [userId: number]: ((notification: IMessageNotification) => void)[] } = {};

  constructor() {
    this.initializeMessageListening();
  }

  private initializeMessageListening(): void {
    socketService.listenToMessageChannel((data: any) => {
      if (data.event === 'MessageSent' && data.data) {
        this.handleMessageNotification(data.data);
      }
    });

    socketService.listenToMessageNotifications((data: any) => {
      if (data.event === 'MessageNotification' && data.data) {
        this.handleMessageNotification(data.data);
      }
    });

    socketService.listenToFriendNotifications((data: any) => {
      if (data.action === 'message_sent' && data.friendship_data) {
        this.handleMessageNotification({
          type: 'message_received',
          message: data.friendship_data,
          timestamp: data.timestamp
        });
      }
    });
  }

  private handleMessageNotification(notification: IMessageNotification): void {
    const { message } = notification;
    
    if (this.messageListeners[message.to_user_id]) {
      this.messageListeners[message.to_user_id].forEach(callback => {
        callback(notification);
      });
    }

    if (this.messageListeners[message.from_user_id]) {
      this.messageListeners[message.from_user_id].forEach(callback => {
        callback(notification);
      });
    }
  }

  public subscribeToUserMessages(userId: number, callback: (notification: IMessageNotification) => void): () => void {
    if (!this.messageListeners[userId]) {
      this.messageListeners[userId] = [];
    }
    
    this.messageListeners[userId].push(callback);

    const unsubscribeUserChannel = socketService.listenToUserChannel(userId, (data: any) => {
      if (data.event === 'new-message' && data.data) {
        this.handleMessageNotification({
          type: 'message_received',
          message: data.data,
          timestamp: data.data.created_at || new Date().toISOString()
        });
      }
    });

    return () => {
      if (this.messageListeners[userId]) {
        this.messageListeners[userId] = this.messageListeners[userId].filter(cb => cb !== callback);
        
        if (this.messageListeners[userId].length === 0) {
          delete this.messageListeners[userId];
        }
      }
      
      unsubscribeUserChannel();
    };
  }

  public async sendMessage(messageData: {
    from_user_id: number;
    to_user_id: number;
    message: string;
    task_id?: number;
  }): Promise<IMessage> {
    try {
      const sentMessage = await MessageApi.sendMessage(messageData);

      // Broadcast real-time notification
      await this.broadcastMessage(sentMessage);

      return sentMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  private async broadcastMessage(message: IMessage): Promise<void> {
    try {
      const response = await fetch('http://localhost:8080/broadcast/message-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_data: message,
          from_user_id: message.from_user_id,
          to_user_id: message.to_user_id,
          channel: 'message-notifications'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP broadcast failed: ${response.status}`);
      }
      
      console.log('Message broadcast successfully via HTTP');
    } catch (error) {
      console.warn('HTTP broadcast failed, using WebSocket fallback:', error);
      
      try {
        socketService.broadcastMessageNotification(message, message.from_user_id, message.to_user_id);
        console.log('Message broadcast successfully via WebSocket fallback');
      } catch (wsError) {
        console.error('Both HTTP and WebSocket broadcast failed:', wsError);
      }
    }
  }

  public async getConversation(userId1: number, userId2: number): Promise<IMessage[]> {
    return MessageApi.getConversation(userId1, userId2);
  }

  public isConnected(): boolean {
    return socketService.getConnectionStatus();
  }
}

export const messageService = new MessageService();
export default messageService;
