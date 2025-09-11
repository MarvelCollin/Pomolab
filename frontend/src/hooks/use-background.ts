import { useState, useEffect, useCallback } from 'react';
import { backgroundService } from '../services/background-service';
import type { IBackground } from '../interfaces/IBackground';

export const useBackground = () => {
  const [backgrounds, setBackgrounds] = useState<IBackground[]>([]);
  const [activeBackground, setActiveBackground] = useState<IBackground | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBackgrounds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedBackgrounds = await backgroundService.getBackgrounds();
      setBackgrounds(fetchedBackgrounds);
      
      if (fetchedBackgrounds.length > 0 && !activeBackground) {
        const defaultBackground = fetchedBackgrounds[0];
        setActiveBackground({ ...defaultBackground, isActive: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load backgrounds');
    } finally {
      setLoading(false);
    }
  }, [activeBackground]);

  const uploadBackground = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const newBackground = await backgroundService.uploadBackground(file);
      if (newBackground) {
        setBackgrounds(prev => [newBackground, ...prev]);
        return newBackground;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload background');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBackground = useCallback(async (background: IBackground) => {
    setLoading(true);
    setError(null);
    try {
      const success = await backgroundService.deleteBackground(background.filePath);
      if (success) {
        setBackgrounds(prev => prev.filter(bg => bg.id !== background.id));
        if (activeBackground?.id === background.id) {
          const remainingBackgrounds = backgrounds.filter(bg => bg.id !== background.id);
          setActiveBackground(remainingBackgrounds.length > 0 ? remainingBackgrounds[0] : null);
        }
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete background');
      return false;
    } finally {
      setLoading(false);
    }
  }, [activeBackground, backgrounds]);

  const changeBackground = useCallback((background: IBackground) => {
    setBackgrounds(prev => 
      prev.map(bg => ({ ...bg, isActive: bg.id === background.id }))
    );
    setActiveBackground({ ...background, isActive: true });
  }, []);

  useEffect(() => {
    loadBackgrounds();
  }, [loadBackgrounds]);

  return {
    backgrounds,
    activeBackground,
    loading,
    error,
    uploadBackground,
    deleteBackground,
    changeBackground,
    refreshBackgrounds: loadBackgrounds
  };
};