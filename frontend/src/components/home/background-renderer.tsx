import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { IBackground } from '../../interfaces/IBackground';
import type { AppAction } from '../../hooks/use-app-state';

interface BackgroundRendererProps {
  activeBackground: IBackground | null;
  backgroundsLoading: boolean;
  backgroundVisible: boolean;
  backgroundLoaded: boolean;
  dispatch: React.Dispatch<AppAction>;
}

const BackgroundRenderer = memo(function BackgroundRenderer({
  activeBackground,
  backgroundsLoading,
  backgroundVisible,
  backgroundLoaded,
  dispatch
}: BackgroundRendererProps) {
  const handleBackgroundLoad = useCallback(() => {
    dispatch({ type: 'UPDATE_UI', payload: { backgroundLoaded: true } });
    setTimeout(() => {
      dispatch({ type: 'UPDATE_UI', payload: { backgroundVisible: true } });
    }, 300);
    setTimeout(() => {
      dispatch({ type: 'UPDATE_UI', payload: { showContent: true } });
    }, 800);
  }, [dispatch]);

  if (!activeBackground && !backgroundsLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: backgroundVisible ? 1 : 0 }}
        transition={{ duration: 1.0, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{ background: 'var(--gradient-soft)' }}
        onAnimationComplete={() => {
          if (!backgroundLoaded) {
            dispatch({ type: 'UPDATE_UI', payload: { backgroundLoaded: true } });
          }
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,243,213,0.1),transparent_50%)]" />
      </motion.div>
    );
  }

  if (!activeBackground) return null;

  if (activeBackground.type === 'video') {
    return (
      <motion.video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        key={activeBackground.id}
        onLoadedData={handleBackgroundLoad}
        onCanPlayThrough={handleBackgroundLoad}
        initial={{ opacity: 0 }}
        animate={{ opacity: backgroundVisible ? 1 : 0 }}
        transition={{ duration: 1.0, ease: "easeInOut" }}
      >
        <source src={activeBackground.url} type="video/mp4" />
        Your browser does not support the video tag.
      </motion.video>
    );
  }

  return (
    <motion.div
      className="w-full h-full bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `url(${activeBackground.url})`
      }}
      onLoad={handleBackgroundLoad}
      initial={{ opacity: 0 }}
      animate={{ opacity: backgroundVisible ? 1 : 0 }}
      transition={{ duration: 1.0, ease: "easeInOut" }}
    />
  );
});

export default BackgroundRenderer;
