import { socketService } from './socket-service';
import { MessageApi } from '../apis/message-api';
import { UserApi } from '../apis/user-api';
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
  private toastCallbacks: ((type: string, title: string, message?: string, options?: any) => void)[] = [];
  private chatOpenCallback: ((user: IUser) => void) | null = null;
  private currentUser: IUser | null = null;
  private isInitialized: boolean = false;
  private userCache: { [userId: number]: IUser } = {};
  private openChatUsers: Set<number> = new Set();

  constructor() {
    this.initializeMessageListening();
  }

  public setCurrentUser(user: IUser | null): void {
    this.currentUser = user;
    
    if (!this.isInitialized) {
      this.initializeMessageListening();
    }
  }

  private initializeMessageListening(): void {
    if (this.isInitialized) {
      return;
    }
    
    socketService.listenToMessageChannel((data: any) => {
      if (data.event === 'MessageSent' && data.data) {
        this.handleMessageNotification(data.data);
      } else if (data.event === 'MessageNotification' && data.data) {
        this.handleMessageNotification(data.data);
      } else if (data.event === 'MessageUpdate' && data.data) {
        this.handleMessageNotification(data.data);
      } else if (data.type && data.message) {
        this.handleMessageNotification(data);
      }
    });
    this.isInitialized = true;
  }

  private handleMessageNotification(notification: any): void {
    const messageNotification: IMessageNotification = {
      type: notification.type,
      message: notification.message,
      from_user: notification.from_user,
      to_user: notification.to_user,
      timestamp: notification.timestamp || new Date().toISOString()
    };
    
    if (this.currentUser && notification.message.to_user_id === this.currentUser.id) {
      if (this.messageListeners[this.currentUser.id]) {
        this.messageListeners[this.currentUser.id].forEach(callback => {
          callback(messageNotification);
        });
      }
      
      this.triggerToastNotification(messageNotification).catch(error => {
        console.error('Error triggering toast notification:', error);
      });
    }
  }

  private async triggerToastNotification(notification: IMessageNotification): Promise<void> {
    if (notification.type === 'message_received' || notification.type === 'message_updated') {
      const shouldShowNotification = this.currentUser && 
        notification.message.to_user_id === this.currentUser.id &&
        notification.message.from_user_id !== this.currentUser.id &&
        !this.openChatUsers.has(notification.message.from_user_id);
      
      if (shouldShowNotification) {
        const fromUser = notification.from_user || await this.getUserData(notification.message.from_user_id);
        const messagePreview = notification.message.message.length > 50 
          ? `${notification.message.message.substring(0, 50)}...` 
          : notification.message.message;
        
        const options = {
          onClick: () => this.openChatWithUser(fromUser),
          userData: fromUser,
          persistent: true
        };
        
        this.toastCallbacks.forEach(callback => {
          callback('info', `New message from ${fromUser.username}`, messagePreview, options);
        });
      }
    } else if (notification.type === 'message_failed') {
      this.toastCallbacks.forEach(callback => {
        callback('error', 'Message Failed', 'Failed to send message');
      });
    }
  }

  public setChatOpenCallback(callback: (user: IUser) => void): void {
    this.chatOpenCallback = callback;
  }

  private openChatWithUser(user: IUser): void {
    if (this.chatOpenCallback) {
      this.chatOpenCallback(user);
    }
  }

  private async getUserData(userId: number): Promise<IUser> {
    if (this.userCache[userId]) {
      return this.userCache[userId];
    }
    
    if (this.currentUser && this.currentUser.id === userId) {
      this.userCache[userId] = this.currentUser;
      return this.currentUser;
    }
    
    try {
      const user = await UserApi.getUserById(userId);
      this.userCache[userId] = user;
      return user;
    } catch (error) {
      const fallbackUser = {
        id: userId,
        username: `User ${userId}`,
        email: '',
        created_at: '',
        updated_at: ''
      };
      this.userCache[userId] = fallbackUser;
      return fallbackUser;
    }
  }

  public setChatOpen(userId: number): void {
    this.openChatUsers.add(userId);
  }

  public setChatClosed(userId: number): void {
    this.openChatUsers.delete(userId);
  }

  public subscribeToToastNotifications(callback: (type: string, title: string, message?: string, options?: any) => void): () => void {
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
