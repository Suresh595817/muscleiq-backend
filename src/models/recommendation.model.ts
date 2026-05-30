export interface Recommendation {
  id: string; // UUID
  user_id: string; // UUID
  type: 'recovery' | 'imbalance_fix' | 'volume_increase' | 'general';
  message: string;
  target_muscle?: string;
  is_read: boolean;
  created_at: Date;
}
