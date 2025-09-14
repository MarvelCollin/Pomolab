import { useState, useEffect, useCallback } from 'react';
import { backgroundService } from '../services/background-service';
import type { IBackground } from '../interfaces/IBackground';

export const useBackground = () => {
  const [backgrounds, setBackgrounds] = useState<IBackground[]>([]);
  const [activeBackground, setActiveBackground] = useState<IBackground | null>(null);
  const [loading, setLoading] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBackgrounds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await backgroundService.getBackgroundsWithDefault();
      setBackgrounds(result.backgrounds);
      
      if (result.defaultBackground) {
        setActiveBackground(result.defaultBackground);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load backgrounds');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRemainingBackgrounds = useCallback(async () => {
    return Promise.resolve();
  }, []);

  const uploadBackground = useCallback(async (_file: File) => {
    setError('Upload functionality is not available with local files');
    return null;
  }, []);

  const deleteBackground = useCallback(async (_background: IBackground) => {
    setError('Delete functionality is not available with local files');
    return false;
  }, []);

  const changeBackground = useCallback((background: IBackground) => {
    setBackgrounds(prev => 
      prev.map(bg => ({ ...bg, isActive: bg.id === background.id }))
    );
    setActiveBackground({ ...background, isActive: true });
    setMediaReady(false);
  }, []);

  const onMediaReady = useCallback(() => {
    setMediaReady(true);
  }, []);

  useEffect(() => {
    loadBackgrounds();
  }, [loadBackgrounds]);

  return {
    backgrounds,
    activeBackground,
    loading,
    mediaReady,
    error,
    uploadBackground,
    deleteBackground,
    changeBackground,
    onMediaReady,
    refreshBackgrounds: loadBackgrounds,
    loadRemainingBackgrounds
  };
};