"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.protect = void 0;
const db_1 = require("../config/db");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
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
        const { data: { user: authUser }, error } = await db_1.supabase.auth.getUser(token);
        if (error || !authUser) {
            res.status(401).json({
                success: false,
                message: 'Not authorized, token has expired or is invalid',
            });
            return;
        }
        const { data: profile, error: profileError } = await db_1.supabase
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
        req.user = profile;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authorized, unexpected error',
        });
    }
};
exports.protect = protect;
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({
            success: false,
            message: 'Access denied: Admin privileges required',
        });
    }
};
exports.adminOnly = adminOnly;
