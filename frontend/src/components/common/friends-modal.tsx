import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  X, 
  Search, 
  UserPlus, 
  Check, 
  X as XIcon, 
  Clock,
  User,
  Trash2,
  Loader2,
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import type { IFriend } from '../../interfaces/IFriend';
import type { IUser } from '../../interfaces/IUser';
import { FriendApi } from '../../apis/friend-api';
import { FriendService } from '../../services/friend-service';
import { useDebounce } from '../../hooks/use-debounce';
import { useToast } from './toast';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: IUser | null;
  onOpenChat?: (user: IUser) => void;
}

function FriendsModal({ isOpen, onClose, currentUser, onOpenChat }: FriendsModalProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [friends, setFriends] = useState<IFriend[]>([]);
  const [friendRequests, setFriendRequests] = useState<IFriend[]>([]);
  const [sentRequests, setSentRequests] = useState<IFriend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendQuery, setAddFriendQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [sendingRequestTo, setSendingRequestTo] = useState<number | null>(null);
  const [acceptingRequest, setAcceptingRequest] = useState<number | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<number | null>(null);
  const [removingFriend, setRemovingFriend] = useState<number | null>(null);
  
  const debouncedSearchQuery = useDebounce(addFriendQuery, 300);

  const { showSuccess, showError, ToastContainer } = useToast();

  const loadFriendsData = useCallback(async (showToast: boolean = false) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [friendsResponse, requestsResponse, sentResponse] = await Promise.all([
        FriendApi.getUserFriends(currentUser.id).catch(err => {
          console.error('Failed to fetch user friends:', err);
          return [];
        }),
        FriendApi.getFriendRequests(currentUser.id).catch(err => {
          console.error('Failed to fetch friend requests:', err);
          return [];
        }),
        FriendApi.getSentRequests(currentUser.id).catch(err => {
          console.error('Failed to fetch sent requests:', err);
          return [];
        })
      ]);

      const friendsData = Array.isArray(friendsResponse) ? friendsResponse : [];
      const requestsData = Array.isArray(requestsResponse) ? requestsResponse : [];
      const sentData = Array.isArray(sentResponse) ? sentResponse : [];

      if (friendsData.length === 0 && requestsData.length === 0 && sentData.length === 0) {
        if (showToast) {
          showError('Unable to load friends data', 'Please check your connection and try again');
        }
        return;
      }

      const validFriends: IFriend[] = friendsData
        .filter(friendship => friendship && typeof friendship === 'object' && friendship.friend);

      const validRequests: IFriend[] = requestsData
        .filter(request => request && typeof request === 'object' && request.user);

      const validSentRequests: IFriend[] = sentData
        .filter(sent => sent && typeof sent === 'object' && sent.friend);
      
      setFriends(validFriends);
      setFriendRequests(validRequests);
      setSentRequests(validSentRequests);

      if (showToast) {
        showSuccess('Friends data refreshed', `Loaded ${validFriends.length} friends and ${validRequests.length} requests`);
      }
    } catch (err) {
      const errorMessage = 'Failed to load friends data';
      setError(errorMessage);
      console.error('Error loading friends:', err);
      if (showToast) {
        showError(errorMessage, 'Please try again');
      }
      setFriends([]);
      setFriendRequests([]);
      setSentRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, showSuccess, showError]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearchQuery.trim() || !currentUser) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const searchResponse = await FriendApi.searchUsers(debouncedSearchQuery);
        
        const results = Array.isArray(searchResponse) ? searchResponse : [];
        
        const filteredResults = results.filter(user => 
          user && 
          typeof user === 'object' && 
          user.id !== currentUser.id
        );
        
        setSearchResults(filteredResults);
      } catch (err) {
        console.error('Error searching users:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearchQuery, currentUser]);

  const filteredSearchResults = searchResults.filter(user => {
    const friendIds = friends.map(f => f.friend?.id).filter(Boolean);
    const requestIds = [...friendRequests.map(r => r.user?.id), ...sentRequests.map(s => s.friend?.id)].filter(Boolean);
    
    return !friendIds.includes(user.id) && !requestIds.includes(user.id);
  });

  const handleSendFriendRequest = async (userId: number) => {
    if (!currentUser || sendingRequestTo === userId) return;
    
    setSendingRequestTo(userId);
    
    try {
      await FriendService.sendFriendRequest(currentUser.id, userId);
      
      const targetUser = searchResults.find(user => user.id === userId);
      showSuccess('Friend request sent', `Request sent to ${targetUser?.username || 'user'}`);
      
      await loadFriendsData();
      setAddFriendQuery('');
      setSearchResults([]);
    } catch (err) {
      const errorMessage = 'Failed to send friend request';
      setError(errorMessage);
      showError(errorMessage, 'Please try again');
      console.error('Error sending friend request:', err);
    } finally {
      setSendingRequestTo(null);
    }
  };

  const handleAcceptRequest = async (friendId: number) => {
    if (acceptingRequest === friendId) return;
    
    setAcceptingRequest(friendId);
    
    try {
      await FriendService.acceptFriendRequest(friendId);
      
      const request = friendRequests.find(r => r.id === friendId);
      showSuccess('Friend request accepted', `You are now friends with ${request?.user?.username || 'user'}`);
      
      await loadFriendsData();
    } catch (err) {
      const errorMessage = 'Failed to accept friend request';
      setError(errorMessage);
      showError(errorMessage, 'Please try again');
      console.error('Error accepting friend request:', err);
    } finally {
      setAcceptingRequest(null);
    }
  };

  const handleRejectRequest = async (friendId: number) => {
    if (rejectingRequest === friendId) return;
    
    setRejectingRequest(friendId);
    
    try {
      await FriendService.rejectFriendRequest(friendId);
      
      const request = friendRequests.find(r => r.id === friendId);
      showSuccess('Friend request rejected', `Rejected request from ${request?.user?.username || 'user'}`);
      
      await loadFriendsData();
    } catch (err) {
      const errorMessage = 'Failed to reject friend request';
      setError(errorMessage);
      showError(errorMessage, 'Please try again');
      console.error('Error rejecting friend request:', err);
    } finally {
      setRejectingRequest(null);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    if (removingFriend === friendId) return;
    
    setRemovingFriend(friendId);
    
    try {
      await FriendService.removeFriend(friendId);
      
      const friend = friends.find(f => f.id === friendId);
      showSuccess('Friend removed', `Removed ${friend?.friend?.username || 'user'} from friends`);
      
      await loadFriendsData();
    } catch (err) {
      const errorMessage = 'Failed to remove friend';
      setError(errorMessage);
      showError(errorMessage, 'Please try again');
      console.error('Error removing friend:', err);
    } finally {
      setRemovingFriend(null);
    }
  };

  const handleOpenChat = (user: IUser) => {
    if (onOpenChat) {
      onOpenChat(user);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      loadFriendsData();
    }
  }, [isOpen, currentUser, loadFriendsData]);

  const filteredFriends = friends.filter(friend =>
    friend.friend && 
    friend.friend.id !== currentUser?.id &&
    (friend.friend?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.friend?.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderUserCard = (user: IUser, actions?: React.ReactNode) => (
    <div
      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200"
    >
      <div className="relative">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
          />
        ) : (
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/20">
            <User className="w-5 h-5 text-white/70" />
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white/20" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{user.username}</p>
        <p className="text-white/60 text-xs truncate">{user.email}</p>
      </div>
      
      {actions}
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        <motion.div
          className="relative w-full max-w-2xl max-h-[80vh] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-white" />
              <h2 className="text-white font-semibold text-lg">Friends</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadFriendsData(true)}
                disabled={loading}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh friends data"
              >
                <RefreshCw className={`w-5 h-5 text-white/60 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-white/10">
            {[
              { id: 'friends', label: 'Friends', count: friends.length },
              { id: 'requests', label: 'Requests', count: friendRequests.length },
              { id: 'add', label: 'Add Friends', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {tab.label}
                  {tab.count !== null && (
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                    layoutId="activeTab"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg m-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {activeTab === 'friends' && (
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 outline-none focus:border-white/40 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-white/60 text-sm">Loading friends...</p>
                    </div>
                  ) : filteredFriends.length > 0 ? (
                    filteredFriends.map((friend) => (
                      friend.friend && (
                        <div key={friend.id}>
                          {renderUserCard(
                            friend.friend,
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenChat(friend.friend!)}
                                className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                                title="Start chat"
                              >
                                <MessageCircle className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                              </button>
                              <button
                                onClick={() => handleRemoveFriend(friend.id)}
                                disabled={removingFriend === friend.id}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove friend"
                              >
                                {removingFriend === friend.id ? (
                                  <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-white/40 mx-auto mb-3" />
                      <p className="text-white/60 text-sm">No friends yet</p>
                      <p className="text-white/40 text-xs mt-1">Add some friends to get started!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-white/60 text-sm">Loading requests...</p>
                    </div>
                  ) : friendRequests.length > 0 ? (
                    friendRequests.map((request) => (
                      request.user && (
                        <div key={request.id}>
                          {renderUserCard(
                            request.user,
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                disabled={acceptingRequest === request.id}
                                className="p-2 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Accept request"
                              >
                                {acceptingRequest === request.id ? (
                                  <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4 text-green-400 hover:text-green-300" />
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                disabled={rejectingRequest === request.id}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reject request"
                              >
                                {rejectingRequest === request.id ? (
                                  <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                                ) : (
                                  <XIcon className="w-4 h-4 text-red-400 hover:text-red-300" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-white/40 mx-auto mb-3" />
                      <p className="text-white/60 text-sm">No pending requests</p>
                      <p className="text-white/40 text-xs mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>

                {sentRequests.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-white/80 font-medium text-sm mb-3">Sent Requests</h3>
                    <div className="space-y-2">
                      {sentRequests.map((request) => (
                        request.friend && (
                          <div key={request.id}>
                            {renderUserCard(
                              request.friend,
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400 text-xs">Pending</span>
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'add' && (
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Search for users to add as friends
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        placeholder="Type username or email to search..."
                        value={addFriendQuery}
                        onChange={(e) => setAddFriendQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 outline-none focus:border-white/40 transition-colors"
                      />
                      {searchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  {filteredSearchResults.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <h4 className="text-white/80 text-sm font-medium">Search Results</h4>
                      {filteredSearchResults.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/20">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-white/70" />
                              )}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{user.username}</p>
                              <p className="text-white/60 text-xs">{user.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSendFriendRequest(user.id)}
                            disabled={sendingRequestTo === user.id}
                            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingRequestTo === user.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UserPlus className="w-3 h-3" />
                            )}
                            {sendingRequestTo === user.id ? 'Sending...' : 'Add Friend'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {debouncedSearchQuery && !searchLoading && filteredSearchResults.length === 0 && (
                    <div className="text-center py-6">
                      <User className="w-8 h-8 text-white/30 mx-auto mb-2" />
                      <p className="text-white/60 text-sm">No users found matching "{debouncedSearchQuery}"</p>
                    </div>
                  )}

                  {!addFriendQuery && (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/60 text-sm">Start typing to search for users</p>
                      <p className="text-white/40 text-xs mt-1">Search by username or email address</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
        <ToastContainer />
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(FriendsModal);