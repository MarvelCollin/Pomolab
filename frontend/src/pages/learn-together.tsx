import { useState } from 'react';
import { MeetingProvider } from '@videosdk.live/react-sdk';
import { Camera } from 'lucide-react';
import { createMeeting } from '../services/video-call-service';
import MeetingView from '../components/videosdk/meeting-view';
import LoadingSpinner from '../components/common/loading-spinner';

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
                  <LoadingSpinner size="sm" color="white" />
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