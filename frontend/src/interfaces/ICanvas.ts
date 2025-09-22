import type { IUser } from './IUser';

export interface ICanvasModal {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    id: number;
    username: string;
  } | null;
  pendingSession?: {
    sessionId: string;
    sessionName?: string;
  } | null;
  onSessionJoined?: () => void;
}

export interface IDrawingTool {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
}

export interface IDrawingAction {
  type: 'stroke_start' | 'stroke_continue' | 'stroke_end' | 'shape' | 'clear' | 'erase' | 'canvas_state' | 'undo' | 'cursor_move';
  tool: string;
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  points?: {x: number, y: number}[];
  color: string;
  size: number;
  userId: number;
  username?: string;
  timestamp: number;
  id: string;
  actions?: IDrawingAction[];
}

export interface IUserCursor {
  userId: number;
  username: string;
  x: number;
  y: number;
  timestamp: number;
  lastUpdate: number;
  avatar?: string;
}

export interface IViewportState {
  x: number;
  y: number;
  zoom: number;
}

export interface ICanvasSession {
  id: string;
  name: string;
  participants: IUser[];
  createdBy: number;
  createdAt: string;
}