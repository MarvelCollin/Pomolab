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
  const [loadingRemaining, setLoadingRemaining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isChangingTrack = useRef(false);

  const loadFirstMusic = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cached = localStorage.getItem('pomolab-last-music');
      if (cached) {
        const cachedMusic = JSON.parse(cached);
        setCurrentMusic(cachedMusic);
        setMusics([cachedMusic]);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Failed to load cached music');
    }

    setLoading(false);
    
    try {
      const firstMusic = await musicService.getFirstRandomMusic();
      if (firstMusic) {
        setCurrentMusic(firstMusic);
        setMusics([firstMusic]);
        localStorage.setItem('pomolab-last-music', JSON.stringify(firstMusic));
      }
    } catch (err) {
      console.warn('Failed to load music');
    }
  }, []);

  const loadRemainingMusics = useCallback(async () => {
    if (loadingRemaining || hasLoadedAll) return;
    
    setLoadingRemaining(true);
    try {
      const currentFileName = currentMusic?.filePath.split('/').pop();
      let allRemaining: IMusic[] = [];
      let offset = 0;
      const batchSize = 20;
      
      while (true) {
        const batch = await musicService.getRemainingMusicsBatch(currentFileName, offset, batchSize);
        if (batch.length === 0) break;
        
        allRemaining = [...allRemaining, ...batch];
        offset += batchSize;
        
        if (batch.length < batchSize) break;
      }
      
      setMusics(prev => {
        const existing = prev.filter(m => m.isActive);
        return [...existing, ...allRemaining];
      });
      setHasLoadedAll(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load remaining musics');
    } finally {
      setLoadingRemaining(false);
    }
  }, [currentMusic, loadingRemaining, hasLoadedAll]);

  const loadMusics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await musicService.getMusicsWithDefault();
      setMusics(result.musics);
      setHasLoadedAll(true);
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
    if (musics.length === 0 || !currentMusic || isChangingTrack.current) return;
    
    isChangingTrack.current = true;
    
    const currentIndex = musics.findIndex(m => m.id === currentMusic.id);
    const nextIndex = (currentIndex + 1) % musics.length;
    const nextTrack = musics[nextIndex];
    
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

      audio.addEventListener('ended', () => {
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0
        }));
        if (!isChangingTrack.current) {
          nextMusic();
        }
      });

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
  }, [musics, currentMusic, playerState.volume, playerState.isMuted]);

  const previousMusic = useCallback(() => {
    if (musics.length === 0 || !currentMusic || isChangingTrack.current) return;
    
    isChangingTrack.current = true;
    
    const currentIndex = musics.findIndex(m => m.id === currentMusic.id);
    const prevIndex = currentIndex === 0 ? musics.length - 1 : currentIndex - 1;
    const prevTrack = musics[prevIndex];
    
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

      audio.addEventListener('ended', () => {
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0
        }));
        if (!isChangingTrack.current) {
          nextMusic();
        }
      });

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
  }, [musics, currentMusic, playerState.volume, playerState.isMuted]);

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

      audio.addEventListener('ended', () => {
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0
        }));
        if (!isChangingTrack.current) {
          nextMusic();
        }
      });

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
  }, [playerState.volume, playerState.isMuted]);

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
    loadFirstMusic();
  }, [loadFirstMusic]);

  useEffect(() => {
    if (musics.length > 0 && !currentMusic && autoPlay) {
      const firstMusic = musics[0];
      
      const initializeFirstMusic = () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }

        audioRef.current = musicService.createAudioElement(firstMusic.url);
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
          if (!isChangingTrack.current) {
            nextMusic();
          }
        });

        const attemptAutoPlay = async () => {
          try {
            await audio.play();
            setCurrentMusic(firstMusic);
            setPlayerState(prev => ({
              ...prev,
              isPlaying: true
            }));
            setMusics(prev => 
              prev.map(m => ({ ...m, isActive: m.id === firstMusic.id }))
            );
          } catch (error) {
            setCurrentMusic(firstMusic);
            setMusics(prev => 
              prev.map(m => ({ ...m, isActive: m.id === firstMusic.id }))
            );
            
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
          }
        };

        attemptAutoPlay();
      };
      
      initializeFirstMusic();
    }
  }, [musics, currentMusic, autoPlay, playerState.volume, playerState.isMuted]);

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
    loadingRemaining,
    error,
    autoPlay,
    hasLoadedAll,
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
    loadRemainingMusics,
    loadFirstMusic
  };
};
