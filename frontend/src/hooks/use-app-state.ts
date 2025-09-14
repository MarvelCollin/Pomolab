import { useReducer } from 'react';
import type { ITask } from '../interfaces/ITask';
import type { IUser } from '../interfaces/IUser';

export interface AppState {
  tasks: ITask[];
  tasksLoading: boolean;
  tasksError: string | null;
  selectedTask: ITask | null;
  ui: {
    pomodoroMinimized: boolean;
    tasksMinimized: boolean;
    isMinimalMode: boolean;
    backgroundLoaded: boolean;
    backgroundVisible: boolean;
    backgroundMediaReady: boolean;
    musicReady: boolean;
    showContent: boolean;
    showBackgroundSelector: boolean;
    showMusicPlayer: boolean;
    showAudioEffects: boolean;
    initialLoadComplete: boolean;
    showSearchModal: boolean;
    showFriendsModal: boolean;
    showLoginModal: boolean;
  };
  auth: {
    currentUser: IUser | null;
    authToken: string | null;
  };
  pomodoro: {
    currentSession: 'focus' | 'short-break' | 'long-break';
    timeLeft: number;
    isTimerRunning: boolean;
    sessionCount: number;
    soundEnabled: boolean;
    customDurations: {
      focus: number;
      'short-break': number;
      'long-break': number;
    };
  };
}

export type AppAction =
  | { type: 'SET_TASKS'; payload: ITask[] }
  | { type: 'SET_TASKS_LOADING'; payload: boolean }
  | { type: 'SET_TASKS_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_TASK'; payload: ITask | null }
  | { type: 'UPDATE_UI'; payload: Partial<AppState['ui']> }
  | { type: 'SET_AUTH'; payload: Partial<AppState['auth']> }
  | { type: 'UPDATE_POMODORO'; payload: Partial<AppState['pomodoro']> }
  | { type: 'RESET_TIMER'; payload?: never }
  | { type: 'TOGGLE_TIMER'; payload?: never }
  | { type: 'COMPLETE_SESSION'; payload?: never }
  | { type: 'INIT_COMPLETE'; payload?: never }
  | { type: 'MEDIA_READY'; payload?: never };

const initialState: AppState = {
  tasks: [],
  tasksLoading: false,
  tasksError: null,
  selectedTask: null,
  ui: {
    pomodoroMinimized: false,
    tasksMinimized: false,
    isMinimalMode: false,
    backgroundLoaded: false,
    backgroundVisible: false,
    backgroundMediaReady: false,
    musicReady: false,
    showContent: false,
    showBackgroundSelector: false,
    showMusicPlayer: false,
    showAudioEffects: false,
    initialLoadComplete: false,
    showSearchModal: false,
    showFriendsModal: false,
    showLoginModal: false,
  },
  auth: {
    currentUser: null,
    authToken: null,
  },
  pomodoro: {
    currentSession: 'focus',
    timeLeft: 25 * 60,
    isTimerRunning: false,
    sessionCount: 0,
    soundEnabled: true,
    customDurations: {
      focus: 25,
      'short-break': 5,
      'long-break': 15
    }
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_TASKS_LOADING':
      return { ...state, tasksLoading: action.payload };
    case 'SET_TASKS_ERROR':
      return { ...state, tasksError: action.payload };
    case 'SET_SELECTED_TASK':
      return { ...state, selectedTask: action.payload };
    case 'UPDATE_UI':
      return { ...state, ui: { ...state.ui, ...action.payload } };
    case 'SET_AUTH':
      return { ...state, auth: { ...state.auth, ...action.payload } };
    case 'UPDATE_POMODORO':
      return { ...state, pomodoro: { ...state.pomodoro, ...action.payload } };
    case 'TOGGLE_TIMER':
      return { ...state, pomodoro: { ...state.pomodoro, isTimerRunning: !state.pomodoro.isTimerRunning } };
    case 'RESET_TIMER':
      return { 
        ...state, 
        pomodoro: { 
          ...state.pomodoro, 
          isTimerRunning: false,
          timeLeft: state.pomodoro.customDurations[state.pomodoro.currentSession] * 60
        }
      };
    case 'INIT_COMPLETE':
      return { 
        ...state, 
        ui: { 
          ...state.ui, 
          initialLoadComplete: true 
        }
      };
    case 'MEDIA_READY':
      return { 
        ...state, 
        ui: { 
          ...state.ui, 
          backgroundVisible: true, 
          backgroundLoaded: true, 
          showContent: true 
        }
      };
    default:
      return state;
  }
};

export const useAppState = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return {
    state,
    dispatch
  };
};

