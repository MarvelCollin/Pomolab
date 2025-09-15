import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical, Camera, CameraOff, Mic, MicOff, Users, Video, Phone, Search } from 'lucide-react';
import { MeetingProvider, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import type { IVideoModal } from '../../interfaces/IVideoModal';
import type { IFriend } from '../../interfaces/IFriend';
import { createMeeting } from '../../services/video-call-service';
import { videoCallNotificationService } from '../../services/video-call-notification-service';
import { FriendApi } from '../../apis/friend-api';
import { useToast } from './toast';
import LoadingSpinner from './loading-spinner';

function FriendSelector({ 
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
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
        <input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-3 py-2 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
        />
      </div>
      
      <div className="max-h-40 overflow-y-auto space-y-1">
        {filteredFriends.length === 0 ? (
          <p className="text-white/60 text-sm text-center py-4">
            {searchQuery ? 'No friends found' : 'No friends available'}
          </p>
        ) : (
          filteredFriends.map((friendship) => {
            const friend = friendship.friend!;
            return (
            <motion.div
              key={friend.id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                selectedFriends.has(friend.id) 
                  ? 'bg-blue-500/30 border border-blue-400/50' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => onToggleFriend(friend.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                {friend.avatar ? (
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Users className="w-4 h-4 text-white/70" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{friend.username}</p>
                <p className="text-white/60 text-xs">Available</p>
              </div>
              {selectedFriends.has(friend.id) && (
                <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
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

function VideoParticipantView({ participantId }: { participantId: string }) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (webcamStream && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(console.error);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [webcamStream]);

  useEffect(() => {
    if (micStream && audioRef.current && !isLocal) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(micStream.track);
      audioRef.current.srcObject = mediaStream;
      audioRef.current.play().catch(console.error);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    };
  }, [micStream, isLocal]);

  return (
    <div className="relative h-full bg-white/5 rounded-xl overflow-hidden">
      {webcamOn ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={isLocal}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
          <div className="text-center text-white/60">
            <Camera className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Camera Off</span>
          </div>
        </div>
      )}
      
      <div className="absolute top-2 left-2 flex items-center gap-1">
        <div className={`p-1 rounded-full ${micOn ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
          {micOn ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
        </div>
        <div className={`p-1 rounded-full ${webcamOn ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
          {webcamOn ? <Camera className="w-3 h-3 text-white" /> : <CameraOff className="w-3 h-3 text-white" />}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-white text-xs font-medium truncate">{displayName || participantId}</p>
      </div>

      {!isLocal && (
        <audio ref={audioRef} autoPlay playsInline />
      )}
    </div>
  );
}

function VideoMeetingContent({ onClose }: { onClose: () => void }) {
  const [joined, setJoined] = useState(false);
  const { 
    join, 
    leave, 
    toggleMic, 
    toggleWebcam, 
    participants, 
    localMicOn, 
    localWebcamOn 
  } = useMeeting({
    onMeetingJoined: () => {
      console.log('Meeting joined successfully');
    },
    onMeetingLeft: () => {
      onClose();
    },
  });
  const participantIds = Array.from(participants.keys());

  const handleJoin = () => {
    join();
    setJoined(true);
  };

  const handleLeave = () => {
    leave();
  };

  const getGridClass = () => {
    const count = participantIds.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    return 'grid-cols-2';
  };

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
          <Video className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-white text-lg font-medium mb-2">Join Video Call</h3>
        <p className="text-white/60 text-sm mb-6">Start or join a video meeting</p>
        <motion.button
          onClick={handleJoin}
          className="px-6 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-xl text-white text-sm font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Join Meeting
        </motion.button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-3">
        {participantIds.length > 0 ? (
          <div className={`grid gap-2 h-full ${getGridClass()}`}>
            {participantIds.map((participantId) => (
              <VideoParticipantView key={participantId} participantId={participantId} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/60">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Waiting for participants...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 p-3 border-t border-white/10">
        <motion.button
          onClick={() => toggleMic()}
          className={`p-2 rounded-lg transition-colors ${
            localMicOn 
              ? 'bg-white/20 hover:bg-white/30 text-white' 
              : 'bg-red-500/80 hover:bg-red-500 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {localMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </motion.button>
        
        <motion.button
          onClick={() => toggleWebcam()}
          className={`p-2 rounded-lg transition-colors ${
            localWebcamOn 
              ? 'bg-white/20 hover:bg-white/30 text-white' 
              : 'bg-red-500/80 hover:bg-red-500 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {localWebcamOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
        </motion.button>
        
        <motion.button
          onClick={handleLeave}
          className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Phone className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

export default function VideoModal({
  isOpen,
  onClose,
  currentUser
}: IVideoModal) {
  const constraintsRef = useRef(null);
  const [meetingId, setMeetingId] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<IFriend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<number>>(new Set());
  const [showFriendSelector, setShowFriendSelector] = useState(true);
  const { showError, showSuccess, showInfo } = useToast();

  const loadFriends = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const friendsData = await FriendApi.getUserFriends(currentUser.id);
      setFriends(Array.isArray(friendsData) ? friendsData : []);
    } catch (error) {
      console.error('Failed to load friends:', error);
      showError('Failed to load friends', 'Unable to load your friends list');
    }
  }, [currentUser, showError]);

  const handleToggleFriend = (friendId: number) => {
    setSelectedFriends(prev => {
      const newSet = new Set(prev);
      if (newSet.has(friendId)) {
        newSet.delete(friendId);
      } else {
        newSet.add(friendId);
      }
      return newSet;
    });
  };

  const startVideoCall = useCallback(async () => {
    if (!currentUser) {
      showError('Authentication Required', 'Please login to start a video call');
      return;
    }

    if (selectedFriends.size === 0) {
      showError('Select Friends', 'Please select at least one friend to call');
      return;
    }

    setLoading(true);
    try {
      const { roomId, token } = await createMeeting();
      const newCallId = `call_${Date.now()}_${currentUser.id}`;
      
      setToken(token);
      setMeetingId(roomId);
      setShowFriendSelector(false);
      
      const selectedFriendUsers = friends
        .filter(f => f.friend && selectedFriends.has(f.friend.id))
        .map(f => f.friend!);

      await videoCallNotificationService.sendVideoCallInvite(
        newCallId,
        roomId,
        token,
        currentUser,
        selectedFriendUsers
      );

      showSuccess('Call Started', `Calling ${selectedFriendUsers.length} friend${selectedFriendUsers.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Failed to create meeting:', error);
      showError('Failed to create meeting', 'Please try again');
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedFriends, friends, showError, showSuccess]);

  const joinExistingMeeting = useCallback((meetingId: string, token: string) => {
    setMeetingId(meetingId);
    setToken(token);
    setShowFriendSelector(false);
    showInfo('Joining Call', 'Connecting to video call...');
  }, [showInfo]);

  const handleClose = () => {
    setMeetingId("");
    setToken("");
    setShowFriendSelector(true);
    setSelectedFriends(new Set());
    onClose();
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      loadFriends();
      videoCallNotificationService.setCurrentUser(currentUser);
      videoCallNotificationService.setVideoCallAcceptCallback(joinExistingMeeting);
    }
  }, [isOpen, currentUser, loadFriends, joinExistingMeeting]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-50"
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        whileDrag={{ scale: 1.02, rotate: 1 }}
        className="absolute top-20 left-80 w-96 h-80 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden"
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="relative h-full flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          
          <div className="relative flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-white/40 cursor-move" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                  <Video className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium">Video Call</h3>
                  <p className="text-white/60 text-xs">
                    {currentUser ? `${currentUser.username}` : 'Guest User'}
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-white/60 group-hover:text-white" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 text-white/60">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="text-sm">
                    {showFriendSelector ? 'Loading friends...' : 'Creating meeting...'}
                  </span>
                </div>
              </div>
            ) : showFriendSelector ? (
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <h3 className="text-white text-lg font-medium mb-2">Start Video Call</h3>
                  <p className="text-white/60 text-sm">Select friends to invite to the call</p>
                </div>
                
                <FriendSelector
                  friends={friends}
                  selectedFriends={selectedFriends}
                  onToggleFriend={handleToggleFriend}
                />
                
                <div className="flex gap-2">
                  <motion.button
                    onClick={startVideoCall}
                    disabled={selectedFriends.size === 0 || loading}
                    className="flex-1 px-4 py-2 bg-blue-500/80 hover:bg-blue-500 disabled:bg-white/10 disabled:cursor-not-allowed rounded-xl text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: selectedFriends.size > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: selectedFriends.size > 0 ? 0.98 : 1 }}
                  >
                    <Video className="w-4 h-4" />
                    Call {selectedFriends.size > 0 ? `(${selectedFriends.size})` : ''}
                  </motion.button>
                </div>
              </div>
            ) : meetingId && token ? (
              <MeetingProvider
                config={{
                  meetingId,
                  micEnabled: true,
                  webcamEnabled: true,
                  name: currentUser?.username || `User ${Math.floor(Math.random() * 1000)}`,
                  debugMode: false,
                }}
                token={token}
              >
                <VideoMeetingContent onClose={handleClose} />
              </MeetingProvider>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/60">
                  <Video className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Unable to create meeting</p>
                  <motion.button
                    onClick={() => setShowFriendSelector(true)}
                    className="mt-3 px-4 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg text-white text-xs transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Again
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}