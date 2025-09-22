import { useEffect, useCallback, useRef } from 'react';
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
  const currentUserRef = useRef(currentUser);
  const onOpenChatRef = useRef(onOpenChat);
  const onJoinVideoCallRef = useRef(onJoinVideoCall);
  const friendCallbacksRef = useRef(friendCallbacks);

  currentUserRef.current = currentUser;
  onOpenChatRef.current = onOpenChat;
  onJoinVideoCallRef.current = onJoinVideoCall;
  friendCallbacksRef.current = friendCallbacks;

  const handleFriendNotification = useCallback((data: any) => {
    if (!currentUserRef.current || !friendCallbacksRef.current) return;

    const { action, user_id, friend_id, user_data, friend_data } = data;
    const isCurrentUser = user_id === currentUserRef.current.id;
    const isFriendOfCurrentUser = friend_id === currentUserRef.current.id;

    switch (action) {
      case 'request_sent':
        if (isCurrentUser && friendCallbacksRef.current.onFriendRequestSent) {
          const message = `Friend request sent to ${friend_data?.username || 'user'}`;
          friendCallbacksRef.current.onFriendRequestSent({ action, user_data, friend_data, message });
          showSuccess('Friend Request Sent', message);
        } else if (isFriendOfCurrentUser && friendCallbacksRef.current.onFriendRequestReceived) {
          const message = `${user_data?.username || 'Someone'} sent you a friend request`;
          friendCallbacksRef.current.onFriendRequestReceived({ action, user_data, friend_data, message });
          showInfo('Friend Request Received', message);
        }
        break;

      case 'request_accepted':
        if ((isCurrentUser || isFriendOfCurrentUser) && friendCallbacksRef.current.onFriendRequestAccepted) {
          const otherUser = isCurrentUser ? friend_data : user_data;
          const message = `You are now friends with ${otherUser?.username || 'user'}`;
          friendCallbacksRef.current.onFriendRequestAccepted({ action, user_data, friend_data, message });
          showSuccess('Friend Request Accepted', message);
        }
        break;

      case 'request_rejected':
        if ((isCurrentUser || isFriendOfCurrentUser) && friendCallbacksRef.current.onFriendRequestRejected) {
          const message = `Friend request ${isCurrentUser ? 'was rejected' : 'rejected'}`;
          friendCallbacksRef.current.onFriendRequestRejected({ action, user_data, friend_data, message });
          showWarning('Friend Request Rejected', message);
        }
        break;

      case 'friend_removed':
        if ((isCurrentUser || isFriendOfCurrentUser) && friendCallbacksRef.current.onFriendRemoved) {
          const message = `You are no longer friends with ${(isCurrentUser ? friend_data : user_data)?.username || 'user'}`;
          friendCallbacksRef.current.onFriendRemoved({ action, user_data, friend_data, message });
          showError('Friend Removed', message);
        }
        break;
    }
  }, [showSuccess, showError, showWarning, showInfo]);

  useEffect(() => {
    if (currentUserRef.current) {
      notificationService.setCurrentUser(currentUserRef.current);
    }
    
    if (onOpenChatRef.current) {
      notificationService.setChatOpenCallback(onOpenChatRef.current);
    }

    if (onJoinVideoCallRef.current) {
      notificationService.setVideoModalOpenCallback(onJoinVideoCallRef.current);
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
    if (friendCallbacksRef.current && currentUserRef.current) {
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
  }, [handleFriendNotification, showSuccess, showError, showWarning, showInfo]);

  return { ToastContainer, showSuccess, showError, showWarning, showInfo };
};