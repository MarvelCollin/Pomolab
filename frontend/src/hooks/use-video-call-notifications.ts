import { useEffect } from 'react';
import { notificationService } from '../services/notification-service';
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
  const { ToastContainer, showSuccess, showError, showWarning, showInfo } = useToast();

  useEffect(() => {
    if (currentUser) {
      notificationService.setCurrentUser(currentUser);
    }

    const unsubscribe = notificationService.subscribeToToastNotifications((type, title, message, options) => {
      switch (type) {
        case 'success':
          showSuccess(title, message, options);
          break;
        case 'error':
          showError(title, message, options);
          break;
        case 'warning':
          showWarning(title, message, options);
          break;
        case 'info':
          showInfo(title, message, options);
          break;
        default:
          showInfo(title, message, options);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (onJoinVideoCall) {
      notificationService.setVideoModalOpenCallback(onJoinVideoCall);
    }
  }, [onJoinVideoCall]);

  return { ToastContainer };
};