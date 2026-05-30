import dotenv from 'dotenv';
import { supabase } from '../config/db';

dotenv.config();

const coreExercises = [
  // Chest
  { name: 'Bench Press', primary_muscle: 'Chest', secondary_muscles: ['Triceps', 'Shoulders'], is_custom: false },
  { name: 'Incline Dumbbell Press', primary_muscle: 'Chest', secondary_muscles: ['Shoulders', 'Triceps'], is_custom: false },
  { name: 'Dumbbell Chest Flyes', primary_muscle: 'Chest', secondary_muscles: ['Shoulders'], is_custom: false },
  { name: 'Chest Dips', primary_muscle: 'Chest', secondary_muscles: ['Triceps', 'Shoulders'], is_custom: false },
  { name: 'Pushups', primary_muscle: 'Chest', secondary_muscles: ['Triceps', 'Core'], is_custom: false },

  // Back
  { name: 'Pullups', primary_muscle: 'Back', secondary_muscles: ['Biceps', 'Shoulders'], is_custom: false },
  { name: 'Bent Over Barbell Rows', primary_muscle: 'Back', secondary_muscles: ['Biceps'], is_custom: false },
  { name: 'Lat Pulldowns', primary_muscle: 'Back', secondary_muscles: ['Biceps', 'Shoulders'], is_custom: false },
  { name: 'Seated Cable Rows', primary_muscle: 'Back', secondary_muscles: ['Biceps'], is_custom: false },
  { name: 'Deadlifts', primary_muscle: 'Back', secondary_muscles: ['Legs', 'Core'], is_custom: false },

  // Shoulders
  { name: 'Overhead Barbell Press', primary_muscle: 'Shoulders', secondary_muscles: ['Triceps'], is_custom: false },
  { name: 'Dumbbell Lateral Raises', primary_muscle: 'Shoulders', secondary_muscles: [], is_custom: false },
  { name: 'Arnold Press', primary_muscle: 'Shoulders', secondary_muscles: ['Triceps'], is_custom: false },
  { name: 'Face Pulls', primary_muscle: 'Shoulders', secondary_muscles: ['Back'], is_custom: false },

  // Legs
  { name: 'Barbell Squats', primary_muscle: 'Legs', secondary_muscles: ['Core'], is_custom: false },
  { name: 'Leg Press', primary_muscle: 'Legs', secondary_muscles: [], is_custom: false },
  { name: 'Romanian Deadlifts', primary_muscle: 'Legs', secondary_muscles: ['Back'], is_custom: false },
  { name: 'Lying Leg Curls', primary_muscle: 'Legs', secondary_muscles: [], is_custom: false },
  { name: 'Bulgarian Split Squats', primary_muscle: 'Legs', secondary_muscles: ['Core'], is_custom: false },

  // Biceps
  { name: 'Barbell Curls', primary_muscle: 'Biceps', secondary_muscles: [], is_custom: false },
  { name: 'Dumbbell Hammer Curls', primary_muscle: 'Biceps', secondary_muscles: [], is_custom: false },
  { name: 'Preacher Curls', primary_muscle: 'Biceps', secondary_muscles: [], is_custom: false },
  { name: 'Incline Dumbbell Curls', primary_muscle: 'Biceps', secondary_muscles: [], is_custom: false },

  // Triceps
  { name: 'Tricep Rope Pushdowns', primary_muscle: 'Triceps', secondary_muscles: [], is_custom: false },
  { name: 'Tricep Overhead Extensions', primary_muscle: 'Triceps', secondary_muscles: [], is_custom: false },
  { name: 'Skull Crushers', primary_muscle: 'Triceps', secondary_muscles: [], is_custom: false },
  { name: 'Close-Grip Bench Press', primary_muscle: 'Triceps', secondary_muscles: ['Chest', 'Shoulders'], is_custom: false },

  // Core
  { name: 'Planks', primary_muscle: 'Core', secondary_muscles: [], is_custom: false },
  { name: 'Hanging Leg Raises', primary_muscle: 'Core', secondary_muscles: [], is_custom: false },
  { name: 'Russian Twists', primary_muscle: 'Core', secondary_muscles: [], is_custom: false },
  { name: 'Crunches', primary_muscle: 'Core', secondary_muscles: [], is_custom: false },
];

const seedExercises = async () => {
  try {
    console.log('[Seeder] Connected to Supabase');

    const { error: deleteError } = await supabase.from('exercises').delete().eq('is_custom', false);
    
    if (deleteError) {
      console.error('[Seeder] Failed to clear old default exercises', deleteError);
      process.exit(1);
    }
    console.log('[Seeder] Cleared old default exercises');

    const { error: insertError } = await supabase.from('exercises').insert(coreExercises);
    if (insertError) {
      console.error('[Seeder] Failed to insert default exercises', insertError);
      process.exit(1);
    }
    console.log(`[Seeder] Seeded ${coreExercises.length} default exercises successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Fatal seeding error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedExercises();
}

export default seedExercises;
