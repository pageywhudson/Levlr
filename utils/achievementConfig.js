const ACHIEVEMENTS = {};

// Generate achievements from exercise data
getAllExercises().forEach(exercise => {
    if (exercise.achievements) {
        exercise.achievements.forEach(achievement => {
            ACHIEVEMENTS[achievement.id] = {
                id: achievement.id,
                name: `${achievement.requirement} ${exercise.name}`,
                description: `Complete ${achievement.requirement} ${exercise.name} in a single day`,
                icon: `/icons/${achievement.id}.png`,
                exercise: exercise.id,
                requirement: achievement.requirement
            };
        });
    }
});

// module.exports = { ACHIEVEMENTS }; 