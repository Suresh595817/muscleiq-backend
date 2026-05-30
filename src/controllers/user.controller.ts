import { Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import fs from 'fs';

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    const { name, age, gender, height, weight, fitnessGoal } = req.body;

    const updateFields: Record<string, any> = {};
    if (name) updateFields.name = name;
    if (age !== undefined) updateFields.age = age;
    if (gender) updateFields.gender = gender;
    if (height !== undefined) updateFields.height = height;
    if (weight !== undefined) updateFields.weight = weight;
    if (fitnessGoal) updateFields.fitness_goal = fitnessGoal;

    const { data: user, error } = await supabase
      .from('profiles')
      .update(updateFields)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User context not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please upload an image file' });
      return;
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${req.user.id}.${fileExt}`;
    const filePath = `${req.user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        upsert: true,
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      res.status(500).json({ success: false, message: uploadError.message });
      return;
    }
    
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

    const { data: user, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) {
       res.status(500).json({ success: false, message: updateError.message });
       return;
    }

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: publicUrlData.publicUrl,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
