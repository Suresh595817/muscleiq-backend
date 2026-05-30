export interface Workout {
  id: string; // UUID
  user_id: string; // UUID
  name: string;
  date: Date;
  duration: number; // in minutes
  notes?: string;
  created_at: Date;
}

export interface WorkoutExercise {
  id: string; // UUID
  workout_id: string; // UUID
  exercise_id: string; // UUID
  order_index: number;
}

export interface WorkoutSet {
  id: string; // UUID
  workout_exercise_id: string; // UUID
  set_number: number;
  reps: number;
  weight: number; // in kg
}
