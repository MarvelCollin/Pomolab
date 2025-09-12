import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IMusic, IMusicPlayerState } from '../../interfaces/IMusic';

interface AudioVisualProps {
  currentMusic: IMusic | null;
  playerState: IMusicPlayerState;
}

export default function AudioVisual({ currentMusic, playerState }: AudioVisualProps) {
  const [audioData, setAudioData] = useState<number[]>(new Array(120).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  const setupAudioAnalyser = async () => {
    try {
      const { musicService } = await import('../../services/music-service');
      const audioElement = musicService.getAudioElement();
      
      if (!audioElement) {
        startVisualization();
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      if (!analyserRef.current) {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        try {
          if (!audioElement.getAttribute('data-connected')) {
            const source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            audioElement.setAttribute('data-connected', 'true');
          }
        } catch (sourceError) {
          console.warn('Could not connect audio source:', sourceError);
        }
      }

      startVisualization();
    } catch (error) {
      console.warn('Using fallback visualization:', error);
      startVisualization();
    }
  };

  const startVisualization = () => {
    if (analyserRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const animate = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        
        const bars = 120;
        const step = Math.floor(bufferLength / bars);
        const newAudioData = [];

        for (let i = 0; i < bars; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j];
          }
          const average = sum / step;
          newAudioData.push(Math.min(average / 255, 1));
        }

        setAudioData(newAudioData);
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
    }
  };

  useEffect(() => {
    if (playerState.isPlaying && currentMusic) {
      setupAudioAnalyser();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAudioData(new Array(120).fill(0));
    }
  }, [playerState.isPlaying, currentMusic]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!currentMusic) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none"
      >
        <div className="w-full h-24 flex items-end justify-center px-8">
          <div className="flex items-end justify-between w-full max-w-6xl h-16 gap-0.5">
            {audioData.map((amplitude, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-t from-white/40 via-white/20 to-transparent flex-1"
                style={{
                  minHeight: '4px',
                  maxWidth: '100%'
                }}
                animate={{
                  height: playerState.isPlaying 
                    ? `${Math.max(4, amplitude * 80 + 4)}px` 
                    : '4px',
                  opacity: playerState.isPlaying ? amplitude * 0.9 + 0.3 : 0.3
                }}
                transition={{
                  duration: playerState.isPlaying ? 0.1 : 3,
                  ease: playerState.isPlaying ? "easeOut" : "easeInOut",
                  repeat: playerState.isPlaying ? 0 : Infinity,
                  repeatType: "reverse"
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
