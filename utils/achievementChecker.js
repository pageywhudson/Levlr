class AchievementChecker {
    constructor(achievementService) {
        this.achievementService = achievementService;
    }

    async checkWorkoutAchievements(workout) {
        // Get today's workouts from localStorage
        const workouts = JSON.parse(localStorage.getItem('workoutHistory')) || [];
        const today = new Date().toDateString();
        
        // Calculate daily totals including the current workout
        const dailyTotals = {};
        
        // Add totals from previous workouts today
        workouts.forEach(w => {
            if (new Date(w.timestamp).toDateString() === today) {
                w.exercises.forEach(exercise => {
                    const exerciseId = exercise.exerciseId;
                    dailyTotals[exerciseId] = (dailyTotals[exerciseId] || 0) + 
                        exercise.sets.reduce((total, set) => total + set.reps, 0);
                });
            }
        });
         
        // Add totals from current workout
        workout.exercises.forEach(exercise => {
            const exerciseId = exercise.exerciseId;
            dailyTotals[exerciseId] = (dailyTotals[exerciseId] || 0) + 
                exercise.sets.reduce((total, set) => total + set.reps, 0);
        });

        const earnedAchievements = [];

        // Check each achievement
        for (const achievement of Object.values(ACHIEVEMENTS)) {
            const exerciseTotal = dailyTotals[achievement.exerciseId] || 0;
            
            if (exerciseTotal >= achievement.requirement) {
                try {
                    const result = await this.achievementService.awardAchievement(achievement.id);
                    if (result && !result.message) { // If not already earned
                        earnedAchievements.push(achievement);
                    }
                } catch (error) {
                    console.error('Error awarding achievement:', error);
                }
            }
        }

        return earnedAchievements;
    }
}

module.exports = AchievementChecker; 