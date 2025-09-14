import type { IUser } from './IUser';

export interface IFriend {
  id: number;
  user_id: number;
  friend_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  user?: IUser;
  friend?: IUser;
}
