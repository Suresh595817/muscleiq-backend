"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomExercise = exports.getExercises = void 0;
const db_1 = require("../config/db");
const getExercises = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User context not found' });
            return;
        }
        const { data: exercises, error } = await db_1.supabase
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
    }
    catch (error) {
        next(error);
    }
};
exports.getExercises = getExercises;
const createCustomExercise = async (req, res, next) => {
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
        const { data: duplicate } = await db_1.supabase
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
        const { data: customExercise, error } = await db_1.supabase
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
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomExercise = createCustomExercise;
