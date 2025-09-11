export interface IMusic {
    id: string;
    name: string;
    url: string;
    filePath: string;
    duration?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IMusicPlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
}
