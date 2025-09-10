import { useState, useEffect, useRef } from 'react';
import { MeetingProvider, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { createMeeting } from '../services/video-call-service';
import { Mic, MicOff, Camera, CameraOff, User, Maximize2 } from 'lucide-react';

interface ParticipantModalProps {
  participantId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ParticipantModal = ({ participantId, isOpen, onClose }: ParticipantModalProps) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">{displayName || participantId}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="video-container mb-4">
          {webcamOn ? (
            <video
              ref={videoRef}
              className="w-full h-96 bg-gray-100 rounded-xl object-cover"
              autoPlay
              playsInline
              muted={isLocal}
            />
          ) : (
            <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-500">
                <User className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <span className="text-lg">Camera is off</span>
              </div>
            </div>
          )}
        </div>
        {!isLocal && (
          <audio ref={audioRef} autoPlay playsInline />
        )}
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${micOn ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="text-sm font-medium">{micOn ? 'Microphone On' : 'Microphone Off'}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${webcamOn ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {webcamOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            <span className="text-sm font-medium">{webcamOn ? 'Camera On' : 'Camera Off'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParticipantView = ({ participantId }: { participantId: string }) => {
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } = useParticipant(participantId);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <>
      <div 
        className="relative bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer group"
        onDoubleClick={() => setIsModalOpen(true)}
      >
        <div className="aspect-video relative">
          {webcamOn ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={isLocal}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <span className="text-sm">Camera Off</span>
              </div>
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${micOn ? 'bg-green-500' : 'bg-red-500'}`}>
              {micOn ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
            </div>
            <div className={`p-1.5 rounded-full ${webcamOn ? 'bg-green-500' : 'bg-red-500'}`}>
              {webcamOn ? <Camera className="w-3 h-3 text-white" /> : <CameraOff className="w-3 h-3 text-white" />}
            </div>
          </div>

          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-1.5 bg-black bg-opacity-50 rounded-full">
              <Maximize2 className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
            <p className="text-white text-sm font-medium truncate">{displayName || participantId}</p>
          </div>
        </div>
        {!isLocal && (
          <audio ref={audioRef} autoPlay playsInline />
        )}
      </div>
      <ParticipantModal 
        participantId={participantId} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

const MeetingView = ({ meetingId, onLeave }: { meetingId: string; onLeave: () => void }) => {
  const [joined, setJoined] = useState<string>("JOINING");
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
      setJoined("JOINED");
    },
    onMeetingLeft: () => {
      onLeave();
    },
  });

  const participantIds = Array.from(participants.keys());
  const participantCount = participantIds.length;

  const getGridColumns = () => {
    if (participantCount === 1) return 'grid-cols-1';
    if (participantCount === 2) return 'grid-cols-1 md:grid-cols-2';
    if (participantCount <= 4) return 'grid-cols-1 md:grid-cols-2';
    if (participantCount <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    if (participantCount <= 9) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  const leaveMeeting = () => {
    leave();
  };

  const handleToggleMic = () => {
    toggleMic();
  };

  const handleToggleWebcam = () => {
    toggleWebcam();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {joined === "JOINED" ? (
        <div className="h-screen flex flex-col">
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Learn Together</h1>
                <p className="text-sm text-gray-500 mt-1">Meeting ID: {meetingId}</p>
              </div>
              <div className="text-sm text-gray-500">
                {participantCount} participant{participantCount !== 1 ? 's' : ''}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-hidden">
            <div className={`grid gap-4 h-full ${getGridColumns()}`}>
              {participantIds.map((participantId) => (
                <ParticipantView key={participantId} participantId={participantId} />
              ))}
            </div>
          </main>

          <footer className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleToggleMic}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium ${
                  localMicOn 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {localMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                {localMicOn ? 'Mute' : 'Unmute'}
              </button>
              
              <button
                onClick={handleToggleWebcam}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium ${
                  localWebcamOn 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {localWebcamOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                {localWebcamOn ? 'Stop Camera' : 'Start Camera'}
              </button>
              
              <button
                onClick={leaveMeeting}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 font-medium"
              >
                Leave Meeting
              </button>
            </div>
          </footer>
        </div>
      ) : joined === "JOINING" ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-gray-600 mb-6">Joining meeting...</p>
            <button
              onClick={joinMeeting}
              className="px-8 py-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 font-medium"
            >
              Join Meeting
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <button
              onClick={joinMeeting}
              className="px-8 py-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 font-medium"
            >
              Join Meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function LearnTogether() {
  const [meetingId, setMeetingId] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [participantName] = useState(() => `User ${Math.floor(Math.random() * 1000)}`);

  const getMeetingAndToken = async () => {
    setIsLoading(true);
    try {
      const { roomId, token } = await createMeeting();
      setToken(token);
      setMeetingId(roomId);
    } catch (error) {
      console.error('Failed to create meeting:', error);
      alert('Failed to create meeting. Please check your configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const onMeetingLeave = () => {
    setMeetingId("");
    setToken("");
  };

  return (
    <div className="learn-together-page">
      {meetingId && token ? (
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: true,
            webcamEnabled: true,
            name: participantName,
            debugMode: false,
          }}
          token={token}
        >
          <MeetingView meetingId={meetingId} onLeave={onMeetingLeave} />
        </MeetingProvider>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Learn Together</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Connect with others in high-quality video calls for collaborative learning sessions
              </p>
            </div>
            
            <button
              onClick={getMeetingAndToken}
              disabled={isLoading}
              className="w-full px-8 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Meeting...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  Start Meeting
                </>
              )}
            </button>
            
            <div className="mt-8 text-sm text-gray-500">
              <p>Double-click on any participant to view in full screen</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}