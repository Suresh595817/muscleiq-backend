import { Request, Response, NextFunction } from 'express';

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      message: 'Name, email, and password are required fields',
    });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
    return;
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid email address',
    });
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required fields',
    });
    return;
  }

  next();
};

export const validateWorkout = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, duration, exercises } = req.body;

  if (!name || duration === undefined || !exercises) {
    res.status(400).json({
      success: false,
      message: 'Workout name, duration, and exercises are required fields',
    });
    return;
  }

  if (duration <= 0) {
    res.status(400).json({
      success: false,
      message: 'Workout duration must be greater than 0 minutes',
    });
    return;
  }

  if (!Array.isArray(exercises) || exercises.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Exercises must be a non-empty array',
    });
    return;
  }

  for (const ex of exercises) {
    if (!ex.exerciseName || !ex.primaryMuscle || !ex.sets) {
      res.status(400).json({
        success: false,
        message: 'Each exercise must contain: exerciseName, primaryMuscle, and sets',
      });
      return;
    }

    if (!Array.isArray(ex.sets) || ex.sets.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Sets must be a non-empty array for exercise: ' + ex.exerciseName,
      });
      return;
    }

    for (const set of ex.sets) {
      if (set.reps === undefined || set.weight === undefined) {
        res.status(400).json({
          success: false,
          message: 'Each set must specify reps and weight',
        });
        return;
      }
      if (set.reps <= 0 || set.weight < 0) {
        res.status(400).json({
          success: false,
          message: 'Reps must be greater than 0 and weight cannot be negative',
        });
        return;
      }
    }
  }

  next();
};
