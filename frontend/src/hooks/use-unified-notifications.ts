import { useEffect, useCallback } from 'react';
import { notificationService } from '../services/notification-service';
import { useToast } from '../components/common/toast';
import type { IUser } from '../interfaces/IUser';

export interface FriendNotificationCallbacks {
  onFriendRequestSent?: (data: any) => void;
  onFriendRequestReceived?: (data: any) => void;
  onFriendRequestAccepted?: (data: any) => void;
  onFriendRequestRejected?: (data: any) => void;
  onFriendRemoved?: (data: any) => void;
}

interface UseUnifiedNotificationsProps {
  onOpenChat?: (user: IUser) => void;
  onJoinVideoCall?: (meetingId: string, token: string) => void;
  friendCallbacks?: FriendNotificationCallbacks;
  currentUser?: IUser | null;
}

export const useUnifiedNotifications = ({ 
  onOpenChat, 
  onJoinVideoCall,
  friendCallbacks,
  currentUser 
}: UseUnifiedNotificationsProps = {}) => {
  const { ToastContainer, showSuccess, showError, showWarning, showInfo } = useToast();

  const handleFriendNotification = useCallback((data: any) => {
    if (!currentUser || !friendCallbacks) return;

    const { action, user_id, friend_id, user_data, friend_data } = data;
    const isCurrentUser = user_id === currentUser.id;
    const isFriendOfCurrentUser = friend_id === currentUser.id;

    switch (action) {
      case 'request_sent':
        if (isCurrentUser && friendCallbacks.onFriendRequestSent) {
          const message = `Friend request sent to ${friend_data?.username || 'user'}`;
          friendCallbacks.onFriendRequestSent({ action, user_data, friend_data, message });
          showSuccess('Friend Request Sent', message);
        } else if (isFriendOfCurrentUser && friendCallbacks.onFriendRequestReceived) {
          const message = `${user_data?.username || 'Someone'} sent you a friend request`;
          friendCallbacks.onFriendRequestReceived({ action, user_data, friend_data, message });
          showInfo('Friend Request Received', message);
        }
        break;

      case 'request_accepted':
        if ((isCurrentUser || isFriendOfCurrentUser) && friendCallbacks.onFriendRequestAccepted) {
          const otherUser = isCurrentUser ? friend_data : user_data;
          const message = `You are now friends with ${otherUser?.username || 'user'}`;
          friendCallbacks.onFriendRequestAccepted({ action, user_data, friend_data, message });
          showSuccess('Friend Request Accepted', message);
        }
        break;

      case 'request_rejected':
        if ((isCurrentUser || isFriendOfCurrentUser) && friendCallbacks.onFriendRequestRejected) {
          const message = `Friend request ${isCurrentUser ? 'was rejected' : 'rejected'}`;
          friendCallbacks.onFriendRequestRejected({ action, user_data, friend_data, message });
          showWarning('Friend Request Rejected', message);
        }
        break;

      case 'friend_removed':
        if ((isCurrentUser || isFriendOfCurrentUser) && friendCallbacks.onFriendRemoved) {
          const message = `You are no longer friends with ${(isCurrentUser ? friend_data : user_data)?.username || 'user'}`;
          friendCallbacks.onFriendRemoved({ action, user_data, friend_data, message });
          showError('Friend Removed', message);
        }
        break;
    }
  }, [currentUser, friendCallbacks, showSuccess, showError, showWarning, showInfo]);

  useEffect(() => {
    if (currentUser) {
      notificationService.setCurrentUser(currentUser);
    }
    
    if (onOpenChat) {
      notificationService.setChatOpenCallback(onOpenChat);
    }

    if (onJoinVideoCall) {
      notificationService.setVideoModalOpenCallback(onJoinVideoCall);
    }

    const unsubscribeToast = notificationService.subscribeToToastNotifications((type, title, message, options) => {
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

    let unsubscribeFriend: (() => void) | undefined;
    if (friendCallbacks && currentUser) {
      import('../services/socket-service').then(({ default: socketService }) => {
        unsubscribeFriend = socketService.listenToFriendNotifications(handleFriendNotification);
      });
    }

    return () => {
      unsubscribeToast();
      if (unsubscribeFriend) {
        unsubscribeFriend();
      }
    };
  }, [currentUser?.id, onOpenChat, onJoinVideoCall, handleFriendNotification, friendCallbacks]);

  return { ToastContainer, showSuccess, showError, showWarning, showInfo };
};