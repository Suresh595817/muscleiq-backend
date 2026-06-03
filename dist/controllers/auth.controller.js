"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.getMe = exports.login = exports.register = void 0;
const db_1 = require("../config/db");
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const { data: authData, error: authError } = await db_1.supabase.auth.signUp({
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
            await db_1.supabase.from('profiles').insert([
                {
                    id: authData.user.id,
                    name,
                    email,
                    role: role || 'user',
                }
            ]);
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
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { data, error } = await db_1.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error || !data.user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const { data: profile } = await db_1.supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        res.status(200).json({
            success: true,
            token: data.session.access_token,
            user: {
                id: data.user.id,
                name: profile?.name || '',
                email: profile?.email || email,
                role: profile?.role || 'user',
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: req.user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const { error } = await db_1.supabase.auth.resetPasswordForEmail(email);
        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Password reset instructions sent to email.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        res.status(400).json({
            success: false,
            message: 'With Supabase, password reset must be handled by the frontend passing the session token to updateUser().'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
