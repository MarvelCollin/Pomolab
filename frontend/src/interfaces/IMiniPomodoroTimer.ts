export interface IMiniPomodoroTimer {
  currentSession: 'focus' | 'short-break' | 'long-break';
  timeLeft: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onClose: () => void;
  sessionLabels: Record<string, string>;
}
