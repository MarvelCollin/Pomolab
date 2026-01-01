export interface IUser {
  id: number;
  username: string;
  email: string;
  google_id?: string;
  avatar?: string;
  email_verified_at?: string;
  role: string;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}
