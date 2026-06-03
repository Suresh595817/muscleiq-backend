"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemStats = exports.monitorWorkouts = exports.deleteUser = exports.getAllUsers = void 0;
const db_1 = require("../config/db");
const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const { data: users, count, error } = await db_1.supabase
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user?.id) {
            res.status(400).json({ success: false, message: 'Admin cannot delete their own active account' });
            return;
        }
        // In a real Supabase app, you need the Service Role Key to delete auth.users
        // We will attempt to delete from profiles, which won't delete the auth user but will disable their app profile.
        // If you add the service_role key to supabase client, you can use:
        // await supabase.auth.admin.deleteUser(req.params.id)
        const { error } = await db_1.supabase.from('profiles').delete().eq('id', req.params.id);
        if (error) {
            res.status(500).json({ success: false, message: error.message });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'User account and associated records deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
const monitorWorkouts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const { data: workouts, count, error } = await db_1.supabase
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
    }
    catch (error) {
        next(error);
    }
};
exports.monitorWorkouts = monitorWorkouts;
const getSystemStats = async (req, res, next) => {
    try {
        const { count: usersCount } = await db_1.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');
        const { count: adminsCount } = await db_1.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');
        const { count: workoutsCount } = await db_1.supabase.from('workouts').select('*', { count: 'exact', head: true });
        // For muscle breakdown, we fetch all workout_exercises and join exercises to get primary_muscle
        const { data: workoutExercises } = await db_1.supabase.from('workout_exercises').select('exercises(primary_muscle)');
        const muscleBreakdown = {};
        if (workoutExercises) {
            workoutExercises.forEach((we) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getSystemStats = getSystemStats;
