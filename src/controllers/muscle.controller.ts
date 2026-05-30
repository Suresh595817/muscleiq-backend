import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

export const getExercises = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .or(`is_custom.eq.false,created_by.eq.${req.user.id}`)
      .order('name', { ascending: true });

    if (error) {
       res.status(500).json({ success: false, message: error.message });
       return;
    }

    res.status(200).json({
      success: true,
      count: exercises?.length || 0,
      data: exercises,
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomExercise = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    const { name, primaryMuscle, secondaryMuscles } = req.body;

    if (!name || !primaryMuscle) {
      res.status(400).json({
        success: false,
        message: 'Exercise name and primary target muscle group are required',
      });
      return;
    }

    const { data: duplicate } = await supabase
      .from('exercises')
      .select('id')
      .ilike('name', name)
      .maybeSingle();

    if (duplicate) {
      res.status(400).json({
        success: false,
        message: 'An exercise with this name already exists in the system database',
      });
      return;
    }

    const { data: customExercise, error } = await supabase
      .from('exercises')
      .insert([{
        name,
        primary_muscle: primaryMuscle,
        secondary_muscles: secondaryMuscles || [],
        is_custom: true,
        created_by: req.user.id
      }])
      .select()
      .single();

    if (error) {
       res.status(500).json({ success: false, message: error.message });
       return;
    }

    res.status(201).json({
      success: true,
      message: 'Custom exercise registered successfully',
      data: customExercise,
    });
  } catch (error) {
    next(error);
  }
};
