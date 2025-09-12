import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IMusic, IMusicPlayerState } from '../../interfaces/IMusic';

interface AudioVisualProps {
  currentMusic: IMusic | null;
  playerState: IMusicPlayerState;
}

export default function AudioVisual({ currentMusic, playerState }: AudioVisualProps) {
  const [audioData, setAudioData] = useState<number[]>(new Array(150).fill(0));
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

      if (!audioElement.getAttribute('data-connected')) {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.7;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        
        try {
          const source = audioContext.createMediaElementSource(audioElement);
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          audioElement.setAttribute('data-connected', 'true');
          analyserRef.current = analyser;
        } catch (sourceError) {
          if (sourceError instanceof Error && sourceError.message.includes('already connected')) {
            if (analyserRef.current) {
              startVisualization();
              return;
            }
          }
          analyserRef.current = null;
        }
      }

      startVisualization();
    } catch (error) {
      analyserRef.current = null;
      startVisualization();
    }
  };

  const startVisualization = () => {
    const animate = () => {
      if (!playerState.isPlaying) {
        setAudioData(new Array(150).fill(0));
        return;
      }

      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const bars = 150;
        const step = Math.floor(bufferLength / bars);
        const newAudioData = [];

        for (let i = 0; i < bars; i++) {
          let sum = 0;
          const startIndex = i * step;
          const endIndex = Math.min(startIndex + step, bufferLength);
          
          for (let j = startIndex; j < endIndex; j++) {
            sum += dataArray[j];
          }
          
          const average = sum / (endIndex - startIndex);
          let normalizedValue = average / 255;
          normalizedValue = Math.pow(normalizedValue, 0.7);
          newAudioData.push(Math.min(normalizedValue, 1));
        }

        setAudioData(newAudioData);
      } else {
        const bars = 150;
        const newAudioData = [];
        
        for (let i = 0; i < bars; i++) {
          const baseAmplitude = Math.sin(Date.now() * 0.001 + i * 0.1) * 0.3 + 0.5;
          const randomVariation = Math.random() * 0.4;
          const amplitude = Math.max(0.1, Math.min(0.9, baseAmplitude + randomVariation));
          newAudioData.push(amplitude);
        }
        
        setAudioData(newAudioData);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (playerState.isPlaying && currentMusic) {
      const connectAnalyser = async () => {
        const { musicService } = await import('../../services/music-service');
        const audioElement = musicService.getAudioElement();
        
        if (audioElement && !audioElement.getAttribute('data-connected')) {
          analyserRef.current = null;
        }
        
        setupAudioAnalyser();
      };
      
      connectAnalyser();
    } else if (!playerState.isPlaying) {
      setAudioData(new Array(150).fill(0));
    }
  }, [playerState.isPlaying, currentMusic]);

  useEffect(() => {
    if (playerState.isPlaying && !animationRef.current) {
      startVisualization();
    }
  }, [playerState.isPlaying]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const shouldShow = currentMusic || playerState.isPlaying;
  
  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none"
        >
        <div className="w-full h-32 flex items-end justify-center px-0">
          <div className="flex items-end justify-between w-full h-24 gap-0.5">
            {audioData.map((amplitude, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-t from-white/40 via-white/20 to-transparent flex-1"
                style={{
                  minHeight: '8px',
                  maxWidth: '100%'
                }}
                animate={{
                  height: playerState.isPlaying 
                    ? `${Math.max(8, amplitude * 120 + 8)}px` 
                    : '8px',
                  opacity: playerState.isPlaying ? amplitude * 0.8 + 0.4 : 0.4
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
      )}
    </AnimatePresence>
  );
}
