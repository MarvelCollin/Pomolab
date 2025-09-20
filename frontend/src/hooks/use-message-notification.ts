import { useEffect } from 'react';
import { notificationService } from '../services/notification-service';
import { useToast } from '../components/common/toast';
import type { IUser } from '../interfaces/IUser';

interface UseMessageNotificationsProps {
  onOpenChat?: (user: IUser) => void;
  currentUser?: IUser | null;
}

export const useMessageNotifications = ({ onOpenChat, currentUser }: UseMessageNotificationsProps = {}) => {
  const { showInfo, showError, ToastContainer } = useToast();

  useEffect(() => {
    if (currentUser) {
      notificationService.setCurrentUser(currentUser);
    }
    
    if (onOpenChat) {
      notificationService.setChatOpenCallback(onOpenChat);
    }

    const unsubscribe = notificationService.subscribeToToastNotifications((type, title, message, options) => {
      if (type === 'info') {
        showInfo(title, message, options);
      } else if (type === 'error') {
        showError(title, message, options);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id, onOpenChat]);

  return { ToastContainer };
};