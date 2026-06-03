"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const rateLimiter_middleware_1 = require("./middleware/rateLimiter.middleware");
const app = (0, express_1.default)();
// Programmatically guarantee uploads folder exists for avatar files
const uploadDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
    console.log('[Setup] Created local uploads directory for user profile avatars');
}
// 1. Safety Middlewares
app.use((0, helmet_1.default)()); // Set protective HTTP response headers
app.use((0, cors_1.default)({ origin: true, credentials: true })); // Allow all origins
app.use(express_1.default.json()); // Parse incoming JSON payloads
app.use(express_1.default.urlencoded({ extended: true }));
// 2. Global Safety Rate Limiter
app.use('/api', rateLimiter_middleware_1.apiLimiter);
// 3. Static Media exposure for profile images
app.use('/uploads', express_1.default.static(uploadDir));
// 4. Bind Healthcheck route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'MuscleIQ Core API is healthy and operational',
        timestamp: new Date(),
    });
});
// 5. Connect Versioned API Modules
app.use('/api/v1', routes_1.default);
// 6. Centralized Error Boundary Middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
