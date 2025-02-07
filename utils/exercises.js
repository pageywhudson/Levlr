const EXERCISES = {
    weightlifting: {
        popular: [
            {
                id: 'bench-press',
                name: 'Bench Press',
                description: 'A compound exercise that targets the chest, shoulders, and triceps.',
                difficulty: 'Intermediate',
                muscles: ['Chest', 'Shoulders', 'Triceps'],
                recommendedReps: { min: 8, max: 12 },
                tips: [
                    'Keep your feet flat on the ground',
                    'Maintain a slight arch in your back',
                    'Lower the bar to your mid-chest',
                    'Keep your elbows at about 45 degrees',
                    'Breathe out as you push'
                ]
            },
            // ... other popular weightlifting exercises
        ],
        other: [
            {
                id: 'bicep-curls',
                name: 'Bicep Curls',
                description: 'An isolation exercise targeting the biceps.',
                difficulty: 'Beginner',
                muscles: ['Biceps'],
                recommendedReps: { min: 8, max: 15 },
                tips: [
                    'Keep your elbows close to your body',
                    'Control the movement',
                    'Don\'t swing your body'
                ],
                achievements: [
                    { id: 'bicep-curls-30', requirement: 30 },
                    { id: 'bicep-curls-50', requirement: 50 },
                    { id: 'bicep-curls-80', requirement: 80 },
                    { id: 'bicep-curls-100', requirement: 100 }
                ]
            }
            // ... other weightlifting exercises
        ]
    },
    bodyweight: {
        popular: [
            {
                id: 'push-ups',
                name: 'Push Ups',
                description: 'A compound bodyweight exercise targeting chest, shoulders, and triceps.',
                difficulty: 'Beginner',
                muscles: ['Chest', 'Shoulders', 'Triceps'],
                recommendedReps: { min: 8, max: 20 },
                tips: [
                    'Keep your body straight',
                    'Lower your chest to the ground',
                    'Keep your core tight'
                ],
                achievements: [
                    { id: 'pushups-30', requirement: 30 },
                    { id: 'pushups-50', requirement: 50 },
                    { id: 'pushups-80', requirement: 80 },
                    { id: 'pushups-100', requirement: 100 }
                ]
            },
            {
                id: 'sit-ups',
                name: 'Sit Ups',
                description: 'A core exercise targeting the abdominal muscles.',
                difficulty: 'Beginner',
                muscles: ['Abs', 'Hip Flexors'],
                recommendedReps: { min: 10, max: 25 },
                tips: [
                    'Keep your feet flat on the ground',
                    'Cross your arms over your chest',
                    'Engage your core throughout'
                ],
                achievements: [
                    { id: 'situps-30', requirement: 30 },
                    { id: 'situps-50', requirement: 50 },
                    { id: 'situps-80', requirement: 80 },
                    { id: 'situps-100', requirement: 100 }
                ]
            }
            // ... other bodyweight exercises
        ],
        other: [
            // ... other bodyweight exercises
        ]
    }
    // ... cardio and other categories
};

// Helper functions
function getAllExercises() {
    const allExercises = [];
    Object.values(EXERCISES).forEach(category => {
        ['popular', 'other'].forEach(type => {
            allExercises.push(...category[type]);
        });
    });
    return allExercises;
}

function getExerciseById(id) {
    return getAllExercises().find(exercise => exercise.id === id);
}

function getExercisesByCategory(category) {
    return EXERCISES[category] || {};
}

function getAchievementsForExercise(exerciseId) {
    const exercise = getExerciseById(exerciseId);
    return exercise?.achievements || [];
}

// If in browser environment
if (typeof window !== 'undefined') {
    window.EXERCISES = EXERCISES;
} else {
    // If in Node.js environment
    module.exports = {
        EXERCISES,
        getAllExercises,
        getExerciseById,
        getExercisesByCategory,
        getAchievementsForExercise
    };
} 