export interface ITask {
  id: number;
  title: string;
  description?: string;
  owner_id: number;
  assigned_to_id?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimated_pomodoros: number;
  completed_pomodoros: number;
  created_at: string;
  updated_at: string;
}
