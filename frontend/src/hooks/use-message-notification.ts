import { useEffect } from 'react';
import { messageService } from '../services/message-service';
import { useToast } from '../components/common/toast';

export const useMessageNotifications = () => {
  const { showInfo, showError } = useToast();

  useEffect(() => {
    const unsubscribe = messageService.subscribeToToastNotifications((type, title, message) => {
      if (type === 'info') {
        showInfo(title, message);
      } else if (type === 'error') {
        showError(title, message);
      }
    });

    return unsubscribe;
  }, [showInfo, showError]);
};