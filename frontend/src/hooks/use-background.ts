import { useState, useEffect, useCallback } from 'react';
import { backgroundService } from '../services/background-service';
import type { IBackground } from '../interfaces/IBackground';

export const useBackground = () => {
  const [backgrounds, setBackgrounds] = useState<IBackground[]>([]);
  const [activeBackground, setActiveBackground] = useState<IBackground | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRemaining, setLoadingRemaining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);

  const loadFirstBackground = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const firstBackground = await backgroundService.getFirstRandomBackground();
      if (firstBackground) {
        setActiveBackground(firstBackground);
        setBackgrounds([firstBackground]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load first background');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRemainingBackgrounds = useCallback(async () => {
    if (loadingRemaining || hasLoadedAll) return;
    
    setLoadingRemaining(true);
    try {
      const currentFileName = activeBackground?.filePath.split('/').pop();
      let allRemaining: IBackground[] = [];
      let offset = 0;
      const batchSize = 20;
      
      while (true) {
        const batch = await backgroundService.getRemainingBackgroundsBatch(currentFileName, offset, batchSize);
        if (batch.length === 0) break;
        
        allRemaining = [...allRemaining, ...batch];
        offset += batchSize;
        
        if (batch.length < batchSize) break;
      }
      
      setBackgrounds(prev => {
        const existing = prev.filter(bg => bg.isActive);
        return [...existing, ...allRemaining];
      });
      setHasLoadedAll(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load remaining backgrounds');
    } finally {
      setLoadingRemaining(false);
    }
  }, [activeBackground, loadingRemaining, hasLoadedAll]);

  const loadBackgrounds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await backgroundService.getBackgroundsWithDefault();
      setBackgrounds(result.backgrounds);
      
      if (result.defaultBackground) {
        setActiveBackground(result.defaultBackground);
      }
      setHasLoadedAll(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load backgrounds');
    } finally {
      setLoading(false);
    }
  }, []);

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
    loadFirstBackground();
  }, [loadFirstBackground]);

  return {
    backgrounds,
    activeBackground,
    loading,
    loadingRemaining,
    error,
    hasLoadedAll,
    uploadBackground,
    deleteBackground,
    changeBackground,
    refreshBackgrounds: loadBackgrounds,
    loadRemainingBackgrounds,
    loadFirstBackground
  };
};