"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuscleAnalysisService = void 0;
const db_1 = require("../config/db");
class MuscleAnalysisService {
    static async calculateMuscleEngagement(userId) {
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const { data: workouts } = await db_1.supabase
            .from('workouts')
            .select('*, workout_exercises(exercises(primary_muscle), workout_sets(id))')
            .eq('user_id', userId)
            .gte('date', fourteenDaysAgo.toISOString());
        const muscleSets = {
            Chest: 0,
            Back: 0,
            Legs: 0,
            Shoulders: 0,
            Biceps: 0,
            Triceps: 0,
            Core: 0,
        };
        if (workouts) {
            workouts.forEach((workout) => {
                if (workout.workout_exercises) {
                    workout.workout_exercises.forEach((we) => {
                        const muscle = we.exercises?.primary_muscle;
                        const setsCount = we.workout_sets?.length || 0;
                        if (muscle && muscleSets[muscle] !== undefined) {
                            muscleSets[muscle] += setsCount;
                        }
                    });
                }
            });
        }
        return muscleSets;
    }
    static async calculateMuscleScore(userId, muscleEngagement) {
        let scoreDeductions = 0;
        const undertrained = [];
        const overtrained = [];
        const totalSets = Object.values(muscleEngagement).reduce((sum, current) => sum + current, 0);
        if (totalSets === 0) {
            return { imbalanceScore: 100, overtrained: [], undertrained: [] };
        }
        const activeMusclesCount = Object.values(muscleEngagement).filter((sets) => sets >= 4).length;
        if (activeMusclesCount > 0) {
            Object.entries(muscleEngagement).forEach(([muscle, sets]) => {
                if (sets < 2) {
                    undertrained.push(muscle);
                    scoreDeductions += 15;
                }
            });
        }
        const chestSets = muscleEngagement['Chest'] || 0;
        const backSets = muscleEngagement['Back'] || 0;
        if (chestSets > 0 || backSets > 0) {
            if (chestSets >= 4 && backSets === 0) {
                scoreDeductions += 20;
                undertrained.push('Back');
                overtrained.push('Chest');
            }
            else if (backSets >= 4 && chestSets === 0) {
                scoreDeductions += 20;
                undertrained.push('Chest');
                overtrained.push('Back');
            }
            else if (chestSets > 0 && backSets > 0) {
                const ratio = chestSets / backSets;
                if (ratio > 1.3) {
                    undertrained.push('Back');
                    overtrained.push('Chest');
                    scoreDeductions += 15;
                }
                else if (ratio < 0.77) {
                    undertrained.push('Chest');
                    overtrained.push('Back');
                    scoreDeductions += 15;
                }
            }
        }
        const bicepSets = muscleEngagement['Biceps'] || 0;
        const tricepSets = muscleEngagement['Triceps'] || 0;
        if (bicepSets > 0 || tricepSets > 0) {
            if (bicepSets >= 4 && tricepSets === 0) {
                scoreDeductions += 15;
                undertrained.push('Triceps');
                overtrained.push('Biceps');
            }
            else if (tricepSets >= 4 && bicepSets === 0) {
                scoreDeductions += 15;
                undertrained.push('Biceps');
                overtrained.push('Triceps');
            }
            else if (bicepSets > 0 && tricepSets > 0) {
                const armRatio = bicepSets / tricepSets;
                if (armRatio > 1.3) {
                    undertrained.push('Triceps');
                    overtrained.push('Biceps');
                    scoreDeductions += 10;
                }
                else if (armRatio < 0.77) {
                    undertrained.push('Biceps');
                    overtrained.push('Triceps');
                    scoreDeductions += 10;
                }
            }
        }
        const legsSets = muscleEngagement['Legs'] || 0;
        if (legsSets < 8) {
            undertrained.push('Legs');
            scoreDeductions += 10;
        }
        Object.entries(muscleEngagement).forEach(([muscle, sets]) => {
            const percentage = totalSets > 0 ? (sets / totalSets) * 100 : 0;
            if (percentage > 40 && totalSets >= 15) {
                overtrained.push(muscle);
                scoreDeductions += 15;
            }
        });
        const imbalanceScore = Math.max(10, 100 - scoreDeductions);
        const calculatedAt = new Date().toISOString();
        for (const [muscle, sets] of Object.entries(muscleEngagement)) {
            const muscleScoreVal = Math.min(100, Math.round((sets / 10) * 100));
            await db_1.supabase.from('muscle_scores').insert({
                user_id: userId,
                muscle_group: muscle,
                score: muscleScoreVal,
                calculated_at: calculatedAt,
            });
        }
        return {
            imbalanceScore,
            overtrained: Array.from(new Set(overtrained)),
            undertrained: Array.from(new Set(undertrained)),
        };
    }
    static detectMuscleImbalance(muscleEngagement, imbalanceScore, undertrained, overtrained) {
        const alerts = [];
        const chestSets = muscleEngagement['Chest'] || 0;
        const backSets = muscleEngagement['Back'] || 0;
        if (chestSets > 0 && backSets > 0 && chestSets / backSets > 1.30) {
            alerts.push('Muscle imbalance detected. Increase back workouts.');
        }
        const legsSets = muscleEngagement['Legs'] || 0;
        if (legsSets < 8) {
            alerts.push('Leg training volume is below recommended levels.');
        }
        overtrained.forEach((muscle) => {
            const totalSets = Object.values(muscleEngagement).reduce((sum, val) => sum + val, 0);
            const sets = muscleEngagement[muscle] || 0;
            const percentage = totalSets > 0 ? Math.round((sets / totalSets) * 100) : 0;
            if (percentage > 40) {
                alerts.push(`Overtraining Warning: ${muscle} constitutes ${percentage}% of your routine. Reduce volume.`);
            }
        });
        return alerts;
    }
    static async generateRecommendations(userId, undertrained, alerts) {
        const recommendations = [];
        const EXERCISE_SUGGESTIONS = {
            Chest: ['Bench Press', 'Incline Dumbbell Press', 'Dumbbell Chest Flyes'],
            Back: ['Bent Over Barbell Rows', 'Pullups', 'Lat Pulldowns'],
            Legs: ['Barbell Squats', 'Leg Press', 'Romanian Deadlifts'],
            Shoulders: ['Overhead Barbell Press', 'Dumbbell Lateral Raises', 'Face Pulls'],
            Biceps: ['Barbell Curls', 'Dumbbell Hammer Curls'],
            Triceps: ['Tricep Rope Pushdowns', 'Tricep Overhead Extensions'],
            Core: ['Planks', 'Hanging Leg Raises'],
        };
        for (const alert of alerts) {
            recommendations.push(alert);
            await db_1.supabase.from('recommendations').insert({
                user_id: userId,
                type: 'imbalance_fix',
                message: alert,
            });
        }
        for (const muscle of undertrained) {
            const suggestions = EXERCISE_SUGGESTIONS[muscle];
            if (suggestions) {
                const text = `To balance your ${muscle}: Try adding 3-4 sets of ${suggestions[0]} or ${suggestions[1]} to your next session.`;
                recommendations.push(text);
                await db_1.supabase.from('recommendations').insert({
                    user_id: userId,
                    type: 'general',
                    target_muscle: muscle,
                    message: text,
                });
            }
        }
        if (recommendations.length === 0) {
            const text = 'Superb symmetry! Your current workout volume ratios show healthy muscle balance. Keep it up!';
            recommendations.push(text);
            await db_1.supabase.from('recommendations').insert({
                user_id: userId,
                type: 'general',
                message: text,
            });
        }
        return recommendations;
    }
    static async orchestrateAnalysis(userId) {
        const engagement = await this.calculateMuscleEngagement(userId);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: recentWorkoutsCount } = await db_1.supabase
            .from('workouts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('date', thirtyDaysAgo.toISOString());
        const weeklyConsistency = parseFloat(((recentWorkoutsCount || 0) / 4.2).toFixed(1));
        const scoreResult = await this.calculateMuscleScore(userId, engagement);
        const alerts = this.detectMuscleImbalance(engagement, scoreResult.imbalanceScore, scoreResult.undertrained, scoreResult.overtrained);
        const recommendations = await this.generateRecommendations(userId, scoreResult.undertrained, alerts);
        if (scoreResult.imbalanceScore < 80 && scoreResult.undertrained.length > 0) {
            await db_1.supabase.from('notifications').insert({
                user_id: userId,
                type: 'system', // 'imbalance_alert' is not in our enum from schema (workout_reminder, goal_completion, system)
                message: `MuscleIQ detected that your ${scoreResult.undertrained.join(', ')} are undertrained (Score: ${scoreResult.imbalanceScore}/100). Check recommendations for exercise ideas.`,
                is_read: false,
            });
        }
        return {
            imbalanceScore: scoreResult.imbalanceScore,
            muscleHeatmap: engagement,
            undertrainedMuscles: scoreResult.undertrained,
            overtrainedMuscles: scoreResult.overtrained,
            weeklyConsistency,
            suggestions: recommendations,
        };
    }
}
exports.MuscleAnalysisService = MuscleAnalysisService;
