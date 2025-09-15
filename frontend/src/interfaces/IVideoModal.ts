import type { IUser } from './IUser';

export interface IVideoModal {
  isOpen: boolean;
  onClose: () => void;
  currentUser: IUser | null;
}

export interface IVideoParticipant {
  id: string;
  name: string;
  isLocal: boolean;
  micOn: boolean;
  webcamOn: boolean;
}