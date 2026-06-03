"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const workout_routes_1 = __importDefault(require("./workout.routes"));
const muscle_routes_1 = __importDefault(require("./muscle.routes"));
const analytics_routes_1 = __importDefault(require("./analytics.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const router = (0, express_1.Router)();
// Register v1 REST API Modules
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/workouts', workout_routes_1.default);
router.use('/muscles', muscle_routes_1.default);
router.use('/analytics', analytics_routes_1.default);
router.use('/notifications', notification_routes_1.default);
router.use('/admin', admin_routes_1.default);
exports.default = router;
