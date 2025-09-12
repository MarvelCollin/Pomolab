import { useState, useEffect, useCallback } from 'react';
import { audioEffectService } from '../services/audio-effect-service';
import type { IAudioEffect } from '../interfaces/IAudioEffect';

export const useAudioEffect = () => {
  const [audioEffects, setAudioEffects] = useState<IAudioEffect[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAudioEffects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const effects = await audioEffectService.getAudioEffects();
      setAudioEffects(effects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audio effects');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAudioEffect = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const newEffect = await audioEffectService.uploadAudioEffect(file);
      if (newEffect) {
        setAudioEffects(prev => [newEffect, ...prev]);
        return newEffect;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio effect');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAudioEffect = useCallback(async (effect: IAudioEffect) => {
    setLoading(true);
    setError(null);
    try {
      const success = await audioEffectService.deleteAudioEffect(effect.filePath);
      if (success) {
        setAudioEffects(prev => prev.filter(e => e.id !== effect.id));
        audioEffectService.destroyAudioElement(effect.id);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete audio effect');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const playEffect = useCallback(async (effect: IAudioEffect) => {
    try {
      const audioElement = audioEffectService.getAudioElement(effect.id) || 
                          audioEffectService.createAudioElement(effect.id, effect.url);
      
      audioElement.volume = effect.volume;
      audioElement.muted = effect.isMuted;
      
      await audioEffectService.playEffect(effect.id);
      
      setAudioEffects(prev => 
        prev.map(e => e.id === effect.id ? { ...e, isActive: true } : e)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play audio effect');
    }
  }, []);

  const pauseEffect = useCallback((effectId: string) => {
    audioEffectService.pauseEffect(effectId);
    setAudioEffects(prev => 
      prev.map(e => e.id === effectId ? { ...e, isActive: false } : e)
    );
  }, []);

  const stopEffect = useCallback((effectId: string) => {
    audioEffectService.stopEffect(effectId);
    setAudioEffects(prev => 
      prev.map(e => e.id === effectId ? { ...e, isActive: false } : e)
    );
  }, []);

  const setEffectVolume = useCallback((effectId: string, volume: number) => {
    audioEffectService.setEffectVolume(effectId, volume);
    setAudioEffects(prev => 
      prev.map(e => e.id === effectId ? { ...e, volume } : e)
    );
  }, []);

  const setEffectMuted = useCallback((effectId: string, muted: boolean) => {
    audioEffectService.setEffectMuted(effectId, muted);
    setAudioEffects(prev => 
      prev.map(e => e.id === effectId ? { ...e, isMuted: muted } : e)
    );
  }, []);

  const toggleEffectMute = useCallback((effectId: string) => {
    const effect = audioEffects.find(e => e.id === effectId);
    if (effect) {
      setEffectMuted(effectId, !effect.isMuted);
    }
  }, [audioEffects, setEffectMuted]);

  const pauseAllEffects = useCallback(() => {
    audioEffectService.pauseAllEffects();
    setAudioEffects(prev => prev.map(e => ({ ...e, isActive: false })));
  }, []);

  const stopAllEffects = useCallback(() => {
    audioEffectService.stopAllEffects();
    setAudioEffects(prev => prev.map(e => ({ ...e, isActive: false })));
  }, []);

  const getMasterVolume = useCallback(() => {
    if (audioEffects.length === 0) return 0;
    const activeEffects = audioEffects.filter(e => e.isActive);
    if (activeEffects.length === 0) return 0;
    return activeEffects.reduce((sum, e) => sum + e.volume, 0) / activeEffects.length;
  }, [audioEffects]);

  const setMasterVolume = useCallback((volume: number) => {
    const activeEffects = audioEffects.filter(e => e.isActive);
    activeEffects.forEach(effect => {
      setEffectVolume(effect.id, volume);
    });
  }, [audioEffects, setEffectVolume]);

  const toggleMasterMute = useCallback(() => {
    const activeEffects = audioEffects.filter(e => e.isActive);
    const allMuted = activeEffects.every(e => e.isMuted);
    activeEffects.forEach(effect => {
      setEffectMuted(effect.id, !allMuted);
    });
  }, [audioEffects, setEffectMuted]);

  useEffect(() => {
    loadAudioEffects();
  }, [loadAudioEffects]);

  useEffect(() => {
    return () => {
      audioEffectService.destroyAllAudioElements();
    };
  }, []);

  return {
    audioEffects,
    loading,
    error,
    playEffect,
    pauseEffect,
    stopEffect,
    setEffectVolume,
    setEffectMuted,
    toggleEffectMute,
    pauseAllEffects,
    stopAllEffects,
    getMasterVolume,
    setMasterVolume,
    toggleMasterMute,
    uploadAudioEffect,
    deleteAudioEffect,
    refreshAudioEffects: loadAudioEffects
  };
};