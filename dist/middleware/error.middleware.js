"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log to console for development
    if (process.env.NODE_ENV !== 'production') {
        console.error('[Error Middleware] Catastrophic boundary hit:', err);
    }
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found: Invalid ID format';
        res.status(404).json({ success: false, message });
        return;
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const fieldName = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
        const message = `Duplicate value entered for field: ${fieldName}. Please use another.`;
        res.status(400).json({ success: false, message });
        return;
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = err.errors
            ? Object.values(err.errors).map((val) => val.message).join(', ')
            : 'Validation constraint violated';
        res.status(400).json({ success: false, message });
        return;
    }
    // Standard or custom response
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
};
exports.errorHandler = errorHandler;
