import { useEffect, useRef } from 'react';
import { useParticipant } from '@videosdk.live/react-sdk';
import { Mic, MicOff, Camera, CameraOff, User } from 'lucide-react';
import type { IParticipantModal } from '../../interfaces/IParticipantModal';

export default function ParticipantModal({ participantId, isOpen, onClose }: IParticipantModal) {
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
}
