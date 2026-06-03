"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Fully protected for authenticated admins only
router.use(auth_middleware_1.protect, auth_middleware_1.adminOnly);
router.get('/users', admin_controller_1.getAllUsers);
router.delete('/users/:id', admin_controller_1.deleteUser);
router.get('/workouts', admin_controller_1.monitorWorkouts);
router.get('/stats', admin_controller_1.getSystemStats);
exports.default = router;
