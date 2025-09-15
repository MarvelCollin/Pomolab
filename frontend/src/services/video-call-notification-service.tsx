import { socketService } from './socket-service';
import type { IUser } from '../interfaces/IUser';

export interface IVideoCallNotification {
  type: 'video_call_invite' | 'video_call_accepted' | 'video_call_rejected' | 'video_call_ended';
  callId: string;
  meetingId: string;
  token: string;
  from_user: IUser;
  to_user: IUser;
  timestamp: string;
}

class VideoCallNotificationService {
  private videoCallListeners: { [userId: number]: ((notification: IVideoCallNotification) => void)[] } = {};
  private toastCallbacks: ((type: string, title: string, message?: string, options?: any) => void)[] = [];
  private currentUser: IUser | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeVideoCallListening();
  }

  public setCurrentUser(user: IUser | null): void {
    this.currentUser = user;
    
    if (!this.isInitialized) {
      this.initializeVideoCallListening();
    }
  }

  private initializeVideoCallListening(): void {
    if (this.isInitialized) {
      return;
    }
    
    socketService.subscribeToChannel('video-calls', (data: any) => {
      if (data.event === 'VideoCallNotification' && data.data) {
        this.handleVideoCallNotification(data.data);
      } else if (data.type && (data.type.startsWith('video_call_'))) {
        this.handleVideoCallNotification(data);
      }
    });
    
    this.isInitialized = true;
  }

  private handleVideoCallNotification(notification: any): void {
    const videoCallNotification: IVideoCallNotification = {
      type: notification.type,
      callId: notification.callId,
      meetingId: notification.meetingId,
      token: notification.token,
      from_user: notification.from_user,
      to_user: notification.to_user,
      timestamp: notification.timestamp || new Date().toISOString()
    };
    
    if (this.currentUser && notification.to_user?.id === this.currentUser.id) {
      if (this.videoCallListeners[this.currentUser.id]) {
        this.videoCallListeners[this.currentUser.id].forEach(callback => {
          callback(videoCallNotification);
        });
      }
      
      this.triggerToastNotification(videoCallNotification).catch(error => {
        console.error('Error triggering video call toast notification:', error);
      });
    }
  }

  private async triggerToastNotification(notification: IVideoCallNotification): Promise<void> {
    if (notification.type === 'video_call_invite') {
      const options = {
        onClick: () => this.acceptVideoCall(notification),
        userData: notification.from_user,
        persistent: true,
        duration: 30000
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

  private acceptVideoCall(notification: IVideoCallNotification): void {
    if (this.videoCallAcceptCallback) {
      this.videoCallAcceptCallback(notification.meetingId, notification.token);
    }
    
    this.sendVideoCallResponse(notification.callId, 'accepted', notification.from_user);
  }

  private videoCallAcceptCallback: ((meetingId: string, token: string) => void) | null = null;

  public setVideoCallAcceptCallback(callback: (meetingId: string, token: string) => void): void {
    this.videoCallAcceptCallback = callback;
  }

  public subscribeToToastNotifications(callback: (type: string, title: string, message?: string, options?: any) => void): () => void {
    this.toastCallbacks.push(callback);
    
    return () => {
      this.toastCallbacks = this.toastCallbacks.filter(cb => cb !== callback);
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

  public isConnected(): boolean {
    return socketService.getConnectionStatus();
  }
}

export const videoCallNotificationService = new VideoCallNotificationService();
export default videoCallNotificationService;