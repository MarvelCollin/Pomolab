import { useEffect, useCallback } from 'react';
import socketService from '../services/socket-service';
import type { IUser } from '../interfaces/IUser';

export interface FriendNotificationCallbacks {
  onFriendRequestSent?: (data: any) => void;
  onFriendRequestReceived?: (data: any) => void;
  onFriendRequestAccepted?: (data: any) => void;
  onFriendRequestRejected?: (data: any) => void;
  onFriendRemoved?: (data: any) => void;
}

export const useFriendNotifications = (
  currentUser: IUser | null,
  callbacks: FriendNotificationCallbacks
) => {
  const stableHandleFriendNotification = useCallback((data: any) => {
    if (!currentUser) return;

    const { action, user_id, friend_id, user_data, friend_data, friendship_data } = data;
    const isCurrentUser = user_id === currentUser.id;
    const isFriendOfCurrentUser = friend_id === currentUser.id;

    switch (action) {
      case 'request_sent':
        if (isCurrentUser && callbacks.onFriendRequestSent) {
          callbacks.onFriendRequestSent({
            action,
            user_data,
            friend_data,
            friendship_data,
            message: `Friend request sent to ${friend_data?.username || 'user'}`
          });
        } else if (isFriendOfCurrentUser && callbacks.onFriendRequestReceived) {
          callbacks.onFriendRequestReceived({
            action,
            user_data,
            friend_data,
            friendship_data,
            message: `${user_data?.username || 'Someone'} sent you a friend request`
          });
        }
        break;

      case 'request_accepted':
        if ((isCurrentUser || isFriendOfCurrentUser) && callbacks.onFriendRequestAccepted) {
          const otherUser = isCurrentUser ? friend_data : user_data;
          callbacks.onFriendRequestAccepted({
            action,
            user_data,
            friend_data,
            friendship_data,
            message: isCurrentUser 
              ? `Your friend request to ${otherUser?.username || 'user'} was accepted`
              : `You are now friends with ${otherUser?.username || 'user'}`
          });
        }
        break;

      case 'request_rejected':
        if (isCurrentUser && callbacks.onFriendRequestRejected) {
          callbacks.onFriendRequestRejected({
            action,
            user_data,
            friend_data,
            friendship_data,
            message: `Your friend request to ${friend_data?.username || 'user'} was rejected`
          });
        }
        break;

      case 'friend_removed':
        if ((isCurrentUser || isFriendOfCurrentUser) && callbacks.onFriendRemoved) {
          const otherUser = isCurrentUser ? friend_data : user_data;
          callbacks.onFriendRemoved({
            action,
            user_data,
            friend_data,
            friendship_data,
            message: `You are no longer friends with ${otherUser?.username || 'user'}`
          });
        }
        break;
    }
  }, [currentUser, callbacks]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = socketService.listenToFriendNotifications(stableHandleFriendNotification);

    return unsubscribe;
  }, [currentUser, stableHandleFriendNotification]);
};
