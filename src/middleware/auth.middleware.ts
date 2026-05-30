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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, user profile not found',
      });
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
