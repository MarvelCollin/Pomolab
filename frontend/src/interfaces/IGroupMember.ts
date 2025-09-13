export interface IGroupMember {
  id: number;
  user_id: number;
  group_id: number;
  role: 'creator' | 'leader' | 'member';
  joined_at?: string;
  created_at: string;
  updated_at: string;
}