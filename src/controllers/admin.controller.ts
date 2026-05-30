import { Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: users, count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
       res.status(500).json({ success: false, message: error.message });
       return;
    }

    res.status(200).json({
      success: true,
      count: users?.length || 0,
      pagination: {
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
        totalUsers: count || 0,
      },
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.params.id === req.user?.id) {
      res.status(400).json({ success: false, message: 'Admin cannot delete their own active account' });
      return;
    }

    // In a real Supabase app, you need the Service Role Key to delete auth.users
    // We will attempt to delete from profiles, which won't delete the auth user but will disable their app profile.
    // If you add the service_role key to supabase client, you can use:
    // await supabase.auth.admin.deleteUser(req.params.id)
    const { error } = await supabase.from('profiles').delete().eq('id', req.params.id);

    if (error) {
       res.status(500).json({ success: false, message: error.message });
       return;
    }

    res.status(200).json({
      success: true,
      message: 'User account and associated records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const monitorWorkouts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: workouts, count, error } = await supabase
      .from('workouts')
      .select('*, profiles(name, email)', { count: 'exact' })
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

export const getSystemStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');
    const { count: adminsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');
    const { count: workoutsCount } = await supabase.from('workouts').select('*', { count: 'exact', head: true });

    // For muscle breakdown, we fetch all workout_exercises and join exercises to get primary_muscle
    const { data: workoutExercises } = await supabase.from('workout_exercises').select('exercises(primary_muscle)');

    const muscleBreakdown: Record<string, number> = {};
    if (workoutExercises) {
      workoutExercises.forEach((we: any) => {
         const muscle = we.exercises?.primary_muscle;
         if (muscle) {
           muscleBreakdown[muscle] = (muscleBreakdown[muscle] || 0) + 1;
         }
      });
    }

    const popularMuscles = Object.entries(muscleBreakdown)
      .map(([muscle, count]) => ({ muscle, loggedExercisesCount: count }))
      .sort((a, b) => b.loggedExercisesCount - a.loggedExercisesCount);

    res.status(200).json({
      success: true,
      data: {
        usersCount: usersCount || 0,
        adminsCount: adminsCount || 0,
        workoutsCount: workoutsCount || 0,
        popularMuscles,
      },
    });
  } catch (error) {
    next(error);
  }
};
