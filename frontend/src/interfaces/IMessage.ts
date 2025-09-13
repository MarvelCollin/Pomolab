export interface IMessage {
  id: number;
  from_user_id: number;
  to_user_id: number;
  message: string;
  task_id?: number;
  group_id?: number;
  created_at: string;
  updated_at: string;
}
