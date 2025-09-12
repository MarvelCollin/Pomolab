import type { IBackground } from './IBackground';
import type { IMusic } from './IMusic';

export interface IToolBarProps {
    showBackgroundSelector: boolean;
    setShowBackgroundSelector: (show: boolean) => void;
    showMusicPlayer: boolean;
    setShowMusicPlayer: (show: boolean) => void;
    isMinimalMode: boolean;
    setIsMinimalMode: (minimal: boolean) => void;
    showPomodoro: boolean;
    setShowPomodoro: (show: boolean) => void;
    showTasks: boolean;
    setShowTasks: (show: boolean) => void;
    backgrounds: IBackground[];
    activeBackground: IBackground | null;
    uploadingBackground: boolean;
    onBackgroundChange: (background: IBackground) => void;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteBackground: (background: IBackground, event: React.MouseEvent) => void;
    musics: IMusic[];
    currentMusic: IMusic | null;
    playerState: {
        isPlaying: boolean;
        currentTime: number;
        duration: number;
        volume: number;
        isMuted: boolean;
    };
    onPlayMusic: (music: IMusic) => void;
    onDeleteMusic: (music: IMusic, event: React.MouseEvent) => void;
    onTogglePlayPause: () => void;
    onNextMusic: () => void;
    onPreviousMusic: () => void;
    onToggleMute: () => void;
}
