import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  X, 
  Search, 
  UserPlus, 
  Check, 
  X as XIcon, 
  Clock,
  Mail,
  User,
  Trash2
} from 'lucide-react';
import type { IFriend } from '../../interfaces/IFriend';
import type { IUser } from '../../interfaces/IUser';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: IUser | null;
}

interface ExtendedFriend extends IFriend {
  user?: IUser;
  friend?: IUser;
}

export default function FriendsModal({ isOpen, onClose, currentUser }: FriendsModalProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [friends, setFriends] = useState<ExtendedFriend[]>([]);
  const [friendRequests, setFriendRequests] = useState<ExtendedFriend[]>([]);
  const [sentRequests, setSentRequests] = useState<ExtendedFriend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendQuery, setAddFriendQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFriendsData = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const mockUsers: IUser[] = [
        { 
          id: 2, 
          username: 'Sarah Chen', 
          email: 'sarah@company.com', 
          avatar: '👩‍💼',
          created_at: '2025-09-01T00:00:00Z',
          updated_at: '2025-09-01T00:00:00Z'
        },
        { 
          id: 3, 
          username: 'Mike Johnson', 
          email: 'mike@company.com', 
          avatar: '👨‍💻',
          created_at: '2025-09-02T00:00:00Z',
          updated_at: '2025-09-02T00:00:00Z'
        },
        { 
          id: 4, 
          username: 'Emma Wilson', 
          email: 'emma@company.com', 
          avatar: '👩‍🎨',
          created_at: '2025-09-03T00:00:00Z',
          updated_at: '2025-09-03T00:00:00Z'
        }
      ];

      const mockFriends: ExtendedFriend[] = [
        {
          id: 1,
          user_id: currentUser.id,
          friend_id: 2,
          status: 'accepted',
          created_at: '2025-09-08T12:00:00Z',
          updated_at: '2025-09-08T12:00:00Z',
          friend: mockUsers[0]
        },
        {
          id: 2,
          user_id: currentUser.id,
          friend_id: 3,
          status: 'accepted',
          created_at: '2025-09-09T09:30:00Z',
          updated_at: '2025-09-09T09:30:00Z',
          friend: mockUsers[1]
        }
      ];

      const mockRequests: ExtendedFriend[] = [
        {
          id: 3,
          user_id: 4,
          friend_id: currentUser.id,
          status: 'pending',
          created_at: '2025-09-10T08:00:00Z',
          updated_at: '2025-09-10T08:00:00Z',
          user: mockUsers[2]
        }
      ];

      const mockSentRequests: ExtendedFriend[] = [];
      
      setFriends(mockFriends);
      setFriendRequests(mockRequests);
      setSentRequests(mockSentRequests);
    } catch (err) {
      setError('Failed to load friends data');
      console.error('Error loading friends:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadFriendsData();
    }
  }, [isOpen, currentUser, loadFriendsData]);

  const handleAcceptRequest = async (friendId: number) => {
    try {
      await FriendApi.updateFriend(friendId, 'accepted');
      await loadFriendsData();
    } catch (err) {
      setError('Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (friendId: number) => {
    try {
      await FriendApi.deleteFriend(friendId);
      await loadFriendsData();
    } catch (err) {
      setError('Failed to reject friend request');
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    try {
      await FriendApi.deleteFriend(friendId);
      await loadFriendsData();
    } catch (err) {
      setError('Failed to remove friend');
    }
  };

  const handleSendFriendRequest = async () => {
    if (!currentUser || !addFriendQuery.trim()) return;
    
    try {
      // This would need to be implemented to search users by username/email
      // For now, just show a placeholder
      setError('Friend request feature coming soon!');
    } catch (err) {
      setError('Failed to send friend request');
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.friend?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.friend?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderUserCard = (user: IUser, actions?: React.ReactNode) => (
    <motion.div
      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200"
      whileHover={{ scale: 1.02 }}
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
            <span className="text-white font-medium text-sm">
              {getInitials(user.username)}
            </span>
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white/20" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{user.username}</p>
        <p className="text-white/60 text-xs truncate">{user.email}</p>
      </div>
      
      {actions}
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-white" />
              <h2 className="text-white font-semibold text-lg">Friends</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Tabs */}
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

          {/* Content */}
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
                            <button
                              onClick={() => handleRemoveFriend(friend.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Remove friend"
                            >
                              <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                            </button>
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
                                className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="Accept request"
                              >
                                <Check className="w-4 h-4 text-green-400 hover:text-green-300" />
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Reject request"
                              >
                                <XIcon className="w-4 h-4 text-red-400 hover:text-red-300" />
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
                      Find friends by username or email
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          placeholder="Enter username or email..."
                          value={addFriendQuery}
                          onChange={(e) => setAddFriendQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 outline-none focus:border-white/40 transition-colors"
                        />
                      </div>
                      <button
                        onClick={handleSendFriendRequest}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Send Request
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium text-sm mb-1">Invite by Email</h4>
                        <p className="text-white/60 text-xs mb-3">
                          Send an invitation to join Pomolab to someone who doesn't have an account yet.
                        </p>
                        <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs rounded-lg transition-colors">
                          Send Invitation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}