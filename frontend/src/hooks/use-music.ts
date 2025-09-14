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
  const [musicReady, setMusicReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isChangingTrack = useRef(false);

  const createAutoNextHandler = useCallback((currentTrackId: string) => {
    return () => {
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0
      }));
      if (!isChangingTrack.current && musics.length > 1) {
        const timeoutId = setTimeout(() => {
          const newRemainingMusics = musics.filter(m => m.id !== currentTrackId);
          const autoNextTrack = musicService.getRandomMusic(newRemainingMusics.length > 0 ? newRemainingMusics : musics);
          if (autoNextTrack) {
            setCurrentMusic(autoNextTrack);
            setMusics(prev => prev.map(m => ({ ...m, isActive: m.id === autoNextTrack.id })));
            
            isChangingTrack.current = true;
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.removeEventListener('loadedmetadata', () => {});
              audioRef.current.removeEventListener('timeupdate', () => {});
              audioRef.current.removeEventListener('ended', () => {});
            }

            audioRef.current = musicService.createAudioElement(autoNextTrack.url);
            const newAudio = audioRef.current;
            newAudio.volume = playerState.volume;
            newAudio.muted = playerState.isMuted;

            const handleLoadedMetadata = () => {
              setPlayerState(prev => ({ ...prev, duration: newAudio.duration || 0 }));
            };

            const handleTimeUpdate = () => {
              setPlayerState(prev => ({ ...prev, currentTime: newAudio.currentTime || 0 }));
            };

            newAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
            newAudio.addEventListener('timeupdate', handleTimeUpdate);
            newAudio.addEventListener('ended', createAutoNextHandler(autoNextTrack.id));

            newAudio.play()
              .then(() => {
                setPlayerState(prev => ({ ...prev, isPlaying: true }));
                isChangingTrack.current = false;
              })
              .catch(() => {
                setError('Failed to play next music');
                isChangingTrack.current = false;
              });
          }
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    };
  }, [musics, playerState.volume, playerState.isMuted]);

  const loadMusics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await musicService.getMusics();
      setMusics(result);
      setMusicReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load musics');
      setMusicReady(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRemainingMusics = useCallback(async () => {
    return Promise.resolve();
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

  const nextMusic = useCallback(() => {
    if (musics.length === 0 || isChangingTrack.current) return;
    
    isChangingTrack.current = true;
    
    const remainingMusics = musics.filter(m => m.id !== currentMusic?.id);
    const nextTrack = musicService.getRandomMusic(remainingMusics.length > 0 ? remainingMusics : musics);
    
    if (nextTrack) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = musicService.createAudioElement(nextTrack.url);
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

      const handleEnded = createAutoNextHandler(nextTrack.id);

      audio.addEventListener('ended', handleEnded);

      audio.play()
        .then(() => {
          setCurrentMusic(nextTrack);
          setPlayerState(prev => ({
            ...prev,
            isPlaying: true
          }));
          setMusics(prev => 
            prev.map(m => ({ ...m, isActive: m.id === nextTrack.id }))
          );
          isChangingTrack.current = false;
        })
        .catch(() => {
          setError('Failed to play next music');
          isChangingTrack.current = false;
        });
    } else {
      isChangingTrack.current = false;
    }
  }, [musics, currentMusic?.id, createAutoNextHandler]);

  const previousMusic = useCallback(() => {
    if (musics.length === 0 || isChangingTrack.current) return;
    
    isChangingTrack.current = true;
    
    const remainingMusics = musics.filter(m => m.id !== currentMusic?.id);
    const prevTrack = musicService.getRandomMusic(remainingMusics.length > 0 ? remainingMusics : musics);
    
    if (prevTrack) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = musicService.createAudioElement(prevTrack.url);
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

      const handleEnded = createAutoNextHandler(prevTrack.id);

      audio.addEventListener('ended', handleEnded);

      audio.play()
        .then(() => {
          setCurrentMusic(prevTrack);
          setPlayerState(prev => ({
            ...prev,
            isPlaying: true
          }));
          setMusics(prev => 
            prev.map(m => ({ ...m, isActive: m.id === prevTrack.id }))
          );
          isChangingTrack.current = false;
        })
        .catch(() => {
          setError('Failed to play previous music');
          isChangingTrack.current = false;
        });
    } else {
      isChangingTrack.current = false;
    }
  }, [musics, currentMusic?.id, createAutoNextHandler]);

  const playMusic = useCallback((music: IMusic) => {
    try {
      isChangingTrack.current = true;
      
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

      audio.addEventListener('ended', createAutoNextHandler(music.id));

      audio.addEventListener('error', () => {
        setError('Failed to play music');
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false
        }));
        isChangingTrack.current = false;
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
          isChangingTrack.current = false;
        })
        .catch(() => {
          setError('Failed to play music');
          isChangingTrack.current = false;
        });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play music');
      isChangingTrack.current = false;
    }
  }, [playerState.volume, playerState.isMuted, musics, createAutoNextHandler]);

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

  const togglePlayPause = useCallback(() => {
    if (playerState.isPlaying) {
      pauseMusic();
    } else if (currentMusic) {
      resumeMusic();
    }
  }, [playerState.isPlaying, currentMusic, pauseMusic, resumeMusic]);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay(prev => !prev);
  }, []);

  useEffect(() => {
    loadMusics();
  }, [loadMusics]);

  useEffect(() => {
    if (musics.length > 0 && !currentMusic && autoPlay) {
      const randomMusic = musicService.getRandomMusic(musics);
      
      if (randomMusic) {
        setCurrentMusic(randomMusic);
        setMusics(prev => 
          prev.map(m => ({ ...m, isActive: m.id === randomMusic.id }))
        );
        
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }

          audioRef.current = musicService.createAudioElement(randomMusic.url);
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

          const handleEnded = createAutoNextHandler(randomMusic.id);
          audio.addEventListener('ended', handleEnded);

          audio.play().catch(() => {
            const handleUserInteraction = async () => {
              try {
                await audio.play();
                setPlayerState(prev => ({
                  ...prev,
                  isPlaying: true
                }));
                document.removeEventListener('click', handleUserInteraction);
                document.removeEventListener('keydown', handleUserInteraction);
              } catch {}
            };
            
            document.addEventListener('click', handleUserInteraction, { once: true });
            document.addEventListener('keydown', handleUserInteraction, { once: true });
          });
        }, 100);
      }
    }
  }, [musics, currentMusic, autoPlay, playerState.volume, playerState.isMuted, createAutoNextHandler]);

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
    musicReady,
    error,
    autoPlay,
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
    toggleAutoPlay,
    uploadMusic,
    deleteMusic,
    refreshMusics: loadMusics,
    loadRemainingMusics
  };
};
