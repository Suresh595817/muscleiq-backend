import { Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { MuscleAnalysisService } from '../services/muscleAnalysis.service';

export const addWorkout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    const { name, date, duration, exercises, notes } = req.body;

    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert([{
        user_id: req.user.id,
        name,
        date: date || new Date(),
        duration,
        notes
      }])
      .select()
      .single();

    if (workoutError || !workout) {
       res.status(500).json({ success: false, message: workoutError?.message || 'Failed to create workout' });
       return;
    }

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const { data: exerciseData } = await supabase.from('exercises').select('id').eq('name', ex.exerciseName).single();
      let exercise_id = exerciseData?.id;

      if (!exercise_id) {
         const { data: newEx } = await supabase.from('exercises').insert({ name: ex.exerciseName, primary_muscle: ex.primaryMuscle, is_custom: true, created_by: req.user.id }).select().single();
         exercise_id = newEx?.id;
      }

      if (exercise_id) {
          const { data: we, error: weError } = await supabase
            .from('workout_exercises')
            .insert([{
              workout_id: workout.id,
              exercise_id: exercise_id,
              order_index: i
            }])
            .select()
            .single();

          if (!weError && we) {
             const setsToInsert = ex.sets.map((set: any, idx: number) => ({
                workout_exercise_id: we.id,
                set_number: idx + 1,
                reps: set.reps,
                weight: set.weight
             }));
             await supabase.from('workout_sets').insert(setsToInsert);
          }
      }
    }

    MuscleAnalysisService.orchestrateAnalysis(req.user.id).catch((err) =>
      console.error('[Imbalance orchestrator error]', err)
    );

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully',
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkouts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: workouts, count, error } = await supabase
      .from('workouts')
      .select('*, workout_exercises(*, workout_sets(*))', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('date', { ascending: false })
      .range(from, to);

    if (error) {
       res.status(500).json({ success: false, message: error.message });
       return;
    }

    res.status(200).json({
      success: true,
      count: workouts?.length || 0,
      pagination: {
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
        totalWorkouts: count || 0,
      },
      data: workouts,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkoutById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    const { data: workout, error } = await supabase
      .from('workouts')
      .select('*, workout_exercises(*, workout_sets(*))')
      .eq('id', req.params.id)
      .single();

    if (error || !workout) {
      res.status(404).json({ success: false, message: 'Workout log not found' });
      return;
    }

    if (workout.user_id !== req.user.id) {
      res.status(403).json({ success: false, message: 'Forbidden: Access denied to this log' });
      return;
    }

    res.status(200).json({
      success: true,
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

export const editWorkout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(400).json({ success: false, message: 'Editing workout not implemented for relational schema yet. Please delete and recreate.' });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    const { data: workout, error: findError } = await supabase
      .from('workouts')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (findError || !workout) {
      res.status(404).json({ success: false, message: 'Workout log not found' });
      return;
    }

    if (workout.user_id !== req.user.id) {
      res.status(403).json({ success: false, message: 'Forbidden: Access denied to this log' });
      return;
    }

    await supabase.from('workouts').delete().eq('id', req.params.id);

    MuscleAnalysisService.orchestrateAnalysis(req.user.id).catch((err) =>
      console.error('[Imbalance orchestrator error]', err)
    );

    res.status(200).json({
      success: true,
      message: 'Workout log deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
