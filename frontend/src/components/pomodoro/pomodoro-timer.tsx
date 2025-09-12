import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { IPomodoroTimer } from '../../interfaces/IPomodoroTimer';

export default function PomodoroTimer({ 
  onSessionComplete, 
  isMinimized = false,
  currentSession: propCurrentSession,
  timeLeft: propTimeLeft,
  isRunning: propIsRunning,
  sessionCount: propSessionCount,
  soundEnabled: propSoundEnabled,
  customDurations: propCustomDurations,
  sessionDurations: propSessionDurations,
  sessionLabels: propSessionLabels,
  onToggleTimer: propOnToggleTimer,
  onResetTimer: propOnResetTimer,
  onSetCurrentSession,
  onSetTimeLeft,
  onSetSoundEnabled,
  onSetCustomDurations
}: IPomodoroTimer) {
  const [internalCurrentSession, setInternalCurrentSession] = useState<'focus' | 'short-break' | 'long-break'>('focus');
  const [internalTimeLeft, setInternalTimeLeft] = useState(25 * 60);
  const [internalIsRunning, setInternalIsRunning] = useState(false);
  const [internalSessionCount, setInternalSessionCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [internalSoundEnabled, setInternalSoundEnabled] = useState(true);
  const [internalCustomDurations, setInternalCustomDurations] = useState({
    focus: 25,
    'short-break': 5,
    'long-break': 15
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentSession = propCurrentSession ?? internalCurrentSession;
  const timeLeft = propTimeLeft ?? internalTimeLeft;
  const isRunning = propIsRunning ?? internalIsRunning;
  const sessionCount = propSessionCount ?? internalSessionCount;
  const soundEnabled = propSoundEnabled ?? internalSoundEnabled;
  const customDurations = propCustomDurations ?? internalCustomDurations;
  
  const sessionDurations = propSessionDurations ?? {
    focus: customDurations.focus * 60,
    'short-break': customDurations['short-break'] * 60,
    'long-break': customDurations['long-break'] * 60
  };

  const sessionLabels = propSessionLabels ?? {
    focus: 'Focus Time',
    'short-break': 'Short Break',
    'long-break': 'Long Break'
  };


  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        if (onSetTimeLeft) {
          onSetTimeLeft((prev) => prev - 1);
        } else {
          setInternalTimeLeft((prev) => prev - 1);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onSetTimeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    if (soundEnabled) {
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
    }
    
    onSessionComplete(currentSession);
    
    if (currentSession === 'focus') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      
      if (newCount % 4 === 0) {
        setCurrentSession('long-break');
        setTimeLeft(sessionDurations['long-break']);
      } else {
        setCurrentSession('short-break');
        setTimeLeft(sessionDurations['short-break']);
      }
    } else {
      setCurrentSession('focus');
      setTimeLeft(sessionDurations.focus);
    }
  };

  const toggleTimer = () => {
    if (propOnToggleTimer) {
      propOnToggleTimer();
    } else {
      setInternalIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    if (propOnResetTimer) {
      propOnResetTimer();
    } else {
      setInternalIsRunning(false);
      setInternalTimeLeft(sessionDurations[currentSession]);
    }
  };

  const switchSession = (session: 'focus' | 'short-break' | 'long-break') => {
    if (onSetCurrentSession && onSetTimeLeft) {
      onSetCurrentSession(session);
      onSetTimeLeft(sessionDurations[session]);
      if (propOnToggleTimer && isRunning) {
        propOnToggleTimer();
      }
    } else {
      setInternalCurrentSession(session);
      setInternalTimeLeft(sessionDurations[session]);
      setInternalIsRunning(false);
    }
  };

  const updateDuration = (session: keyof typeof customDurations, minutes: number) => {
    if (onSetCustomDurations) {
      onSetCustomDurations(prev => ({
        ...prev,
        [session]: minutes
      }));
      
      if (currentSession === session && onSetTimeLeft) {
        onSetTimeLeft(minutes * 60);
        if (propOnToggleTimer && isRunning) {
          propOnToggleTimer();
        }
      }
    } else {
      setInternalCustomDurations(prev => ({
        ...prev,
        [session]: minutes
      }));
      
      if (currentSession === session) {
        setInternalTimeLeft(minutes * 60);
        setInternalIsRunning(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((sessionDurations[currentSession] - timeLeft) / sessionDurations[currentSession]) * 100;

  return (
    <motion.div 
      className="pomodoro-timer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">{isMinimized && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={toggleTimer}
              className={`w-8 h-8 rounded-full bg-white/20 backdrop-blur-2xl border border-white/10 shadow-lg flex items-center justify-center hover:bg-white/30 transition-all duration-200 ${isRunning ? 'animate-pulse' : ''}`}
            >
              {isRunning ? (
                <Pause className="w-3 h-3 text-white" />
              ) : (
                <Play className="w-3 h-3 text-white ml-0.5" />
              )}
            </button>
            <div className="text-white text-sm font-medium">
              {formatTime(timeLeft)} • {sessionLabels[currentSession]}
            </div>
            <button
              onClick={resetTimer}
              className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-2xl border border-white/10 flex items-center justify-center hover:bg-white/20 shadow-lg transition-all duration-200"
            >
              <RotateCcw className="w-3 h-3 text-white/80" />
            </button>
          </div>
        )}
        <div 
          className={`flex justify-center gap-2 transition-all duration-500 ease-in-out ${
            isMinimized ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto mb-6'
          }`}
        >
          {Object.keys(sessionDurations).map((session) => (
            <button
              key={session}
              onClick={() => switchSession(session as keyof typeof sessionDurations)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 border backdrop-blur-2xl ${
                currentSession === session
                  ? 'bg-white/20 text-white shadow-lg border-white/20 drop-shadow'
                  : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
              }`}
            >
              {sessionLabels[session as keyof typeof sessionLabels]}
            </button>
          ))}
        </div>

        <div className={`relative transition-all duration-500 ease-in-out ${isMinimized ? 'mb-3' : 'mb-6'}`}>
          <div className={`mx-auto rounded-full bg-white/5 backdrop-blur-2xl flex items-center justify-center relative overflow-hidden border-4 border-white/10 shadow-2xl transition-all duration-500 ease-in-out ${isMinimized ? 'w-32 h-32' : 'w-48 h-48'}`}>
            <div 
              className="absolute inset-0 transition-all duration-1000"
              style={{
                background: `conic-gradient(rgba(255, 255, 255, 0.3) ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`,
              }}
            />
            <div className="absolute inset-2 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/10">
              <div className="text-center">
                <div className={`font-bold text-white mb-1 drop-shadow-lg transition-all duration-500 ease-in-out ${isMinimized ? 'text-xl' : 'text-4xl'}`}>
                  {formatTime(timeLeft)}
                </div>
                <div 
                  className={`text-white/70 text-xs uppercase tracking-wide font-medium transition-all duration-500 ease-in-out ${
                    isMinimized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
                  }`}
                >
                  {sessionLabels[currentSession]}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`flex items-center justify-center transition-all duration-500 ease-in-out ${
            isMinimized ? 'opacity-0 h-0 overflow-hidden gap-0' : 'opacity-100 h-auto gap-3'
          }`}
        >
          <button
            onClick={toggleTimer}
            className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-2xl border border-white/10 shadow-xl flex items-center justify-center hover:bg-white/30 transform hover:scale-105 transition-all duration-200 ${isRunning ? 'animate-pulse' : ''}`}
          >
            {isRunning ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
          
          <button
            onClick={resetTimer}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-2xl border border-white/10 flex items-center justify-center hover:bg-white/20 shadow-lg transition-all duration-200 hover:scale-105"
          >
            <RotateCcw className="w-4 h-4 text-white/80" />
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-2xl border border-white/10 flex items-center justify-center hover:bg-white/20 shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Settings className="w-4 h-4 text-white/80" />
          </button>

          <button 
            onClick={() => onSetSoundEnabled ? onSetSoundEnabled(!soundEnabled) : setInternalSoundEnabled(!soundEnabled)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-2xl border border-white/10 flex items-center justify-center hover:bg-white/20 shadow-lg transition-all duration-200 hover:scale-105"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-white/80" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/80" />
            )}
          </button>
        </div>

        <div 
          className={`text-white/60 text-xs transition-all duration-500 ease-in-out ${
            isMinimized ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-4'
          }`}
        >
          Session #{sessionCount + 1} • {Math.floor(sessionCount / 4)} cycles completed
        </div>

        {showSettings && !isMinimized && (
          <div className="mt-6 bg-white/10 backdrop-blur-2xl rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium text-sm">Timer Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-xs">Focus Duration</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customDurations.focus}
                    onChange={(e) => updateDuration('focus', Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="120"
                    className="w-12 bg-white/15 backdrop-blur-2xl border border-white/10 rounded px-2 py-1 text-xs text-center outline-none text-white"
                  />
                  <span className="text-white/60 text-xs">min</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-xs">Short Break</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customDurations['short-break']}
                    onChange={(e) => updateDuration('short-break', Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="30"
                    className="w-12 bg-white/15 backdrop-blur-2xl border border-white/10 rounded px-2 py-1 text-xs text-center outline-none text-white"
                  />
                  <span className="text-white/60 text-xs">min</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-xs">Long Break</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customDurations['long-break']}
                    onChange={(e) => updateDuration('long-break', Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="60"
                    className="w-12 bg-white/15 backdrop-blur-2xl border border-white/10 rounded px-2 py-1 text-xs text-center outline-none text-white"
                  />
                  <span className="text-white/60 text-xs">min</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-white/80 text-xs">Sound Notifications</span>
                <button
                  onClick={() => onSetSoundEnabled ? onSetSoundEnabled(!soundEnabled) : setInternalSoundEnabled(!soundEnabled)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${soundEnabled ? 'bg-green-500' : 'bg-white/20'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${soundEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
