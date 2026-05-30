export interface MuscleScore {
  id: string; // UUID
  user_id: string; // UUID
  muscle_group: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Core';
  score: number; // 0 - 100
  calculated_at: Date;
}
