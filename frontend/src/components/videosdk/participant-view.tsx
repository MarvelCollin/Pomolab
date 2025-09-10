import { useState, useEffect, useRef } from 'react';
import { useParticipant } from '@videosdk.live/react-sdk';
import { Mic, MicOff, Camera, CameraOff, User, Maximize2 } from 'lucide-react';
import type { IParticipantView } from '../../interfaces/IParticipantView';
import ParticipantModal from './participant-modal';

export default function ParticipantView({ participantId }: IParticipantView) {
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
}
