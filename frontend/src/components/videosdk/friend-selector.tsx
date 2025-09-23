import { motion } from "framer-motion";
import type { IFriend } from "../../interfaces/IFriend";
import { useState } from "react";
import { Search, Users } from "lucide-react";

export function FriendSelector({ 
  friends, 
  selectedFriends, 
  onToggleFriend 
}: { 
  friends: IFriend[]; 
  selectedFriends: Set<number>; 
  onToggleFriend: (friendId: number) => void; 
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friends.filter(friendship => 
    friendship.friend && 
    friendship.friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2 w-full">
      <div className="relative w-full">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60" />
        <input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg pl-7 pr-2 py-1.5 text-white placeholder-white/50 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-transparent"
        />
      </div>
      
      <div className="max-h-32 overflow-y-auto overflow-x-hidden space-y-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {filteredFriends.length === 0 ? (
          <p className="text-white/60 text-xs text-center py-3">
            {searchQuery ? 'No friends found' : 'No friends available'}
          </p>
        ) : (
          filteredFriends.map((friendship) => {
            const friend = friendship.friend!;
            return (
            <motion.div
              key={friend.id}
              className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors w-full ${
                selectedFriends.has(friend.id) 
                  ? 'bg-blue-500/30 border border-blue-400/50' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => onToggleFriend(friend.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                {friend.avatar ? (
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Users className="w-3 h-3 text-white/70" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{friend.username}</p>
                <p className="text-white/60 text-xs truncate">Available</p>
              </div>
              {selectedFriends.has(friend.id) && (
                <div className="w-3 h-3 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              )}
            </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}