import { useCallback, useEffect, useRef, useMemo } from 'react';
import type { AppAction, AppState } from './use-app-state';

export const useTimerLogic = (
  dispatch: React.Dispatch<AppAction>,
  pomodoro: AppState['pomodoro'],
  handleSessionComplete: (sessionType: 'focus' | 'short-break' | 'long-break') => void
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sessionDurations = useMemo(() => ({
    focus: pomodoro.customDurations.focus * 60,
    'short-break': pomodoro.customDurations['short-break'] * 60,
    'long-break': pomodoro.customDurations['long-break'] * 60
  }), [pomodoro.customDurations]);

  const sessionLabels = useMemo(() => ({
    focus: 'Focus Time',
    'short-break': 'Short Break',
    'long-break': 'Long Break'
  }), []);

  useEffect(() => {
    if (pomodoro.isTimerRunning && pomodoro.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'UPDATE_POMODORO', payload: { timeLeft: pomodoro.timeLeft - 1 } });
      }, 1000);
    } else if (pomodoro.timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pomodoro.isTimerRunning, pomodoro.timeLeft, dispatch]);

  const handleTimerComplete = useCallback(() => {
    dispatch({ type: 'UPDATE_POMODORO', payload: { isTimerRunning: false } });
    
    if (pomodoro.soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.error('Audio playback failed:', error);
      }
    }
    
    handleSessionComplete(pomodoro.currentSession);
    
    if (pomodoro.currentSession === 'focus') {
      const newCount = pomodoro.sessionCount + 1;
      
      if (newCount % 4 === 0) {
        dispatch({ 
          type: 'UPDATE_POMODORO', 
          payload: { 
            sessionCount: newCount,
            currentSession: 'long-break',
            timeLeft: sessionDurations['long-break']
          }
        });
      } else {
        dispatch({ 
          type: 'UPDATE_POMODORO', 
          payload: { 
            sessionCount: newCount,
            currentSession: 'short-break',
            timeLeft: sessionDurations['short-break']
          }
        });
      }
    } else {
      dispatch({ 
        type: 'UPDATE_POMODORO', 
        payload: { 
          currentSession: 'focus',
          timeLeft: sessionDurations.focus
        }
      });
    }
  }, [pomodoro, sessionDurations, handleSessionComplete, dispatch]);

  const toggleTimer = useCallback(() => {
    dispatch({ type: 'TOGGLE_TIMER' });
  }, [dispatch]);

  const resetTimer = useCallback(() => {
    dispatch({ type: 'RESET_TIMER' });
  }, [dispatch]);

  const closeMiniTimer = useCallback(() => {
    dispatch({ type: 'UPDATE_UI', payload: { pomodoroMinimized: false } });
  }, [dispatch]);

  return {
    sessionDurations,
    sessionLabels,
    toggleTimer,
    resetTimer,
    closeMiniTimer
  };
};

