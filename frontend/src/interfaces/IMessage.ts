export interface IMessage {
  id: number | string;
  from_user_id: number;
  to_user_id: number;
  message: string;
  task_id?: number | null;
  group_id?: number;
  created_at: string;
  updated_at: string;
  isTemporary?: boolean;
  tempId?: number | string;
}
