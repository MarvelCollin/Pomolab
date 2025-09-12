export interface IAudioEffect {
  id: string;
  name: string;
  url: string;
  filePath: string;
  isActive: boolean;
  volume: number;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAudioEffectPlayerState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
}