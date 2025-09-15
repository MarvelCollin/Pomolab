import { socketService } from './socket-service';
import { MessageApi } from '../apis/message-api';
import type { IMessage } from '../interfaces/IMessage';
import type { IUser } from '../interfaces/IUser';

export interface IMessageNotification {
  type: 'message_sent' | 'message_received' | 'message_updated' | 'message_failed';
  message: IMessage;
  from_user?: IUser;
  to_user?: IUser;
  timestamp: string;
}

class MessageService {
  private messageListeners: { [userId: number]: ((notification: IMessageNotification) => void)[] } = {};
  private toastCallbacks: ((type: string, title: string, message?: string) => void)[] = [];

  constructor() {
    this.initializeMessageListening();
  }

  private initializeMessageListening(): void {
    socketService.listenToMessageChannel((data: any) => {
      if (data.event === 'MessageSent' && data.data) {
        this.handleMessageNotification(data.data);
      } else if (data.event === 'MessageNotification' && data.data) {
        this.handleMessageNotification(data.data);
      } else if (data.event === 'MessageUpdate' && data.data) {
        this.handleMessageNotification(data.data);
      }
    });
  }

  private handleMessageNotification(notification: any): void {
    const messageNotification: IMessageNotification = {
      type: notification.type,
      message: notification.message,
      timestamp: notification.timestamp || new Date().toISOString()
    };
    
    if (this.messageListeners[notification.message.to_user_id]) {
      this.messageListeners[notification.message.to_user_id].forEach(callback => {
        callback(messageNotification);
      });
    }

    if (this.messageListeners[notification.message.from_user_id]) {
      this.messageListeners[notification.message.from_user_id].forEach(callback => {
        callback(messageNotification);
      });
    }

    this.triggerToastNotification(messageNotification);
  }

  private triggerToastNotification(notification: IMessageNotification): void {
    this.toastCallbacks.forEach(callback => {
      if (notification.type === 'message_received') {
        callback('info', 'New Message', `Message from user ${notification.message.from_user_id}`);
      } else if (notification.type === 'message_failed') {
        callback('error', 'Message Failed', 'Failed to send message');
      }
    });
  }

  public subscribeToToastNotifications(callback: (type: string, title: string, message?: string) => void): () => void {
    this.toastCallbacks.push(callback);
    
    return () => {
      this.toastCallbacks = this.toastCallbacks.filter(cb => cb !== callback);
    };
  }

  public subscribeToUserMessages(userId: number, callback: (notification: IMessageNotification) => void): () => void {
    if (!this.messageListeners[userId]) {
      this.messageListeners[userId] = [];
    }
    
    this.messageListeners[userId].push(callback);

    return () => {
      if (this.messageListeners[userId]) {
        this.messageListeners[userId] = this.messageListeners[userId].filter(cb => cb !== callback);
        
        if (this.messageListeners[userId].length === 0) {
          delete this.messageListeners[userId];
        }
      }
    };
  }

  public async sendMessage(messageData: {
    from_user_id: number;
    to_user_id: number;
    message: string;
    task_id?: number;
  }): Promise<IMessage> {
    try {
      const tempId = Date.now().toString();
      const tempMessage: IMessage = {
        id: tempId,
        from_user_id: messageData.from_user_id,
        to_user_id: messageData.to_user_id,
        message: messageData.message,
        task_id: messageData.task_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isTemporary: true,
        tempId: tempId
      };

      socketService.sendMessage({
        ...messageData,
        tempId: tempId
      });

      setTimeout(async () => {
        try {
          const actualMessage = await MessageApi.sendMessage({
            from_user_id: messageData.from_user_id,
            to_user_id: messageData.to_user_id,
            message: messageData.message,
            task_id: messageData.task_id
          });
          
          socketService.sendDirectMessage({
            type: 'message_updated',
            message: {
              ...actualMessage,
              tempId: tempId
            }
          });
        } catch (error) {
          socketService.sendDirectMessage({
            type: 'message_failed',
            message: {
              id: tempId
            }
          });
        }
      }, 0);

      return tempMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
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
