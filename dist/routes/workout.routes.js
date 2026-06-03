"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workout_controller_1 = require("../controllers/workout.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
// Secure all workout endpoints
router.use(auth_middleware_1.protect);
router.post('/', validate_middleware_1.validateWorkout, workout_controller_1.addWorkout);
router.get('/', workout_controller_1.getWorkouts);
router.get('/:id', workout_controller_1.getWorkoutById);
router.put('/:id', validate_middleware_1.validateWorkout, workout_controller_1.editWorkout);
router.delete('/:id', workout_controller_1.deleteWorkout);
exports.default = router;
