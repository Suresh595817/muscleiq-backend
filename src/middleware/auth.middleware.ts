import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { UserProfile } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: UserProfile;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, token missing in Authorization header',
    });
    return;
  }

  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, token has expired or is invalid',
      });
      return;
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    // Auto-create profile if missing (handles legacy accounts)
    if (!profile) {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert([{
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        }])
        .select()
        .single();
      profile = newProfile;
    }

    if (!profile) {
      res.status(401).json({ success: false, message: 'Could not create user profile' });
      return;
    }

    req.user = profile as UserProfile;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, unexpected error',
    });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required',
    });
  }
};
