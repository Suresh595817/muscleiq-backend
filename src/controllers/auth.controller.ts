import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role || 'user',
        }
      }
    });

    if (authError) {
      res.status(400).json({ success: false, message: authError.message });
      return;
    }

    if (authData.user) {
      // Only insert columns that actually exist in the profiles table
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: authData.user.id,
        name: name || 'User',
      }]);
      if (profileError) {
        console.error('[Register] Profile insert failed:', profileError.message);
      }
    }

    res.status(201).json({
      success: true,
      token: authData.session?.access_token,
      user: {
        id: authData.user?.id,
        name,
        email,
        role: role || 'user',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Get or create profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Auto-create profile if it doesn't exist (e.g. old accounts)
    if (!profile) {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, name: data.user.user_metadata?.name || email.split('@')[0] }])
        .select()
        .single();
      profile = newProfile;
    }

    res.status(200).json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name: profile?.name || email.split('@')[0],
        email: email,
        role: 'user',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to email.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(400).json({ 
      success: false, 
      message: 'With Supabase, password reset must be handled by the frontend passing the session token to updateUser().' 
    });
  } catch (error) {
    next(error);
  }
};
