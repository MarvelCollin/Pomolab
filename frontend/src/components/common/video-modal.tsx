import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical, Camera, CameraOff, Mic, MicOff, Users, Video, Phone, Search, Maximize, Minimize, Monitor, MonitorSpeaker, UserPlus, Share2, Check } from 'lucide-react';
import { MeetingProvider, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import type { IVideoModal } from '../../interfaces/IVideoModal';
import type { IFriend } from '../../interfaces/IFriend';
import type { IUser } from '../../interfaces/IUser';
import { createMeeting } from '../../services/video-call-service';
import { notificationService } from '../../services/notification-service';
import { FriendApi } from '../../apis/friend-api';
import { useToast } from './toast';
import LoadingSpinner from './loading-spinner';
import { createMediaStreamFromTrack, attachMediaStreamToElement } from '../../utils/media-stream-utils';


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

function CallInterface({ 
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

function VideoParticipantView({ 
  participantId, 
  onParticipantClick, 
  isFullscreenFocus = false,
  currentUser,
  friends = []
}: { 
  participantId: string;
  onParticipantClick?: (participantId: string) => void;
  isFullscreenFocus?: boolean;
  currentUser?: IUser | null;
  friends?: IFriend[];
}) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName, screenShareStream, screenShareOn } = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screenShareRef = useRef<HTMLVideoElement | null>(null);

  // Get user profile information
  const getUserProfile = () => {
    if (isLocal && currentUser) {
      return {
        username: currentUser.username,
        avatar: currentUser.avatar
      };
    }
    
    // For remote participants, try to match by displayName with friends
    const matchedFriend = friends.find(f => 
      f.friend && (
        f.friend.username === displayName ||
        f.friend.username === (displayName || participantId)
      )
    );
    
    if (matchedFriend?.friend) {
      return {
        username: matchedFriend.friend.username,
        avatar: matchedFriend.friend.avatar
      };
    }
    
    return {
      username: displayName || participantId,
      avatar: null
    };
  };

  const userProfile = getUserProfile();

  useEffect(() => {
    if (screenShareStream && screenShareRef.current) {
      const mediaStream = createMediaStreamFromTrack(screenShareStream.track);
      attachMediaStreamToElement(screenShareRef.current, mediaStream);
    }
    return () => {
      if (screenShareRef.current) {
        screenShareRef.current.srcObject = null;
      }
    };
  }, [screenShareStream]);

  useEffect(() => {
    if (webcamStream && videoRef.current) {
      const mediaStream = createMediaStreamFromTrack(webcamStream.track);
      attachMediaStreamToElement(videoRef.current, mediaStream);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [webcamStream]);

  useEffect(() => {
    if (micStream && audioRef.current && !isLocal) {
      const mediaStream = createMediaStreamFromTrack(micStream.track);
      attachMediaStreamToElement(audioRef.current, mediaStream);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    };
  }, [micStream, isLocal]);

  return (
    <motion.div 
      className={`relative h-full bg-white/5 rounded-lg overflow-hidden cursor-pointer ${
        isFullscreenFocus ? 'min-h-[calc(100vh-280px)] max-h-[calc(100vh-280px)]' : 'min-h-[120px]'
      }`}
      onClick={() => onParticipantClick?.(participantId)}
      whileHover={{ scale: isFullscreenFocus ? 1 : 1.02 }}
      whileTap={{ scale: isFullscreenFocus ? 1 : 0.98 }}
    >
      {screenShareOn && screenShareStream ? (
        <div className="relative w-full h-full">
          {/* Screen share content */}
          <video
            ref={screenShareRef}
            className="w-full h-full object-contain bg-black"
            autoPlay
            playsInline
            muted={isLocal}
          />
          <div className="absolute top-2 left-2">
            <div className="bg-blue-500/80 p-1 rounded-full">
              <Monitor className="w-3 h-3 text-white" />
            </div>
          </div>
          
          {/* Camera section when screen sharing */}
          {webcamOn ? (
            // Scenario 2: Camera ON + Screen share ON = Picture-in-picture camera
            <div className="absolute bottom-2 right-2 w-24 h-20 bg-white/10 rounded-lg overflow-hidden border border-white/20">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted={isLocal}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-0.5">
                <p className="text-white text-xs font-medium truncate">
                  {userProfile.username}
                </p>
              </div>
            </div>
          ) : (
            // Scenario 3: Camera OFF + Screen share ON = Small profile picture overlay
            <div className="absolute bottom-2 right-2 w-16 h-16 bg-white/10 rounded-lg overflow-hidden border border-white/20 flex items-center justify-center">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.username}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white/60" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-0.5">
                <p className="text-white text-xs font-medium truncate">
                  {userProfile.username}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : webcamOn ? (
        // Camera only (no screen share)
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={isLocal}
        />
      ) : (
        // Scenario 1: Camera OFF (no screen share) = Big profile picture
        <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
          <div className="text-center">
            {userProfile.avatar ? (
              <div className="mx-auto mb-3 relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.username}
                  className={`object-cover rounded-full border-2 border-white/20 ${
                    isFullscreenFocus ? 'w-24 h-24' : 'w-16 h-16'
                  }`}
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center border-2 border-white/20">
                  <CameraOff className="w-3 h-3 text-white" />
                </div>
              </div>
            ) : (
              <div className={`mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/20 relative ${
                isFullscreenFocus ? 'w-24 h-24' : 'w-16 h-16'
              }`}>
                <Users className={`text-white/60 ${isFullscreenFocus ? 'w-10 h-10' : 'w-8 h-8'}`} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center border-2 border-white/20">
                  <CameraOff className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
            <p className={`text-white/80 font-medium ${isFullscreenFocus ? 'text-sm' : 'text-xs'}`}>
              {userProfile.username}
            </p>
            <span className={`text-white/60 ${isFullscreenFocus ? 'text-sm' : 'text-xs'}`}>
              Camera Off
            </span>
          </div>
        </div>
      )}
      
      <div className="absolute top-1 left-1 flex items-center gap-1">
        <div className={`p-0.5 rounded-full ${micOn ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
          {micOn ? <Mic className="w-2.5 h-2.5 text-white" /> : <MicOff className="w-2.5 h-2.5 text-white" />}
        </div>
        <div className={`p-0.5 rounded-full ${webcamOn ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
          {webcamOn ? <Camera className="w-2.5 h-2.5 text-white" /> : <CameraOff className="w-2.5 h-2.5 text-white" />}
        </div>
        {screenShareOn && (
          <div className="p-0.5 rounded-full bg-blue-500/80">
            <Monitor className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Bottom name display - only show when not screen sharing */}
      {!screenShareOn && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
          <p className={`text-white font-medium truncate ${isFullscreenFocus ? 'text-sm' : 'text-xs'}`}>
            {userProfile.username}
            {isFullscreenFocus && <span className="ml-2 text-white/60">(Focus)</span>}
          </p>
        </div>
      )}

      {!isLocal && (
        <audio ref={audioRef} autoPlay playsInline />
      )}
    </motion.div>
  );
}

function VideoMeetingContent({ 
  onClose, 
  autoJoin = false, 
  isFullscreen, 
  onToggleFullscreen,
  currentUser,
  friends = [],
  meetingId,
  onAddUsers
}: { 
  onClose: () => void; 
  autoJoin?: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  currentUser?: IUser | null;
  friends?: IFriend[];
  meetingId?: string;
  onAddUsers?: (selectedUsers: IUser[]) => void;
}) {
  const [joined, setJoined] = useState(false);
  const [hasAttemptedJoin, setHasAttemptedJoin] = useState(false);
  const [focusedParticipant, setFocusedParticipant] = useState<string | null>(null);
  const [showAddUsers, setShowAddUsers] = useState(false);
  const [selectedNewUsers, setSelectedNewUsers] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const { showSuccess, showError } = useToast();
  const { 
    join, 
    leave, 
    toggleMic, 
    toggleWebcam, 
    toggleScreenShare,
    participants, 
    localMicOn, 
    localWebcamOn,
    localScreenShareOn
  } = useMeeting({
    onMeetingJoined: () => {
      setJoined(true);
    },
    onMeetingLeft: () => {
      onClose();
    },
  });
  const participantIds = Array.from(participants.keys()).filter((id, index, array) => 
    array.indexOf(id) === index
  );

  const handleParticipantClick = (participantId: string) => {
    if (isFullscreen) {
      setFocusedParticipant(focusedParticipant === participantId ? null : participantId);
    }
  };

  useEffect(() => {
    if (autoJoin && !joined && !hasAttemptedJoin) {
      setHasAttemptedJoin(true);
      const timeoutId = setTimeout(() => {
        join();
      }, 500); 
      
      return () => clearTimeout(timeoutId);
    }
  }, [autoJoin, joined, hasAttemptedJoin, join]);

  const handleJoin = () => {
    join();
  };

  const handleLeave = () => {
    leave();
  };

  const handleShareMeeting = async () => {
    if (!meetingId) return;
    
    try {
      await navigator.clipboard.writeText(meetingId);
      setCopied(true);
      showSuccess('Meeting ID Copied', 'Share this ID with others to join');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showError('Copy Failed', 'Could not copy meeting ID');
    }
  };

  const handleToggleNewUser = (friendId: number) => {
    setSelectedNewUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(friendId)) {
        newSet.delete(friendId);
      } else {
        newSet.add(friendId);
      }
      return newSet;
    });
  };

  const handleAddUsers = () => {
    if (selectedNewUsers.size === 0) {
      showError('Select Users', 'Please select at least one user to add');
      return;
    }

    const usersToAdd = friends
      .filter(f => f.friend && selectedNewUsers.has(f.friend.id))
      .map(f => f.friend!);

    if (onAddUsers) {
      onAddUsers(usersToAdd);
    }

    setSelectedNewUsers(new Set());
    setShowAddUsers(false);
    showSuccess('Invites Sent', `Invited ${usersToAdd.length} user${usersToAdd.length > 1 ? 's' : ''} to join`);
  };

  useEffect(() => {
    setHasAttemptedJoin(false);
    setJoined(false);
    setFocusedParticipant(null);
  }, [autoJoin]); 

  const getVideoGridClass = () => {
    if (focusedParticipant) return 'grid-cols-1';
    const count = participantIds.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 lg:grid-cols-3';
  };

  const renderParticipants = () => {
    if (focusedParticipant) {
      return (
        <div className="h-full">
          <VideoParticipantView 
            key={focusedParticipant} 
            participantId={focusedParticipant} 
            onParticipantClick={handleParticipantClick}
            isFullscreenFocus={true}
            currentUser={currentUser}
            friends={friends}
          />
        </div>
      );
    }

    return participantIds.map((participantId) => (
      <VideoParticipantView 
        key={participantId} 
        participantId={participantId} 
        onParticipantClick={handleParticipantClick}
        currentUser={currentUser}
        friends={friends}
      />
    ));
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
    <div className="h-full flex flex-col min-h-0">
      <div className={`flex-1 min-h-0 ${isFullscreen ? 'p-4' : 'p-2'}`}>
        {participantIds.length > 0 ? (
          <div className={`${
            focusedParticipant 
              ? 'h-full' 
              : `grid gap-${isFullscreen ? '4' : '2'} h-full ${
                  isFullscreen ? 'min-h-[calc(100vh-220px)]' : 'min-h-[250px] max-h-[300px]'
                } ${getVideoGridClass()}`
          }`}>
            {renderParticipants()}
          </div>
        ) : (
          <div className={`flex items-center justify-center h-full ${
            isFullscreen ? 'min-h-[calc(100vh-220px)]' : 'min-h-[250px] max-h-[300px]'
          }`}>
            <div className="text-center text-white/60">
              <Users className={`mx-auto mb-2 ${isFullscreen ? 'w-12 h-12' : 'w-6 h-6'}`} />
              <p className={isFullscreen ? 'text-sm' : 'text-xs'}>Waiting for participants...</p>
            </div>
          </div>
        )}
      </div>

      {showAddUsers && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`border-t border-white/10 bg-white/5 ${isFullscreen ? 'p-4' : 'p-3'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className={`text-white font-medium ${isFullscreen ? 'text-sm' : 'text-xs'}`}>
              Add Users to Call
            </h4>
            <motion.button
              onClick={() => setShowAddUsers(false)}
              className="text-white/60 hover:text-white p-1 rounded"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-3 h-3" />
            </motion.button>
          </div>
          
          <div className={`${isFullscreen ? 'max-h-40' : 'max-h-28'} overflow-y-auto space-y-1`}>
            {friends.filter(f => f.friend).map((friendship) => {
              const friend = friendship.friend!;
              return (
                <motion.div
                  key={friend.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                    selectedNewUsers.has(friend.id) 
                      ? 'bg-green-500/30 border border-green-400/50' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => handleToggleNewUser(friend.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`rounded-full flex items-center justify-center border border-white/20 ${
                    isFullscreen ? 'w-8 h-8' : 'w-6 h-6'
                  }`}>
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className={`text-white/70 ${isFullscreen ? 'w-4 h-4' : 'w-3 h-3'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-white font-medium truncate ${isFullscreen ? 'text-sm' : 'text-xs'}`}>
                      {friend.username}
                    </p>
                  </div>
                  {selectedNewUsers.has(friend.id) && (
                    <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {friends.length > 0 && (
            <div className="flex gap-2 mt-3">
              <motion.button
                onClick={handleAddUsers}
                disabled={selectedNewUsers.size === 0}
                className={`flex-1 px-3 py-2 bg-green-500/80 hover:bg-green-500 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-1 ${
                  isFullscreen ? 'text-sm' : 'text-xs'
                }`}
                whileHover={{ scale: selectedNewUsers.size > 0 ? 1.02 : 1 }}
                whileTap={{ scale: selectedNewUsers.size > 0 ? 0.98 : 1 }}
              >
                <UserPlus className="w-3 h-3" />
                Add {selectedNewUsers.size > 0 ? `(${selectedNewUsers.size})` : ''}
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      <div className={`flex items-center justify-center border-t border-white/10 bg-white/5 ${
        isFullscreen ? 'gap-4 p-4' : 'gap-2 p-3'
      } flex-shrink-0`}>
        <motion.button
          onClick={() => toggleMic()}
          className={`rounded-lg transition-colors ${
            isFullscreen ? 'p-3' : 'p-2'
          } ${
            localMicOn 
              ? 'bg-white/20 hover:bg-white/30 text-white' 
              : 'bg-red-500/80 hover:bg-red-500 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {localMicOn ? (
            <Mic className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
          ) : (
            <MicOff className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
          )}
        </motion.button>
        
        <motion.button
          onClick={() => toggleWebcam()}
          className={`rounded-lg transition-colors ${
            isFullscreen ? 'p-3' : 'p-2'
          } ${
            localWebcamOn 
              ? 'bg-white/20 hover:bg-white/30 text-white' 
              : 'bg-red-500/80 hover:bg-red-500 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {localWebcamOn ? (
            <Camera className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
          ) : (
            <CameraOff className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
          )}
        </motion.button>

        <motion.button
          onClick={() => toggleScreenShare()}
          className={`rounded-lg transition-colors ${
            isFullscreen ? 'p-3' : 'p-2'
          } ${
            localScreenShareOn 
              ? 'bg-blue-500/80 hover:bg-blue-500 text-white' 
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {localScreenShareOn ? (
            <MonitorSpeaker className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
          ) : (
            <Monitor className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
          )}
        </motion.button>

        <motion.button
          onClick={handleShareMeeting}
          className={`bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors ${
            isFullscreen ? 'p-3' : 'p-2'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? (
            <Check className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
          ) : (
            <Share2 className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
          )}
        </motion.button>

        <motion.button
          onClick={() => setShowAddUsers(!showAddUsers)}
          className={`rounded-lg text-white transition-colors ${
            isFullscreen ? 'p-3' : 'p-2'
          } ${
            showAddUsers 
              ? 'bg-green-500/80 hover:bg-green-500' 
              : 'bg-white/20 hover:bg-white/30'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <UserPlus className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
        </motion.button>

        <motion.button
          onClick={onToggleFullscreen}
          className={`bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors ${
            isFullscreen ? 'p-3' : 'p-2'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isFullscreen ? (
            <Minimize className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
          ) : (
            <Maximize className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
          )}
        </motion.button>
        
        <motion.button
          onClick={handleLeave}
          className={`bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors ${
            isFullscreen ? 'p-3' : 'p-2'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Phone className={isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} />
        </motion.button>
      </div>
    </div>
  );
}

export default function VideoModal({
  isOpen,
  onClose,
  currentUser,
  joinMeetingData
}: IVideoModal) {
  const constraintsRef = useRef(null);
  const [meetingId, setMeetingId] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<IFriend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<number>>(new Set());
  const [showFriendSelector, setShowFriendSelector] = useState(true);
  const [isCreatedMeeting, setIsCreatedMeeting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { showError, showSuccess, showInfo } = useToast();

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const loadFriends = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const friendsData = await FriendApi.getUserFriends(currentUser.id);
      setFriends(Array.isArray(friendsData) ? friendsData : []);
    } catch (error) {
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

    if (loading) {
      return;
    }

    setLoading(true);
    try {
      const { roomId, token } = await createMeeting();
      const newCallId = `call_${Date.now()}_${currentUser.id}`;
      
      setToken(token);
      setMeetingId(roomId);
      setShowFriendSelector(false);
      setIsCreatedMeeting(true);
      
      const selectedFriendUsers = friends
        .filter(f => f.friend && selectedFriends.has(f.friend.id))
        .map(f => f.friend!);

      await notificationService.sendVideoCallInvite(
        newCallId,
        roomId,
        token,
        currentUser,
        selectedFriendUsers
      );

      showSuccess('Call Started', `Calling ${selectedFriendUsers.length} friend${selectedFriendUsers.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error starting video call:', error);
      showError('Failed to create meeting', 'Please try again');
      setMeetingId("");
      setToken("");
      setShowFriendSelector(true);
      setIsCreatedMeeting(false);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedFriends, friends, showError, showSuccess, loading]);

  const joinExistingMeeting = useCallback((meetingId: string, token: string) => {
    setMeetingId(meetingId);
    setToken(token);
    setShowFriendSelector(false);
    setIsCreatedMeeting(false);
    showInfo('Joining Call', 'Connecting to video call...');
  }, [showInfo]);

  const handleJoinByMeetingId = useCallback(async (inputMeetingId: string) => {
    if (!currentUser) {
      showError('Authentication Required', 'Please login to join a video call');
      return;
    }

    setLoading(true);
    try {
      const { token } = await createMeeting();
      joinExistingMeeting(inputMeetingId, token);
    } catch (error) {
      console.error('Error joining meeting:', error);
      showError('Failed to join meeting', 'Invalid meeting ID or connection error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, joinExistingMeeting, showError]);

  const handleAddUsersToCall = useCallback(async (usersToAdd: IUser[]) => {
    if (!currentUser || !meetingId || !token) return;

    try {
      const newCallId = `call_${Date.now()}_${currentUser.id}`;
      
      await notificationService.sendVideoCallInvite(
        newCallId,
        meetingId,
        token,
        currentUser,
        usersToAdd
      );

      showSuccess('Invites Sent', `Invited ${usersToAdd.length} user${usersToAdd.length > 1 ? 's' : ''} to join the call`);
    } catch (error) {
      console.error('Error adding users to call:', error);
      showError('Failed to send invites', 'Please try again');
    }
  }, [currentUser, meetingId, token, showSuccess, showError]);

  const handleClose = () => {
    setMeetingId("");
    setToken("");
    setShowFriendSelector(true);
    setSelectedFriends(new Set());
    setIsCreatedMeeting(false);
    setIsFullscreen(false);
    setLoading(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      loadFriends();
      notificationService.setCurrentUser(currentUser);
    }
  }, [isOpen, currentUser, loadFriends]);

  useEffect(() => {
    if (joinMeetingData && isOpen) {
      joinExistingMeeting(joinMeetingData.meetingId, joinMeetingData.token);
    }
  }, [joinMeetingData, isOpen, joinExistingMeeting]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={constraintsRef}
      className={`fixed ${isFullscreen ? 'inset-0' : 'inset-0 pointer-events-none'} z-[60]`}
    >
      {isFullscreen && (
        <motion.div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      <motion.div
        drag={!isFullscreen}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        whileDrag={{ scale: 1.02, rotate: 1 }}
        className={`${
          isFullscreen 
            ? 'fixed inset-0 w-auto h-auto' 
            : 'absolute top-16 right-4 w-80 h-[420px] max-w-[85vw] max-h-[85vh]'
        } bg-white/10 backdrop-blur-3xl border border-white/20 ${
          isFullscreen ? 'rounded-xl' : 'rounded-2xl'
        } shadow-2xl pointer-events-auto overflow-hidden`}
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: { duration: 0.4, ease: "easeOut" }
        }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        layout
      >
        <div className="relative h-full flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          
          <div className={`relative flex items-center justify-between border-b border-white/10 ${
            isFullscreen ? 'p-4' : 'p-3'
          }`}>
            <div className="flex items-center gap-2">
              {!isFullscreen && (
                <GripVertical className="w-3 h-3 text-white/40 cursor-move" />
              )}
              <div className="flex items-center gap-2">
                <div className={`bg-white/20 rounded-full flex items-center justify-center border border-white/20 ${
                  isFullscreen ? 'w-8 h-8' : 'w-6 h-6'
                }`}>
                  <Video className={`text-white/80 ${isFullscreen ? 'w-4 h-4' : 'w-3 h-3'}`} />
                </div>
                <div>
                  <h3 className={`text-white font-medium ${
                    isFullscreen ? 'text-sm' : 'text-xs'
                  }`}>
                    Video Call {isFullscreen && '(Fullscreen)'}
                  </h3>
                  <p className={`text-white/60 ${isFullscreen ? 'text-sm' : 'text-xs'}`}>
                    {currentUser ? `${currentUser.username}` : 'Guest User'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                onClick={toggleFullscreen}
                className={`hover:bg-white/20 rounded-full transition-colors group ${
                  isFullscreen ? 'p-2' : 'p-1'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isFullscreen ? (
                  <Minimize className={`text-white/60 group-hover:text-white ${
                    isFullscreen ? 'w-4 h-4' : 'w-3 h-3'
                  }`} />
                ) : (
                  <Maximize className={`text-white/60 group-hover:text-white ${
                    isFullscreen ? 'w-4 h-4' : 'w-3 h-3'
                  }`} />
                )}
              </motion.button>
              <motion.button
                onClick={handleClose}
                className={`hover:bg-white/20 rounded-full transition-colors group ${
                  isFullscreen ? 'p-2' : 'p-1'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className={`text-white/60 group-hover:text-white ${
                  isFullscreen ? 'w-4 h-4' : 'w-3 h-3'
                }`} />
              </motion.button>
            </div>
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
              <CallInterface
                friends={friends}
                selectedFriends={selectedFriends}
                onToggleFriend={handleToggleFriend}
                onStartCall={startVideoCall}
                onJoinByMeetingId={handleJoinByMeetingId}
                loading={loading}
              />
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
                <VideoMeetingContent 
                  onClose={handleClose} 
                  autoJoin={isCreatedMeeting || !!joinMeetingData} 
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={toggleFullscreen}
                  currentUser={currentUser}
                  friends={friends}
                  meetingId={meetingId}
                  onAddUsers={handleAddUsersToCall}
                />
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