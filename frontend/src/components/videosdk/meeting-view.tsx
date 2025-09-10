import { useState } from 'react';
import { useMeeting } from '@videosdk.live/react-sdk';
import { Mic, MicOff, Camera, CameraOff } from 'lucide-react';
import type { IMeetingView } from '../../interfaces/IMeetingView';
import ParticipantView from './participant-view';
import LoadingSpinner from '../common/loading-spinner';

export default function MeetingView({ meetingId, onLeave }: IMeetingView) {
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
            <LoadingSpinner size="md" />
            <p className="text-lg text-gray-600 mb-6 mt-4">Joining meeting...</p>
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
}
