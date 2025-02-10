const Exercise = require('../models/Exercise');

const exercises = [
    {
        id: 'bench-press',
        name: 'Bench Press',
        description: 'A compound exercise that targets the chest, shoulders, and triceps.',
        difficulty: 'Intermediate',
        category: 'weightlifting',
        type: 'popular',
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
    {
        id: 'squat',
        name: 'Squat',
        description: 'A fundamental compound exercise that targets the legs and core.',
        difficulty: 'Intermediate',
        category: 'weightlifting',
        type: 'popular',
        muscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
        recommendedReps: { min: 8, max: 12 },
        tips: [
            'Keep your chest up',
            'Push your knees out',
            'Keep your weight on your heels',
            'Break parallel if possible',
            'Breathe out as you stand'
        ]
    },
    {
        id: 'deadlift',
        name: 'Deadlift',
        description: 'A powerful compound exercise that builds overall strength.',
        difficulty: 'Advanced',
        category: 'weightlifting',
        type: 'popular',
        muscles: ['Lower Back', 'Hamstrings', 'Glutes', 'Traps'],
        recommendedReps: { min: 5, max: 8 },
        tips: [
            'Keep your back straight',
            'Push through your heels',
            'Keep the bar close to your body',
            'Engage your lats',
            'Hinge at your hips'
        ]
    },
    {
        id: 'push-ups',
        name: 'Push Ups',
        description: 'A compound bodyweight exercise targeting chest, shoulders, and triceps.',
        difficulty: 'Beginner',
        category: 'bodyweight',
        type: 'popular',
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
        category: 'bodyweight',
        type: 'popular',
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
    },
    {
        id: 'bicep-curls',
        name: 'Bicep Curls',
        description: 'An isolation exercise targeting the biceps.',
        difficulty: 'Beginner',
        category: 'weightlifting',
        type: 'other',
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
    },
    {
        id: 'overhead-press',
        name: 'Overhead Press',
        description: 'A compound exercise targeting shoulders and triceps.',
        difficulty: 'Intermediate',
        category: 'weightlifting',
        type: 'popular',
        muscles: ['Shoulders', 'Triceps', 'Upper Back'],
        recommendedReps: { min: 6, max: 12 },
        tips: [
            'Keep core tight',
            'Don\'t lean back',
            'Press straight up',
            'Full range of motion'
        ]
    },
    {
        id: 'pull-ups',
        name: 'Pull-ups',
        description: 'A compound bodyweight exercise for back and biceps.',
        difficulty: 'Intermediate',
        category: 'bodyweight',
        type: 'popular',
        muscles: ['Back', 'Biceps', 'Shoulders'],
        recommendedReps: { min: 5, max: 12 },
        tips: [
            'Full range of motion',
            'Control the movement',
            'Keep shoulders down',
            'Engage your lats'
        ]
    },
    {
        id: 'running',
        name: 'Running',
        description: 'Cardiovascular exercise for endurance and health.',
        difficulty: 'Intermediate',
        category: 'cardio',
        type: 'popular',
        muscles: ['Legs', 'Heart', 'Core'],
        recommendedReps: { min: 20, max: 60, unit: 'minutes' },
        tips: [
            'Start slow',
            'Maintain good posture',
            'Land midfoot',
            'Breathe rhythmically'
        ]
    },
    {
        name: 'Barbell Row',
        category: 'Pull',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        recommendedReps: { min: 6, max: 12 },
        weightRanges: {
            beginner: { min: 0.4, max: 0.6 },      // 40-60% of body weight
            intermediate: { min: 0.6, max: 0.9 },   // 60-90% of body weight
            advanced: { min: 0.9, max: 1.3 }        // 90-130% of body weight
        },
        description: 'Horizontal pulling movement for back development',
        form: 'Bend at hips, back straight. Pull bar to lower chest while keeping elbows close to body.',
        muscles: ['Upper Back', 'Lats', 'Biceps', 'Rear Deltoids']
    },
    {
        name: 'Lat Pulldown',
        category: 'Pull',
        equipment: 'Cable',
        difficulty: 'Beginner',
        recommendedReps: { min: 8, max: 15 },
        weightRanges: {
            beginner: { min: 0.3, max: 0.5 },      // 30-50% of body weight
            intermediate: { min: 0.5, max: 0.7 },   // 50-70% of body weight
            advanced: { min: 0.7, max: 1.0 }        // 70-100% of body weight
        },
        description: 'Machine-based vertical pull for back development',
        form: 'Sit with chest up, pull bar to upper chest while squeezing shoulder blades together.',
        muscles: ['Lats', 'Biceps', 'Upper Back']
    },
    {
        name: 'Romanian Deadlift',
        category: 'Legs',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        recommendedReps: { min: 8, max: 12 },
        weightRanges: {
            beginner: { min: 0.5, max: 0.8 },      // 50-80% of body weight
            intermediate: { min: 0.8, max: 1.2 },   // 80-120% of body weight
            advanced: { min: 1.2, max: 1.8 }        // 120-180% of body weight
        },
        description: 'Hip-hinge movement for posterior chain development',
        form: 'Stand with bar at hips, hinge at hips while keeping back straight. Lower bar along legs.',
        muscles: ['Hamstrings', 'Glutes', 'Lower Back']
    },
    {
        name: 'Leg Press',
        category: 'Legs',
        equipment: 'Machine',
        difficulty: 'Beginner',
        recommendedReps: { min: 8, max: 15 },
        weightRanges: {
            beginner: { min: 1.0, max: 1.5 },      // 100-150% of body weight
            intermediate: { min: 1.5, max: 2.5 },   // 150-250% of body weight
            advanced: { min: 2.5, max: 4.0 }        // 250-400% of body weight
        },
        description: 'Machine-based leg press for quad development',
        form: 'Sit in machine, feet shoulder-width. Lower weight under control, press back up.',
        muscles: ['Quadriceps', 'Glutes', 'Hamstrings']
    },
    {
        name: 'Plank',
        category: 'Core',
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        recommendedReps: { min: 30, max: 120 },    // seconds
        weightRanges: {
            beginner: { min: 0, max: 0 },          // Bodyweight only
            intermediate: { min: 0, max: 0 },       // Bodyweight only
            advanced: { min: 0, max: 0.1 }         // Up to 10% BW added
        },
        description: 'Isometric core exercise for stability',
        form: 'Forearms and toes on ground, body straight. Maintain position while keeping core tight.',
        muscles: ['Core', 'Lower Back', 'Shoulders']
    },
    {
        name: 'Cable Woodchop',
        category: 'Core',
        equipment: 'Cable',
        difficulty: 'Intermediate',
        recommendedReps: { min: 10, max: 15 },
        weightRanges: {
            beginner: { min: 0.1, max: 0.2 },      // 10-20% of body weight
            intermediate: { min: 0.2, max: 0.3 },   // 20-30% of body weight
            advanced: { min: 0.3, max: 0.4 }        // 30-40% of body weight
        },
        description: 'Rotational core exercise',
        form: 'Stand sideways to cable, rotate through core while keeping hips stable.',
        muscles: ['Obliques', 'Core', 'Shoulders']
    },
    {
        id: 'cycling',
        name: 'Cycling',
        description: 'Low-impact cardiovascular exercise.',
        difficulty: 'Beginner',
        category: 'cardio',
        type: 'popular',
        muscles: ['Legs', 'Heart'],
        recommendedReps: { min: 20, max: 60, unit: 'minutes' },
        tips: [
            'Maintain proper seat height',
            'Keep a steady pace',
            'Stay hydrated'
        ]
    },
    {
        id: 'dips',
        name: 'Dips',
        description: 'Upper body exercise for chest and triceps.',
        difficulty: 'Intermediate',
        category: 'bodyweight',
        type: 'popular',
        muscles: ['Chest', 'Triceps', 'Shoulders'],
        recommendedReps: { min: 8, max: 15 },
        tips: [
            'Keep elbows close to body',
            'Lower slowly and controlled',
            'Full range of motion'
        ]
    },
    {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        description: 'Machine exercise for back development.',
        difficulty: 'Beginner',
        category: 'weightlifting',
        type: 'other',
        muscles: ['Back', 'Biceps'],
        recommendedReps: { min: 10, max: 15 },
        tips: [
            'Pull to upper chest',
            'Keep chest up',
            'Squeeze shoulder blades'
        ]
    }
];

async function seedExercises() {
    try {
        // Clear existing exercises
        await Exercise.deleteMany({});
        
        console.log('Attempting to seed exercises:', exercises.length);
        
        // Filter out exercises that don't match the schema
        const validExercises = exercises.filter(exercise => 
            exercise.id && 
            exercise.name && 
            exercise.description && 
            ['weightlifting', 'bodyweight', 'cardio'].includes(exercise.category)
        );
        
        console.log('Valid exercises to seed:', validExercises.length);
        
        // Insert new exercises
        await Exercise.insertMany(validExercises);
        
        console.log('Exercise database seeded successfully');
        return true;
    } catch (error) {
        console.error('Error seeding exercise database:', error);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`Validation error for ${key}:`, error.errors[key].message);
            });
        }
        return false;
    }
}

module.exports = { seedExercises, exercises }; 