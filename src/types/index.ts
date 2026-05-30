import { Request } from 'express';
import { UserProfile } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: UserProfile;
}

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Core';

export interface IMuscleSetsDistribution {
  Chest: number;
  Back: number;
  Legs: number;
  Shoulders: number;
  Biceps: number;
  Triceps: number;
  Core: number;
}
