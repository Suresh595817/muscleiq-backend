export interface Notification {
  id: string; // UUID
  user_id: string; // UUID
  type: 'workout_reminder' | 'goal_completion' | 'system';
  message: string;
  is_read: boolean;
  created_at: Date;
}
