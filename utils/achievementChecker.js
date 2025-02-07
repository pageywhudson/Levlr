class AchievementChecker {
    constructor(achievementService) {
        this.achievementService = achievementService;
    }

    async checkWorkoutAchievements(workout) {
        const exerciseTotals = {};
        
        // Calculate total reps for each exercise
        workout.exercises.forEach(exercise => {
            const exerciseName = exercise.name.toLowerCase();
            exerciseTotals[exerciseName] = (exerciseTotals[exerciseName] || 0) + 
                exercise.sets.reduce((total, set) => total + set.reps, 0);
        });

        const earnedAchievements = [];

        // Check each achievement
        for (const achievement of Object.values(ACHIEVEMENTS)) {
            const exerciseTotal = exerciseTotals[achievement.exercise] || 0;
            
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