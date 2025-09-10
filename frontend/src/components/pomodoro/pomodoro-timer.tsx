import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2 } from 'lucide-react';

interface PomodoroTimerProps {
  onSessionComplete: (type: 'focus' | 'short-break' | 'long-break') => void;
}

export default function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [currentSession, setCurrentSession] = useState<'focus' | 'short-break' | 'long-break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sessionDurations = {
    focus: 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60
  };

  const sessionLabels = {
    focus: 'Focus Time',
    'short-break': 'Short Break',
    'long-break': 'Long Break'
  };


  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
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
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
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
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionDurations[currentSession]);
  };

  const switchSession = (session: 'focus' | 'short-break' | 'long-break') => {
    setCurrentSession(session);
    setTimeLeft(sessionDurations[session]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((sessionDurations[currentSession] - timeLeft) / sessionDurations[currentSession]) * 100;

  return (
    <div className="pomodoro-timer">
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-6">
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

        <div className="relative mb-6">
          <div className="w-48 h-48 mx-auto rounded-full bg-white/5 backdrop-blur-2xl flex items-center justify-center relative overflow-hidden border-4 border-white/10 shadow-2xl">
            <div 
              className={`absolute inset-0 transition-all duration-1000`}
              style={{
                background: `conic-gradient(rgba(255, 255, 255, 0.3) ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`,
              }}
            />
            <div className="absolute inset-2 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/10">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1 drop-shadow-lg">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-white/70 text-xs uppercase tracking-wide font-medium">
                  {sessionLabels[currentSession]}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleTimer}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-2xl border border-white/10 shadow-xl flex items-center justify-center hover:bg-white/30 transform hover:scale-105 transition-all duration-200"
          >
            {isRunning ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
          
          <button
            onClick={resetTimer}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-2xl border border-white/10 flex items-center justify-center hover:bg-white/20 shadow-lg transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4 text-white/80" />
          </button>

          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-2xl border border-white/10 flex items-center justify-center hover:bg-white/20 shadow-lg transition-all duration-200">
            <Settings className="w-4 h-4 text-white/80" />
          </button>

          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-2xl border border-white/10 flex items-center justify-center hover:bg-white/20 shadow-lg transition-all duration-200">
            <Volume2 className="w-4 h-4 text-white/80" />
          </button>
        </div>

        <div className="mt-4 text-white/60 text-xs">
          Session #{sessionCount + 1} • {Math.floor(sessionCount / 4)} cycles completed
        </div>
      </div>
    </div>
  );
}
