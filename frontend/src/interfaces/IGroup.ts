export interface IGroup {
  id: number;
  name: string;
  description?: string;
  creator_id: number;
  status: 'active' | 'inactive';
  is_private: boolean;
  created_at: string;
  updated_at: string;
}