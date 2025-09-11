import { useState, useEffect, useCallback, useRef } from 'react';
import { musicService } from '../services/music-service';
import type { IMusic, IMusicPlayerState } from '../interfaces/IMusic';

export const useMusic = () => {
  const [musics, setMusics] = useState<IMusic[]>([]);
  const [currentMusic, setCurrentMusic] = useState<IMusic | null>(null);
  const [playerState, setPlayerState] = useState<IMusicPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadMusics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedMusics = await musicService.getMusics();
      setMusics(fetchedMusics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load musics');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadMusic = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const newMusic = await musicService.uploadMusic(file);
      if (newMusic) {
        setMusics(prev => [newMusic, ...prev]);
        return newMusic;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload music');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMusic = useCallback(async (music: IMusic) => {
    setLoading(true);
    setError(null);
    try {
      const success = await musicService.deleteMusic(music.filePath);
      if (success) {
        setMusics(prev => prev.filter(m => m.id !== music.id));
        if (currentMusic?.id === music.id) {
          stopMusic();
        }
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete music');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentMusic]);

  const playMusic = useCallback((music: IMusic) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = musicService.createAudioElement(music.url);
      const audio = audioRef.current;

      audio.volume = playerState.volume;
      audio.muted = playerState.isMuted;

      audio.addEventListener('loadedmetadata', () => {
        setPlayerState(prev => ({
          ...prev,
          duration: audio.duration || 0
        }));
      });

      audio.addEventListener('timeupdate', () => {
        setPlayerState(prev => ({
          ...prev,
          currentTime: audio.currentTime || 0
        }));
      });

      audio.addEventListener('ended', () => {
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0
        }));
        nextMusic();
      });

      audio.addEventListener('error', () => {
        setError('Failed to play music');
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false
        }));
      });

      audio.play()
        .then(() => {
          setCurrentMusic(music);
          setPlayerState(prev => ({
            ...prev,
            isPlaying: true
          }));
          setMusics(prev => 
            prev.map(m => ({ ...m, isActive: m.id === music.id }))
          );
        })
        .catch(() => {
          setError('Failed to play music');
        });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play music');
    }
  }, [playerState.volume, playerState.isMuted]);

  const pauseMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false
      }));
    }
  }, []);

  const resumeMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setPlayerState(prev => ({
            ...prev,
            isPlaying: true
          }));
        })
        .catch(() => {
          setError('Failed to resume music');
        });
    }
  }, []);

  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentMusic(null);
    setPlayerState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }));
    setMusics(prev => prev.map(m => ({ ...m, isActive: false })));
    musicService.destroyAudioElement();
  }, []);

  const nextMusic = useCallback(() => {
    if (musics.length === 0 || !currentMusic) return;
    
    const currentIndex = musics.findIndex(m => m.id === currentMusic.id);
    const nextIndex = (currentIndex + 1) % musics.length;
    playMusic(musics[nextIndex]);
  }, [musics, currentMusic, playMusic]);

  const previousMusic = useCallback(() => {
    if (musics.length === 0 || !currentMusic) return;
    
    const currentIndex = musics.findIndex(m => m.id === currentMusic.id);
    const prevIndex = currentIndex === 0 ? musics.length - 1 : currentIndex - 1;
    playMusic(musics[prevIndex]);
  }, [musics, currentMusic, playMusic]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState(prev => ({
        ...prev,
        currentTime: time
      }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setPlayerState(prev => ({
      ...prev,
      volume: clampedVolume
    }));
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !playerState.isMuted;
    }
    setPlayerState(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
  }, [playerState.isMuted]);

  const togglePlayPause = useCallback(() => {
    if (playerState.isPlaying) {
      pauseMusic();
    } else if (currentMusic) {
      resumeMusic();
    }
  }, [playerState.isPlaying, currentMusic, pauseMusic, resumeMusic]);

  useEffect(() => {
    loadMusics();
  }, [loadMusics]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      musicService.destroyAudioElement();
    };
  }, []);

  return {
    musics,
    currentMusic,
    playerState,
    loading,
    error,
    playMusic,
    pauseMusic,
    resumeMusic,
    stopMusic,
    nextMusic,
    previousMusic,
    seekTo,
    setVolume,
    toggleMute,
    togglePlayPause,
    uploadMusic,
    deleteMusic,
    refreshMusics: loadMusics
  };
};
