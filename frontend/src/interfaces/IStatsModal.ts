import type { IUser } from './IUser';
import type { IUserStats } from '../apis/stats-api';

export interface IStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: IUser | null;
}

export interface IStatsData extends IUserStats {}
