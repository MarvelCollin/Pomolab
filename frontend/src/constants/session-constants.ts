export type SessionType = 'focus' | 'short-break' | 'long-break';

export const SESSION_TYPES = {
  FOCUS: 'focus' as const,
  SHORT_BREAK: 'short-break' as const,
  LONG_BREAK: 'long-break' as const,
} as const;

export const DEFAULT_SESSION_DURATIONS = {
  [SESSION_TYPES.FOCUS]: 25,
  [SESSION_TYPES.SHORT_BREAK]: 5,
  [SESSION_TYPES.LONG_BREAK]: 15,
} as const;

export const DEFAULT_SESSION_LABELS = {
  [SESSION_TYPES.FOCUS]: 'Focus Time',
  [SESSION_TYPES.SHORT_BREAK]: 'Short Break',
  [SESSION_TYPES.LONG_BREAK]: 'Long Break',
} as const;