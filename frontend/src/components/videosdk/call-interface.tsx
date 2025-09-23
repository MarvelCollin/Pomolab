import { useState } from "react";
import { useToast } from "../common/toast";
import { motion } from "framer-motion";
import { Video } from "lucide-react";
import { FriendSelector } from "./friend-selector";
import type { IFriend } from "../../interfaces/IFriend";

export function CallInterface({ 
  friends, 
  selectedFriends, 
  onToggleFriend,
  onStartCall,
  onJoinByMeetingId,
  loading 
}: { 
  friends: IFriend[]; 
  selectedFriends: Set<number>; 
  onToggleFriend: (friendId: number) => void;
  onStartCall: () => void;
  onJoinByMeetingId: (meetingId: string) => void;
  loading: boolean;
}) {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [meetingIdInput, setMeetingIdInput] = useState('');
  const { showError } = useToast();

  const handleJoinByMeetingId = () => {
    if (!meetingIdInput.trim()) {
      showError('Meeting ID Required', 'Please enter a valid meeting ID');
      return;
    }
    onJoinByMeetingId(meetingIdInput.trim());
    setMeetingIdInput('');
    setShowJoinInput(false);
  };

  return (
    <div className="p-3 space-y-3">
      <div className="text-center">
        <h3 className="text-white text-sm font-medium mb-1">Video Call</h3>
        <p className="text-white/60 text-xs">Start a new call or join existing</p>
      </div>
      
      <div className="flex gap-2">
        <motion.button
          onClick={() => setShowJoinInput(!showJoinInput)}
          className={`flex-1 px-3 py-2 rounded-lg text-white text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
            showJoinInput ? 'bg-green-500/80 hover:bg-green-500' : 'bg-white/20 hover:bg-white/30'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Video className="w-3 h-3" />
          Join Call
        </motion.button>
      </div>

      {showJoinInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <input
            type="text"
            placeholder="Enter Meeting ID..."
            value={meetingIdInput}
            onChange={(e) => setMeetingIdInput(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-xs focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-transparent"
          />
          <div className="flex gap-2">
            <motion.button
              onClick={handleJoinByMeetingId}
              disabled={!meetingIdInput.trim() || loading}
              className="flex-1 px-3 py-2 bg-green-500/80 hover:bg-green-500 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-white text-xs font-medium transition-colors"
              whileHover={{ scale: !meetingIdInput.trim() ? 1 : 1.02 }}
              whileTap={{ scale: !meetingIdInput.trim() ? 1 : 0.98 }}
            >
              Join Meeting
            </motion.button>
            <motion.button
              onClick={() => {
                setShowJoinInput(false);
                setMeetingIdInput('');
              }}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}
      
      <div className="border-t border-white/10 pt-3">
        <p className="text-white/60 text-xs mb-2">Or invite friends:</p>
        <FriendSelector
          friends={friends}
          selectedFriends={selectedFriends}
          onToggleFriend={onToggleFriend}
        />
        
        <div className="mt-3">
          <motion.button
            onClick={onStartCall}
            disabled={selectedFriends.size === 0 || loading}
            className="w-full px-3 py-2 bg-blue-500/80 hover:bg-blue-500 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
            whileHover={{ scale: selectedFriends.size > 0 ? 1.02 : 1 }}
            whileTap={{ scale: selectedFriends.size > 0 ? 0.98 : 1 }}
          >
            <Video className="w-3 h-3" />
            Start Call {selectedFriends.size > 0 ? `(${selectedFriends.size})` : ''}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
