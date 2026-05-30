export interface AdminLog {
  id: string; // UUID
  admin_id: string; // UUID
  action: string;
  target_user_id?: string; // UUID
  details?: string;
  created_at: Date;
}
