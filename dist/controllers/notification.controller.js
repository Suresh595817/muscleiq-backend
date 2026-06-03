"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.readAllNotifications = exports.markAsRead = exports.getNotifications = void 0;
const db_1 = require("../config/db");
const getNotifications = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User context not found' });
            return;
        }
        const { data: notifications, error } = await db_1.supabase
            .from('notifications')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(50);
        const { count, error: countError } = await db_1.supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.user.id)
            .eq('is_read', false);
        if (error) {
            res.status(500).json({ success: false, message: error.message });
            return;
        }
        res.status(200).json({
            success: true,
            unreadCount: count || 0,
            count: notifications?.length || 0,
            data: notifications,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User context not found' });
            return;
        }
        const { data: notification, error: findError } = await db_1.supabase
            .from('notifications')
            .select('user_id')
            .eq('id', req.params.id)
            .single();
        if (findError || !notification) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }
        if (notification.user_id !== req.user.id) {
            res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
            return;
        }
        const { data: updated, error: updateError } = await db_1.supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', req.params.id)
            .select()
            .single();
        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
const readAllNotifications = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User context not found' });
            return;
        }
        const { error } = await db_1.supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', req.user.id)
            .eq('is_read', false);
        if (error) {
            res.status(500).json({ success: false, message: error.message });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.readAllNotifications = readAllNotifications;
const deleteNotification = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User context not found' });
            return;
        }
        const { data: notification, error: findError } = await db_1.supabase
            .from('notifications')
            .select('user_id')
            .eq('id', req.params.id)
            .single();
        if (findError || !notification) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }
        if (notification.user_id !== req.user.id) {
            res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
            return;
        }
        await db_1.supabase.from('notifications').delete().eq('id', req.params.id);
        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNotification = deleteNotification;
