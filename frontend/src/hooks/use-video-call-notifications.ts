import { useEffect } from 'react';
import { videoCallNotificationService } from '../services/video-call-notification-service';
import { useToast } from '../components/common/toast';
import type { IUser } from '../interfaces/IUser';

interface UseVideoCallNotificationsProps {
  onJoinVideoCall?: (meetingId: string, token: string) => void;
  currentUser?: IUser | null;
}

export const useVideoCallNotifications = ({ 
  onJoinVideoCall, 
  currentUser 
}: UseVideoCallNotificationsProps = {}) => {
  const { ToastContainer } = useToast();

  useEffect(() => {
    if (currentUser) {
      videoCallNotificationService.setCurrentUser(currentUser);
    }
    
    if (onJoinVideoCall) {
      videoCallNotificationService.setVideoCallAcceptCallback(onJoinVideoCall);
    }

    const unsubscribe = videoCallNotificationService.subscribeToToastNotifications((type, title, message, options) => {
      console.log('Video call notification:', { type, title, message, options });
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id, onJoinVideoCall]);

  return { ToastContainer };
};