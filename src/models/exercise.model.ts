export interface Exercise {
  id: string; // UUID
  name: string;
  primary_muscle: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Core';
  secondary_muscles: string[];
  is_custom: boolean;
  created_by?: string; // UUID of user
  created_at: Date;
}
