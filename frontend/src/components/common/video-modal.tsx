import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical, Camera, CameraOff, Mic, MicOff, Users, Video, Phone, Search, Maximize, Minimize, Monitor, MonitorSpeaker } from 'lucide-react';
import { MeetingProvider, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import type { IVideoModal } from '../../interfaces/IVideoModal';
import type { IFriend } from '../../interfaces/IFriend';
import { createMeeting } from '../../services/video-call-service';
import { notificationService } from '../../services/notification-service';
import { FriendApi } from '../../apis/friend-api';
import { useToast } from './toast';
import LoadingSpinner from './loading-spinner';
import { createMediaStreamFromTrack, attachMediaStreamToElement } from '../../utils/media-stream-utils';
import { getGridColumnsClass } from '../../utils/grid-utils';

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

function VideoParticipantView({ 
  participantId, 
  onParticipantClick, 
  isFullscreenFocus = false 
}: { 
  participantId: string;
  onParticipantClick?: (participantId: string) => void;
  isFullscreenFocus?: boolean;
}) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName, screenShareStream, screenShareOn } = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screenShareRef = useRef<HTMLVideoElement | null>(null);

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
        isFullscreenFocus ? 'min-h-[calc(100vh-160px)]' : 'min-h-[120px]'
      }`}
      onClick={() => onParticipantClick?.(participantId)}
      whileHover={{ scale: isFullscreenFocus ? 1 : 1.02 }}
      whileTap={{ scale: isFullscreenFocus ? 1 : 0.98 }}
    >
      {screenShareOn && screenShareStream ? (
        <div className="relative w-full h-full">
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
          {webcamOn && (
            <div className="absolute bottom-2 right-2 w-20 h-16 bg-white/10 rounded-lg overflow-hidden border border-white/20">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted={isLocal}
              />
            </div>
          )}
        </div>
      ) : webcamOn ? (
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
            <Camera className={`mx-auto mb-1 ${isFullscreenFocus ? 'w-12 h-12' : 'w-6 h-6'}`} />
            <span className={isFullscreenFocus ? 'text-sm' : 'text-xs'}>Camera Off</span>
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

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
        <p className={`text-white font-medium truncate ${isFullscreenFocus ? 'text-sm' : 'text-xs'}`}>
          {displayName || participantId}
          {isFullscreenFocus && <span className="ml-2 text-white/60">(Focus)</span>}
        </p>
      </div>

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
  onToggleFullscreen 
}: { 
  onClose: () => void; 
  autoJoin?: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const [joined, setJoined] = useState(false);
  const [hasAttemptedJoin, setHasAttemptedJoin] = useState(false);
  const [focusedParticipant, setFocusedParticipant] = useState<string | null>(null);
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
      join();
    }
  }, [autoJoin, joined, hasAttemptedJoin, join]);

  const handleJoin = () => {
    join();
  };

  const handleLeave = () => {
    leave();
  };

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
          />
        </div>
      );
    }

    return participantIds.map((participantId) => (
      <VideoParticipantView 
        key={participantId} 
        participantId={participantId} 
        onParticipantClick={handleParticipantClick}
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
                  isFullscreen ? 'min-h-[calc(100vh-120px)]' : 'min-h-[200px]'
                } ${getVideoGridClass()}`
          }`}>
            {renderParticipants()}
          </div>
        ) : (
          <div className={`flex items-center justify-center h-full ${
            isFullscreen ? 'min-h-[calc(100vh-120px)]' : 'min-h-[200px]'
          }`}>
            <div className="text-center text-white/60">
              <Users className={`mx-auto mb-2 ${isFullscreen ? 'w-12 h-12' : 'w-6 h-6'}`} />
              <p className={isFullscreen ? 'text-sm' : 'text-xs'}>Waiting for participants...</p>
            </div>
          </div>
        )}
      </div>

      <div className={`flex items-center justify-center border-t border-white/10 bg-white/5 ${
        isFullscreen ? 'gap-4 p-4' : 'gap-2 p-3'
      }`}>
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
      showError('Failed to create meeting', 'Please try again');
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedFriends, friends, showError, showSuccess]);

  const joinExistingMeeting = useCallback((meetingId: string, token: string) => {
    setMeetingId(meetingId);
    setToken(token);
    setShowFriendSelector(false);
    setIsCreatedMeeting(false);
    showInfo('Joining Call', 'Connecting to video call...');
  }, [showInfo]);

  const handleClose = () => {
    setMeetingId("");
    setToken("");
    setShowFriendSelector(true);
    setSelectedFriends(new Set());
    setIsCreatedMeeting(false);
    setIsFullscreen(false);
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
            ? 'fixed inset-4 w-auto h-auto' 
            : 'absolute top-16 right-4 w-80 h-96 max-w-[85vw] max-h-[85vh]'
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
              <div className="p-3 space-y-3">
                <div className="text-center">
                  <h3 className="text-white text-sm font-medium mb-1">Start Video Call</h3>
                  <p className="text-white/60 text-xs">Select friends to invite</p>
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
                    className="flex-1 px-3 py-2 bg-blue-500/80 hover:bg-blue-500 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    whileHover={{ scale: selectedFriends.size > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: selectedFriends.size > 0 ? 0.98 : 1 }}
                  >
                    <Video className="w-3 h-3" />
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
                <VideoMeetingContent 
                  onClose={handleClose} 
                  autoJoin={isCreatedMeeting || !!joinMeetingData} 
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={toggleFullscreen}
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