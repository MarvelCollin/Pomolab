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
  const animationRef = useRef<number | null>(null);

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
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.3;
        analyser.minDecibels = -100;
        analyser.maxDecibels = -20;
        
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
        const newAudioData = [];
        
        for (let i = 0; i < bars; i++) {
          const freq = (i / bars) * (bufferLength / 2);
          const startIndex = Math.floor(freq);
          const endIndex = Math.min(startIndex + 3, bufferLength);
          
          let sum = 0;
          let count = 0;
          for (let j = startIndex; j < endIndex; j++) {
            sum += dataArray[j];
            count++;
          }
          
          const average = count > 0 ? sum / count : 0;
          let normalizedValue = average / 255;
          
          const bassBoost = i < 20 ? 1.8 : 1.0;
          const midBoost = i >= 20 && i < 80 ? 1.4 : 1.0;
          const trebleBoost = i >= 80 ? 1.2 : 1.0;
          
          normalizedValue = normalizedValue * bassBoost * midBoost * trebleBoost;
          normalizedValue = Math.pow(normalizedValue, 0.4);
          normalizedValue = Math.min(normalizedValue * 1.5, 1);
          
          newAudioData.push(Math.max(0.05, normalizedValue));
        }

        setAudioData(newAudioData);
      } else {
        const bars = 150;
        const newAudioData = [];
        const time = Date.now() * 0.002;
        
        for (let i = 0; i < bars; i++) {
          const wave1 = Math.sin(time + i * 0.15) * 0.3;
          const wave2 = Math.sin(time * 1.3 + i * 0.08) * 0.2;
          const wave3 = Math.sin(time * 0.7 + i * 0.25) * 0.15;
          const randomNoise = (Math.random() - 0.5) * 0.1;
          
          const baseFreq = i / bars;
          const bassEmphasis = baseFreq < 0.2 ? 1.5 : 1.0;
          const midEmphasis = baseFreq >= 0.2 && baseFreq < 0.6 ? 1.2 : 1.0;
          
          const amplitude = (wave1 + wave2 + wave3 + randomNoise + 0.4) * bassEmphasis * midEmphasis;
          newAudioData.push(Math.max(0.1, Math.min(0.8, amplitude)));
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
                  minHeight: '12px',
                  maxWidth: '100%'
                }}
                animate={{
                  height: playerState.isPlaying 
                    ? `${Math.max(12, amplitude * 140 + 12)}px` 
                    : '12px',
                  opacity: playerState.isPlaying ? Math.max(0.5, amplitude * 0.9 + 0.3) : 0.3
                }}
                transition={{
                  duration: playerState.isPlaying ? 0.05 : 2,
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
