export interface IPomodoroTimer {
  onSessionComplete: (type: 'focus' | 'short-break' | 'long-break') => void;
  isMinimized?: boolean;
  currentSession?: 'focus' | 'short-break' | 'long-break';
  timeLeft?: number;
  isRunning?: boolean;
  sessionCount?: number;
  soundEnabled?: boolean;
  customDurations?: {
    focus: number;
    'short-break': number;
    'long-break': number;
  };
  sessionDurations?: {
    focus: number;
    'short-break': number;
    'long-break': number;
  };
  sessionLabels?: Record<string, string>;
  onToggleTimer?: () => void;
  onResetTimer?: () => void;
  onSetCurrentSession?: (session: 'focus' | 'short-break' | 'long-break') => void;
  onSetTimeLeft?: (time: number) => void;
  onSetSoundEnabled?: (enabled: boolean) => void;
  onSetCustomDurations?: (durations: { focus: number; 'short-break': number; 'long-break': number; }) => void;
}
