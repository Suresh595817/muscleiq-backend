export interface UserProfile {
  id: string; // UUID from auth.users
  name: string;
  email: string; // from auth.users, stored in profiles for easy access
  role: 'user' | 'admin';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  fitness_goal?: 'muscle_gain' | 'fat_loss' | 'maintenance' | 'strength';
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}
