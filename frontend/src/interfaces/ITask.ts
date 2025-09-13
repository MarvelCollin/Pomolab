export interface ITask {
  id: number;
  title: string;
  description?: string;
  owner_id: number;
  assigned_to_id?: number;
  group_id?: number;
  status: string;
  created_at: string;
  updated_at: string;
}
