import { FriendApi } from '../apis/friend-api';
import type { IFriend } from '../interfaces/IFriend';
import type { IUser } from '../interfaces/IUser';
import { socketService } from './socket-service';

export class FriendService {
  static async getFriendsWithUserData(userId: number): Promise<IFriend[]> {
    try {
      const friends = await FriendApi.getUserFriends(userId);
      return friends;
    } catch (error) {
      console.error('Error getting friends with user data:', error);
      throw error;
    }
  }

  static async getFriendRequestsWithUserData(userId: number): Promise<IFriend[]> {
    try {
      const requests = await FriendApi.getFriendRequests(userId);
      return requests;
    } catch (error) {
      console.error('Error getting friend requests with user data:', error);
      throw error;
    }
  }

  static async getSentRequestsWithUserData(userId: number): Promise<IFriend[]> {
    try {
      const sentRequests = await FriendApi.getSentRequests(userId);
      return sentRequests;
    } catch (error) {
      console.error('Error getting sent requests with user data:', error);
      throw error;
    }
  }

  static async searchAvailableUsers(
    query: string, 
    currentUserId: number, 
    existingFriends: IFriend[] = [], 
    existingRequests: IFriend[] = []
  ): Promise<IUser[]> {
    try {
      const results = await FriendApi.searchUsers(query);
      
      const friendIds = new Set(existingFriends.map(f => f.friend?.id).filter(Boolean));
      const requestUserIds = new Set(existingRequests.map(r => r.user?.id).filter(Boolean));
      const requestFriendIds = new Set(existingRequests.map(r => r.friend?.id).filter(Boolean));
      
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

  static async sendFriendRequest(fromUserId: number, toUserId: number): Promise<IFriend | null> {
    try {
      if (fromUserId === toUserId) {
        throw new Error('You cannot send a friend request to yourself.');
      }

      const friendship = await FriendApi.createFriendRequest({
        user_id: fromUserId,
        friend_id: toUserId,
        status: 'pending'
      });

      if (friendship) {
        socketService.broadcastFriendNotification(
          'request_sent',
          fromUserId,
          toUserId,
          friendship
        );
      }

      return friendship;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  static async acceptFriendRequest(requestId: number): Promise<void> {
    try {
      const friendship = await FriendApi.getFriendById(requestId);
      await FriendApi.updateFriend(requestId, 'accepted');
      
      socketService.broadcastFriendNotification(
        'request_accepted',
        friendship.user_id,
        friendship.friend_id,
        { id: requestId, status: 'accepted' }
      );
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  static async rejectFriendRequest(requestId: number): Promise<void> {
    try {
      const friendship = await FriendApi.getFriendById(requestId);
      await FriendApi.updateFriend(requestId, 'rejected');
      
      socketService.broadcastFriendNotification(
        'request_rejected',
        friendship.user_id,
        friendship.friend_id,
        { id: requestId, status: 'rejected' }
      );
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  static async removeFriend(friendshipId: number): Promise<void> {
    try {
      const friendship = await FriendApi.getFriendById(friendshipId);
      await FriendApi.deleteFriend(friendshipId);
      
      socketService.broadcastFriendNotification(
        'friend_removed',
        friendship.user_id,
        friendship.friend_id,
        { id: friendshipId }
      );
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  static async updateFriendshipStatus(
    userId: number, 
    friendId: number, 
    status: 'accepted' | 'rejected'
  ): Promise<void> {
    try {
      await FriendApi.updateFriendshipStatus(userId, friendId, status);
      
      const action = status === 'accepted' ? 'request_accepted' : 'request_rejected';
      socketService.broadcastFriendNotification(
        action,
        userId,
        friendId,
        { user_id: userId, friend_id: friendId, status }
      );
    } catch (error) {
      console.error('Error updating friendship status:', error);
      throw error;
    }
  }
}
