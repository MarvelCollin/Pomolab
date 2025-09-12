export interface IPomodoroTimer {
  onSessionComplete: (type: 'focus' | 'short-break' | 'long-break') => void;
  isMinimized?: boolean;
}
