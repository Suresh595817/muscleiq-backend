import { Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { MuscleAnalysisService } from '../services/muscleAnalysis.service';

export const getMuscleImbalanceReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    const analysis = await MuscleAnalysisService.orchestrateAnalysis(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        imbalanceScore: analysis.imbalanceScore,
        muscleHeatmap: analysis.muscleHeatmap,
        undertrainedMuscles: analysis.undertrainedMuscles,
        overtrainedMuscles: analysis.overtrainedMuscles,
        weeklyConsistency: analysis.weeklyConsistency,
        suggestions: analysis.suggestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAIInsights = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    const analysis = await MuscleAnalysisService.orchestrateAnalysis(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        scores: analysis.muscleHeatmap,
        alerts: analysis.suggestions.filter(s => 
          s.toLowerCase().includes('imbalance') || 
          s.toLowerCase().includes('warning') || 
          s.toLowerCase().includes('below')
        ),
        recommendations: analysis.suggestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    // Since we removed the old Analytics model and it's not in the supabase schema for arbitrary metrics (except if we use muscle_scores)
    // we'll query muscle_scores as the history
    const { data: history, error } = await supabase
      .from('muscle_scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('calculated_at', { ascending: false })
      .limit(15);

    if (error) {
       res.status(500).json({ success: false, message: error.message });
       return;
    }

    res.status(200).json({
      success: true,
      count: history?.length || 0,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('*, workout_exercises(*, exercises(name), workout_sets(*))')
      .eq('user_id', req.user.id)
      .gte('date', thirtyDaysAgo.toISOString());

    if (error) {
       res.status(500).json({ success: false, message: error.message });
       return;
    }

    let totalWorkouts = workouts?.length || 0;
    let totalDuration = 0;
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;

    const exerciseFrequency: Record<string, number> = {};

    if (workouts) {
      workouts.forEach((w: any) => {
        totalDuration += w.duration || 0;
        if (w.workout_exercises) {
          w.workout_exercises.forEach((we: any) => {
            const exName = we.exercises?.name || 'Unknown';
            exerciseFrequency[exName] = (exerciseFrequency[exName] || 0) + 1;
            
            if (we.workout_sets) {
              totalSets += we.workout_sets.length;
              we.workout_sets.forEach((set: any) => {
                totalReps += set.reps;
                totalVolume += set.reps * set.weight;
              });
            }
          });
        }
      });
    }

    const sortedExercises = Object.entries(exerciseFrequency).sort((a, b) => b[1] - a[1]);
    const favoriteExercise = sortedExercises.length > 0 ? sortedExercises[0][0] : 'N/A';

    res.status(200).json({
      success: true,
      data: {
        summary30Days: {
          totalWorkouts,
          totalDurationMinutes: totalDuration,
          totalSets,
          totalReps,
          totalVolumeKg: Math.round(totalVolume),
          favoriteExercise,
        },
        exerciseFrequency: Object.fromEntries(sortedExercises.slice(0, 5)),
      },
    });
  } catch (error) {
    next(error);
  }
};
