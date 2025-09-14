import { FriendApi } from '../apis/friend-api';
import type { IFriend } from '../interfaces/IFriend';
import type { IUser } from '../interfaces/IUser';
import { WebSocketBroadcast } from './websocket-broadcast';

export interface ExtendedFriend extends IFriend {
  user?: IUser;
  friend?: IUser;
}

export class FriendService {
  static async getFriendsWithUserData(userId: number): Promise<ExtendedFriend[]> {
    try {
      const [friends, allUsers] = await Promise.all([
        FriendApi.getUserFriends(userId),
        FriendApi.getAllUsers()
      ]);

      const userMap = new Map(allUsers.map(user => [user.id, user]));

      return friends.map(friendship => ({
        ...friendship,
        friend: userMap.get(
          friendship.user_id === userId ? friendship.friend_id : friendship.user_id
        )
      }));
    } catch (error) {
      console.error('Error getting friends with user data:', error);
      throw error;
    }
  }

  static async getFriendRequestsWithUserData(userId: number): Promise<ExtendedFriend[]> {
    try {
      const [requests, allUsers] = await Promise.all([
        FriendApi.getFriendRequests(userId),
        FriendApi.getAllUsers()
      ]);

      const userMap = new Map(allUsers.map(user => [user.id, user]));

      return requests.map(request => ({
        ...request,
        user: userMap.get(request.user_id)
      }));
    } catch (error) {
      console.error('Error getting friend requests with user data:', error);
      throw error;
    }
  }

  static async getSentRequestsWithUserData(userId: number): Promise<ExtendedFriend[]> {
    try {
      const [sentRequests, allUsers] = await Promise.all([
        FriendApi.getSentRequests(userId),
        FriendApi.getAllUsers()
      ]);

      const userMap = new Map(allUsers.map(user => [user.id, user]));

      return sentRequests.map(sent => ({
        ...sent,
        friend: userMap.get(sent.friend_id)
      }));
    } catch (error) {
      console.error('Error getting sent requests with user data:', error);
      throw error;
    }
  }

  static async searchAvailableUsers(
    query: string, 
    currentUserId: number, 
    existingFriends: ExtendedFriend[] = [], 
    existingRequests: ExtendedFriend[] = []
  ): Promise<IUser[]> {
    try {
      const results = await FriendApi.searchUsers(query);
      
      // Create sets of user IDs to exclude
      const friendIds = new Set(existingFriends.map(f => f.friend?.id).filter(Boolean));
      const requestUserIds = new Set(existingRequests.map(r => r.user?.id).filter(Boolean));
      const requestFriendIds = new Set(existingRequests.map(r => r.friend?.id).filter(Boolean));
      
      // Filter out current user and existing connections
      return results.filter(user => 
        user.id !== currentUserId && 
        !friendIds.has(user.id) && 
        !requestUserIds.has(user.id) && 
        !requestFriendIds.has(user.id)
      );
    } catch (error) {
      console.error('Error searching available users:', error);
      throw error;
    }
  }

  static async sendFriendRequest(fromUserId: number, toUserId: number, userData?: IUser, friendData?: IUser): Promise<IFriend | null> {
    try {
      const friendship = await FriendApi.createFriendRequest({
        user_id: fromUserId,
        friend_id: toUserId,
        status: 'pending'
      });

      if (friendship) {
        await WebSocketBroadcast.broadcastFriendNotification({
          action: 'request_sent',
          user_id: fromUserId,
          friend_id: toUserId,
          friendship_data: friendship,
          user_data: userData,
          friend_data: friendData
        });
      }

      return friendship;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  static async acceptFriendRequest(requestId: number, userId: number, friendId: number, userData?: IUser, friendData?: IUser): Promise<void> {
    try {
      await FriendApi.updateFriend(requestId, 'accepted');

      await WebSocketBroadcast.broadcastFriendNotification({
        action: 'request_accepted',
        user_id: userId,
        friend_id: friendId,
        friendship_data: { id: requestId, status: 'accepted' },
        user_data: userData,
        friend_data: friendData
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  static async rejectFriendRequest(requestId: number, userId: number, friendId: number, userData?: IUser, friendData?: IUser): Promise<void> {
    try {
      await FriendApi.deleteFriend(requestId);

      await WebSocketBroadcast.broadcastFriendNotification({
        action: 'request_rejected',
        user_id: userId,
        friend_id: friendId,
        friendship_data: { id: requestId, status: 'rejected' },
        user_data: userData,
        friend_data: friendData
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  static async removeFriend(friendshipId: number, userId: number, friendId: number, userData?: IUser, friendData?: IUser): Promise<void> {
    try {
      await FriendApi.deleteFriend(friendshipId);

      await WebSocketBroadcast.broadcastFriendNotification({
        action: 'friend_removed',
        user_id: userId,
        friend_id: friendId,
        friendship_data: { id: friendshipId },
        user_data: userData,
        friend_data: friendData
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  static async updateFriendshipStatus(
    userId: number, 
    friendId: number, 
    status: 'accepted' | 'rejected',
    userData?: IUser,
    friendData?: IUser
  ): Promise<void> {
    try {
      await FriendApi.updateFriendshipStatus(userId, friendId, status);

      const action = status === 'accepted' ? 'request_accepted' : 'request_rejected';
      await WebSocketBroadcast.broadcastFriendNotification({
        action,
        user_id: userId,
        friend_id: friendId,
        friendship_data: { status },
        user_data: userData,
        friend_data: friendData
      });
    } catch (error) {
      console.error('Error updating friendship status:', error);
      throw error;
    }
  }
}
