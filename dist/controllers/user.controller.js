"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.updateProfile = void 0;
const db_1 = require("../config/db");
const fs_1 = __importDefault(require("fs"));
const updateProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User context not found' });
            return;
        }
        const { name, age, gender, height, weight, fitnessGoal } = req.body;
        const updateFields = {};
        if (name)
            updateFields.name = name;
        if (age !== undefined)
            updateFields.age = age;
        if (gender)
            updateFields.gender = gender;
        if (height !== undefined)
            updateFields.height = height;
        if (weight !== undefined)
            updateFields.weight = weight;
        if (fitnessGoal)
            updateFields.fitness_goal = fitnessGoal;
        const { data: user, error } = await db_1.supabase
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User context not found' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ success: false, message: 'Please upload an image file' });
            return;
        }
        const fileBuffer = fs_1.default.readFileSync(req.file.path);
        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${req.user.id}.${fileExt}`;
        const filePath = `${req.user.id}/${fileName}`;
        const { error: uploadError } = await db_1.supabase.storage
            .from('avatars')
            .upload(filePath, fileBuffer, {
            upsert: true,
            contentType: req.file.mimetype,
        });
        if (uploadError) {
            res.status(500).json({ success: false, message: uploadError.message });
            return;
        }
        const { data: publicUrlData } = db_1.supabase.storage.from('avatars').getPublicUrl(filePath);
        const { data: user, error: updateError } = await db_1.supabase
            .from('profiles')
            .update({ avatar_url: publicUrlData.publicUrl })
            .eq('id', req.user.id)
            .select()
            .single();
        if (updateError) {
            res.status(500).json({ success: false, message: updateError.message });
            return;
        }
        fs_1.default.unlinkSync(req.file.path);
        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: {
                profilePicture: publicUrlData.publicUrl,
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadAvatar = uploadAvatar;
