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

export interface IVideoCallNotification {
  type: 'video_call_invite' | 'video_call_accepted' | 'video_call_rejected' | 'video_call_ended';
  callId: string;
  meetingId: string;
  token: string;
  from_user: IUser;
  to_user: IUser;
  timestamp: string;
}

export interface ICanvasNotification {
  type: 'canvas_invite' | 'canvas_joined' | 'canvas_left' | 'canvas_ended';
  sessionId: string;
  from_user: IUser;
  to_user: IUser;
  sessionName?: string;
  timestamp: string;
}

class NotificationService {
  private messageListeners: { [userId: number]: ((notification: IMessageNotification) => void)[] } = {};
  private videoCallListeners: { [userId: number]: ((notification: IVideoCallNotification) => void)[] } = {};
  private canvasListeners: { [userId: number]: ((notification: ICanvasNotification) => void)[] } = {};
  private toastCallbacks: ((type: string, title: string, message?: string, options?: any) => void)[] = [];
  private chatOpenCallback: ((user: IUser) => void) | null = null;
  private videoModalOpenCallback: ((meetingId: string, token: string) => void) | null = null;
  private canvasJoinCallback: ((sessionId: string, sessionName?: string) => void) | null = null;
  private currentUser: IUser | null = null;
  private isMessageInitialized: boolean = false;
  private isVideoCallInitialized: boolean = false;
  private isCanvasInitialized: boolean = false;
  private messageUnsubscribe: (() => void) | null = null;
  private videoCallUnsubscribe: (() => void) | null = null;
  private canvasUnsubscribe: (() => void) | null = null;
  private userCache: { [userId: number]: IUser } = {};
  private openChatUsers: Set<number> = new Set();
  private processedNotifications: Set<string> = new Set();
  private notificationExpiry: { [key: string]: number } = {};
  private toastSettings: { 
    messageSuccess: boolean;
    messageFailed: boolean;
  } = {
    messageSuccess: true,
    messageFailed: true
  };

  constructor() {
    this.initializeMessageListening();
    this.cleanupExpiredNotifications();
  }

  private cleanupExpiredNotifications(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];
      
      Object.keys(this.notificationExpiry).forEach(key => {
        if (this.notificationExpiry[key] < now) {
          expiredKeys.push(key);
        }
      });
      
      expiredKeys.forEach(key => {
        this.processedNotifications.delete(key);
        delete this.notificationExpiry[key];
      });
    }, 60000);
  }

  private generateNotificationKey(type: string, data: any): string {
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 9);
    
    if (type.startsWith('video_call_')) {
      return `${type}_${data.callId}_${data.from_user?.id}_${data.to_user?.id}_${timestamp}_${uniqueId}`;
    }
    if (type.startsWith('canvas_')) {
      return `${type}_${data.sessionId}_${data.from_user?.id}_${data.to_user?.id}_${timestamp}_${uniqueId}`;
    }
    if (type.startsWith('message_')) {
      return `${type}_${data.message?.id || data.message?.tempId}_${data.message?.from_user_id}_${data.message?.to_user_id}_${timestamp}_${uniqueId}`;
    }
    return `${type}_${JSON.stringify(data)}_${timestamp}_${uniqueId}`;
  }

  private isNotificationProcessed(key: string): boolean {
    if (this.processedNotifications.has(key)) {
      return true;
    }
    
    const keyParts = key.split('_');
    const baseKey = keyParts.slice(0, -2).join('_');
    const now = Date.now();
    
    const recentKeys = Array.from(this.processedNotifications).filter(k => {
      if (!k.startsWith(baseKey)) return false;
      
      const kParts = k.split('_');
      const kTimestamp = parseInt(kParts[kParts.length - 2]);
      
      return !isNaN(kTimestamp) && (now - kTimestamp) < 5000;
    });
    
    return recentKeys.length > 0;
  }

  private markNotificationProcessed(key: string): void {
    this.processedNotifications.add(key);
    this.notificationExpiry[key] = Date.now() + 120000;
  }

  public setCurrentUser(user: IUser | null): void {
    this.currentUser = user;
    
    if (!this.isMessageInitialized) {
      this.initializeMessageListening();
    }
    
    if (user && !this.isVideoCallInitialized) {
      this.initializeVideoCallListening();
    }
    
    if (user && !this.isCanvasInitialized) {
      this.initializeCanvasListening();
    }
    
    socketService.setCurrentUser(user?.id || null);
  }

  private initializeMessageListening(): void {
    if (this.isMessageInitialized && this.messageUnsubscribe) {
      return;
    }
    
    if (this.messageUnsubscribe) {
      this.messageUnsubscribe();
    }
    
    this.messageUnsubscribe = socketService.listenToMessageChannel((data: any) => {
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
    this.isMessageInitialized = true;
  }

  private initializeVideoCallListening(): void {
    if (this.isVideoCallInitialized && this.videoCallUnsubscribe) {
      return;
    }
    
    if (this.videoCallUnsubscribe) {
      this.videoCallUnsubscribe();
    }
    
    this.videoCallUnsubscribe = socketService.subscribeToChannel('video-calls', (data: any) => {
      if (data.event === 'VideoCallNotification' && data.data) {
        this.handleVideoCallNotification(data.data);
      } else if (data.type && (data.type.startsWith('video_call_'))) {
        this.handleVideoCallNotification(data);
      }
    });
    
    this.isVideoCallInitialized = true;
  }

  private initializeCanvasListening(): void {
    if (this.isCanvasInitialized && this.canvasUnsubscribe) {
      return;
    }
    
    if (this.canvasUnsubscribe) {
      this.canvasUnsubscribe();
    }
    
    this.canvasUnsubscribe = socketService.subscribeToChannel('canvas-sessions', (data: any) => {
      if (data.event === 'CanvasNotification' && data.data) {
        this.handleCanvasNotification(data.data);
      } else if (data.type && (data.type.startsWith('canvas_'))) {
        this.handleCanvasNotification(data);
      }
    });
    
    this.isCanvasInitialized = true;
    console.log('✅ Canvas listening initialized');
  }

  private handleMessageNotification(notification: any): void {
    if (!this.currentUser) return;
    
    const notificationKey = this.generateNotificationKey(notification.type, notification);
    
    if (this.isNotificationProcessed(notificationKey)) {
      return;
    }
    
    const messageNotification: IMessageNotification = {
      type: notification.type,
      message: notification.message,
      from_user: notification.from_user,
      to_user: notification.to_user,
      timestamp: notification.timestamp || new Date().toISOString()
    };
    
    const shouldProcessNotification = 
      (notification.type === 'message_received' && notification.message.to_user_id === this.currentUser.id) ||
      (notification.type === 'message_sent' && notification.message.from_user_id === this.currentUser.id) ||
      (notification.type === 'message_updated' && 
       (notification.message.from_user_id === this.currentUser.id || notification.message.to_user_id === this.currentUser.id)) ||
      (notification.type === 'message_failed' && notification.message.from_user_id === this.currentUser.id);
    
    if (shouldProcessNotification) {
      this.markNotificationProcessed(notificationKey);
      
      if (this.messageListeners[this.currentUser.id]) {
        this.messageListeners[this.currentUser.id].forEach(callback => {
          callback(messageNotification);
        });
      }
      
      this.triggerMessageToastNotification(messageNotification).catch(error => {
        console.error('Error triggering message toast notification:', error);
      });
    }
  }

  private handleVideoCallNotification(notification: any): void {
    if (!this.currentUser) return;
    
    const notificationKey = this.generateNotificationKey(notification.type, notification);
    
    if (this.isNotificationProcessed(notificationKey)) {
      return;
    }
    
    const videoCallNotification: IVideoCallNotification = {
      type: notification.type,
      callId: notification.callId,
      meetingId: notification.meetingId,
      token: notification.token,
      from_user: notification.from_user,
      to_user: notification.to_user,
      timestamp: notification.timestamp || new Date().toISOString()
    };
    
    const shouldProcessNotification = 
      (notification.type === 'video_call_invite' && notification.to_user?.id === this.currentUser.id) ||
      (notification.type === 'video_call_accepted' && notification.from_user?.id === this.currentUser.id) ||
      (notification.type === 'video_call_rejected' && notification.from_user?.id === this.currentUser.id) ||
      (notification.type === 'video_call_ended' && 
       (notification.from_user?.id === this.currentUser.id || notification.to_user?.id === this.currentUser.id));
    
    if (shouldProcessNotification) {
      this.markNotificationProcessed(notificationKey);
      
      if (this.videoCallListeners[this.currentUser.id]) {
        this.videoCallListeners[this.currentUser.id].forEach(callback => {
          callback(videoCallNotification);
        });
      }
      
      this.triggerVideoCallToastNotification(videoCallNotification).catch(error => {
        console.error('Error triggering video call toast notification:', error);
      });
    }
  }

  private handleCanvasNotification(notification: any): void {
    if (!this.currentUser) {
      return;
    }
    
    const notificationKey = this.generateNotificationKey(notification.type, notification);
    
    if (this.isNotificationProcessed(notificationKey)) {
      return;
    }
    
    const canvasNotification: ICanvasNotification = {
      type: notification.type,
      sessionId: notification.sessionId,
      from_user: notification.from_user,
      to_user: notification.to_user,
      sessionName: notification.sessionName,
      timestamp: notification.timestamp || new Date().toISOString()
    };
    
    const shouldProcessNotification = 
      (notification.type === 'canvas_invite' && notification.to_user?.id === this.currentUser.id) ||
      (notification.type === 'canvas_joined' && notification.from_user?.id === this.currentUser.id) ||
      (notification.type === 'canvas_left' && 
       (notification.from_user?.id === this.currentUser.id || notification.to_user?.id === this.currentUser.id)) ||
      (notification.type === 'canvas_ended' && 
       (notification.from_user?.id === this.currentUser.id || notification.to_user?.id === this.currentUser.id));
    
    if (shouldProcessNotification) {
      this.markNotificationProcessed(notificationKey);
      
      if (this.canvasListeners[this.currentUser.id]) {
        this.canvasListeners[this.currentUser.id].forEach(callback => {
          callback(canvasNotification);
        });
      }
      
      this.triggerCanvasToastNotification(canvasNotification).catch(error => {
        console.error('Error triggering canvas toast notification:', error);
      });
    }
  }

  private async triggerMessageToastNotification(notification: IMessageNotification): Promise<void> {
    if (notification.type === 'message_received') {
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
      if (this.toastSettings.messageFailed) {
        this.toastCallbacks.forEach(callback => {
          callback('error', 'Message Failed', 'Failed to send message');
        });
      }
    } else if (notification.type === 'message_sent') {
      if (this.currentUser && notification.message.from_user_id === this.currentUser.id && this.toastSettings.messageSuccess) {
        this.toastCallbacks.forEach(callback => {
          callback('success', 'Message Sent', 'Your message was sent successfully');
        });
      }
    }
  }

  private async triggerVideoCallToastNotification(notification: IVideoCallNotification): Promise<void> {
    if (notification.type === 'video_call_invite') {
      const options = {
        onClick: () => this.acceptVideoCall(notification),
        onDismiss: () => this.rejectVideoCall(notification),
        userData: notification.from_user,
        persistent: false,
        duration: 15000
      };
      
      this.toastCallbacks.forEach(callback => {
        callback('info', `Video call from ${notification.from_user.username}`, 'Click to join the call', options);
      });
    } else if (notification.type === 'video_call_accepted') {
      this.toastCallbacks.forEach(callback => {
        callback('success', 'Call Accepted', `${notification.to_user.username} joined the call`);
      });
    } else if (notification.type === 'video_call_rejected') {
      this.toastCallbacks.forEach(callback => {
        callback('warning', 'Call Declined', `${notification.to_user.username} declined the call`);
      });
    } else if (notification.type === 'video_call_ended') {
      this.toastCallbacks.forEach(callback => {
        callback('info', 'Call Ended', 'The video call has ended');
      });
    }
  }

  private async triggerCanvasToastNotification(notification: ICanvasNotification): Promise<void> {
    if (notification.type === 'canvas_invite') {
      const options = {
        onClick: () => this.acceptCanvasInvite(notification),
        onDismiss: () => this.rejectCanvasInvite(notification),
        userData: notification.from_user,
        persistent: false,
        duration: 15000
      };
      
      this.toastCallbacks.forEach(callback => {
        callback('info', `Canvas invite from ${notification.from_user.username}`, 
          `Join ${notification.sessionName || 'drawing session'}`, options);
      });
    } else if (notification.type === 'canvas_joined') {
      this.toastCallbacks.forEach(callback => {
        callback('success', 'Canvas Joined', `${notification.to_user.username} joined the drawing session`);
      });
    } else if (notification.type === 'canvas_left') {
      this.toastCallbacks.forEach(callback => {
        callback('warning', 'Canvas Left', `${notification.from_user.username} left the drawing session`);
      });
    } else if (notification.type === 'canvas_ended') {
      this.toastCallbacks.forEach(callback => {
        callback('info', 'Canvas Ended', 'The drawing session has ended');
      });
    }
  }

  private acceptCanvasInvite(notification: ICanvasNotification): void {
    if (this.canvasJoinCallback) {
      this.canvasJoinCallback(notification.sessionId, notification.sessionName);
    }
    
    this.sendCanvasResponse(notification.sessionId, 'joined', notification.from_user);
  }

  private rejectCanvasInvite(notification: ICanvasNotification): void {
    this.sendCanvasResponse(notification.sessionId, 'left', notification.from_user);
  }

  private acceptVideoCall(notification: IVideoCallNotification): void {
    if (this.videoModalOpenCallback) {
      this.videoModalOpenCallback(notification.meetingId, notification.token);
    }
    
    this.sendVideoCallResponse(notification.callId, 'accepted', notification.from_user);
  }

  private rejectVideoCall(notification: IVideoCallNotification): void {
    this.sendVideoCallResponse(notification.callId, 'rejected', notification.from_user);
  }

  public setChatOpenCallback(callback: (user: IUser) => void): void {
    this.chatOpenCallback = callback;
  }

  public setVideoModalOpenCallback(callback: (meetingId: string, token: string) => void): void {
    this.videoModalOpenCallback = callback;
  }

  public setCanvasJoinCallback(callback: (sessionId: string, sessionName?: string) => void): void {
    this.canvasJoinCallback = callback;
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
    this.toastSettings.messageSuccess = false;
    this.toastSettings.messageFailed = false;
  }

  public setChatClosed(userId: number): void {
    this.openChatUsers.delete(userId);
    if (this.openChatUsers.size === 0) {
      this.toastSettings.messageSuccess = true;
      this.toastSettings.messageFailed = true;
    }
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

  public subscribeToUserVideoCallNotifications(userId: number, callback: (notification: IVideoCallNotification) => void): () => void {
    if (!this.videoCallListeners[userId]) {
      this.videoCallListeners[userId] = [];
    }
    
    this.videoCallListeners[userId].push(callback);

    return () => {
      if (this.videoCallListeners[userId]) {
        this.videoCallListeners[userId] = this.videoCallListeners[userId].filter(cb => cb !== callback);
        
        if (this.videoCallListeners[userId].length === 0) {
          delete this.videoCallListeners[userId];
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

  public async sendVideoCallInvite(
    callId: string,
    meetingId: string,
    token: string,
    fromUser: IUser,
    toUsers: IUser[]
  ): Promise<void> {
    for (const toUser of toUsers) {
      const notificationData = {
        type: 'video_call_invite',
        callId,
        meetingId,
        token,
        from_user: fromUser,
        to_user: toUser,
        timestamp: new Date().toISOString()
      };

      socketService.broadcastVideoCallNotification(notificationData, toUser.id);
    }
  }

  private sendVideoCallResponse(
    callId: string,
    response: 'accepted' | 'rejected',
    fromUser: IUser
  ): void {
    const notificationData = {
      type: `video_call_${response}` as 'video_call_accepted' | 'video_call_rejected',
      callId,
      meetingId: '',
      token: '',
      from_user: this.currentUser!,
      to_user: fromUser,
      timestamp: new Date().toISOString()
    };

    socketService.broadcastVideoCallNotification(notificationData, fromUser.id);
  }

  private sendCanvasResponse(
    sessionId: string,
    response: 'joined' | 'left',
    fromUser: IUser
  ): void {
    const notificationData = {
      type: `canvas_${response}` as 'canvas_joined' | 'canvas_left',
      sessionId,
      from_user: this.currentUser!,
      to_user: fromUser,
      timestamp: new Date().toISOString()
    };

    socketService.broadcastCanvasNotification(notificationData);
  }

  public sendVideoCallEnd(callId: string, participants: IUser[]): void {
    for (const participant of participants) {
      const notificationData = {
        type: 'video_call_ended',
        callId,
        meetingId: '',
        token: '',
        from_user: this.currentUser!,
        to_user: participant,
        timestamp: new Date().toISOString()
      };

      socketService.broadcastVideoCallNotification(notificationData, participant.id);
    }
  }

  public async sendCanvasInvite(
    sessionId: string,
    sessionName: string,
    fromUser: IUser,
    toUsers: IUser[]
  ): Promise<void> {
    for (const toUser of toUsers) {
      const notificationData = {
        type: 'canvas_invite',
        sessionId,
        sessionName,
        from_user: fromUser,
        to_user: toUser,
        timestamp: new Date().toISOString()
      };

      socketService.broadcastCanvasNotification(notificationData);
    }
  }

  public sendCanvasEnd(sessionId: string, participants: IUser[]): void {
    for (const participant of participants) {
      const notificationData = {
        type: 'canvas_ended',
        sessionId,
        from_user: this.currentUser!,
        to_user: participant,
        timestamp: new Date().toISOString()
      };

      socketService.broadcastCanvasNotification(notificationData);
    }
  }

  public async getConversation(userId1: number, userId2: number): Promise<IMessage[]> {
    return MessageApi.getConversation(userId1, userId2);
  }

  public showToast(type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string, options?: any): void {
    this.toastCallbacks.forEach(callback => {
      callback(type, title, message, options);
    });
  }

  public isConnected(): boolean {
    return socketService.getConnectionStatus();
  }

  public subscribeToUserCanvasNotifications(userId: number, callback: (notification: ICanvasNotification) => void): () => void {
    if (!this.canvasListeners[userId]) {
      this.canvasListeners[userId] = [];
    }
    
    this.canvasListeners[userId].push(callback);

    return () => {
      if (this.canvasListeners[userId]) {
        this.canvasListeners[userId] = this.canvasListeners[userId].filter(cb => cb !== callback);
        
        if (this.canvasListeners[userId].length === 0) {
          delete this.canvasListeners[userId];
        }
      }
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;