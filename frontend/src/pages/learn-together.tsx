import { useState, useEffect } from 'react';
import { MeetingProvider, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { createMeeting } from '../services/video-call-service';

const ParticipantView = ({ participantId }: { participantId: string }) => {
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } = useParticipant(participantId);

  const videoRef = useState<HTMLVideoElement | null>(null);
  const audioRef = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (webcamStream && videoRef[0]) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef[0].srcObject = mediaStream;
      videoRef[0].play().catch(console.error);
    }
  }, [webcamStream, videoRef]);

  useEffect(() => {
    if (micStream && audioRef[0]) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(micStream.track);
      audioRef[0].srcObject = mediaStream;
      audioRef[0].play().catch(console.error);
    }
  }, [micStream, audioRef]);

  return (
    <div className="participant-container p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">{displayName || participantId}</h3>
      <div className="video-container mb-2">
        {webcamOn ? (
          <video
            ref={(ref) => { videoRef[1](ref); }}
            className="w-full h-48 bg-gray-200 rounded"
            autoPlay
            muted={isLocal}
          />
        ) : (
          <div className="w-full h-48 bg-gray-300 rounded flex items-center justify-center">
            <span>Camera Off</span>
          </div>
        )}
      </div>
      <audio ref={(ref) => { audioRef[1](ref); }} autoPlay muted={isLocal} />
      <div className="controls flex gap-2">
        <span className={`px-2 py-1 rounded text-sm ${micOn ? 'bg-green-200' : 'bg-red-200'}`}>
          {micOn ? 'Mic On' : 'Mic Off'}
        </span>
        <span className={`px-2 py-1 rounded text-sm ${webcamOn ? 'bg-green-200' : 'bg-red-200'}`}>
          {webcamOn ? 'Cam On' : 'Cam Off'}
        </span>
      </div>
    </div>
  );
};

const MeetingView = ({ meetingId, onLeave }: { meetingId: string; onLeave: () => void }) => {
  const [joined, setJoined] = useState<string>("JOINING");
  const { join, leave, toggleMic, toggleWebcam, participants } = useMeeting({
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    onMeetingLeft: () => {
      onLeave();
    },
  });

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
    <div className="meeting-container p-6">
      <h2 className="text-2xl font-bold mb-4">Learn Together - Video Call</h2>
      <p className="mb-4">Meeting ID: {meetingId}</p>
      
      {joined === "JOINED" ? (
        <div>
          <div className="controls mb-6 flex gap-4">
            <button
              onClick={handleToggleMic}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Toggle Mic
            </button>
            <button
              onClick={handleToggleWebcam}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Toggle Camera
            </button>
            <button
              onClick={leaveMeeting}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Leave Meeting
            </button>
          </div>
          
          <div className="participants-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(participants.keys()).map((participantId) => (
              <ParticipantView key={participantId} participantId={participantId} />
            ))}
          </div>
        </div>
      ) : joined === "JOINING" ? (
        <div className="text-center">
          <p className="mb-4">Joining meeting...</p>
          <button
            onClick={joinMeeting}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Join Meeting
          </button>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={joinMeeting}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Join Meeting
          </button>
        </div>
      )}
    </div>
  );
};

export default function LearnTogether() {
  const [meetingId, setMeetingId] = useState<string>("");
  const [token, setToken] = useState<string>("");

  const getMeetingAndToken = async () => {
    try {
      const { roomId, token } = await createMeeting();
      setToken(token);
      setMeetingId(roomId);
    } catch (error) {
      console.error('Failed to create meeting:', error);
      alert('Failed to create meeting. Please check your configuration.');
    }
  };

  const onMeetingLeave = () => {
    setMeetingId("");
  };

  return (
    <div className="learn-together-page min-h-screen bg-gray-100">
      {meetingId ? (
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: true,
            webcamEnabled: true,
            name: "Participant",
            debugMode: false,
          }}
          token={token}
        >
          <MeetingView meetingId={meetingId} onLeave={onMeetingLeave} />
        </MeetingProvider>
      ) : (
        <div className="start-meeting-container p-6 text-center">
          <h1 className="text-3xl font-bold mb-6">Learn Together</h1>
          <p className="mb-6">Start a video call to learn together with others</p>
          <button
            onClick={getMeetingAndToken}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start Meeting
          </button>
        </div>
      )}
    </div>
  );
}