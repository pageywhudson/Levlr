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
        name: 'Squat',
        category: 'Legs',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        recommendedReps: { min: 5, max: 10 },
        weightRanges: {
            beginner: { min: 0.75, max: 1.0 },    // 75-100% of body weight
            intermediate: { min: 1.0, max: 1.5 },  // 100-150% of body weight
            advanced: { min: 1.5, max: 2.5 }       // 150-250% of body weight
        },
        description: 'Compound leg exercise that builds overall strength',
        form: 'Bar on upper back, feet shoulder-width. Bend knees and hips to lower, keep chest up. Stand back up.',
        muscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core']
    },
    {
        name: 'Deadlift',
        category: 'Pull',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        recommendedReps: { min: 3, max: 8 },
        weightRanges: {
            beginner: { min: 1.0, max: 1.5 },     // 100-150% of body weight
            intermediate: { min: 1.5, max: 2.0 },  // 150-200% of body weight
            advanced: { min: 2.0, max: 3.0 }       // 200-300% of body weight
        },
        description: 'Full body pull exercise that builds overall strength',
        form: 'Stand with bar over feet. Bend hips and knees to grip bar. Keep back straight, lift by extending hips and knees.',
        muscles: ['Lower Back', 'Hamstrings', 'Glutes', 'Traps']
    },
    {
        name: 'Pull-up',
        category: 'Pull',
        equipment: 'Bodyweight',
        difficulty: 'Intermediate',
        recommendedReps: { min: 4, max: 12 },
        weightRanges: {
            beginner: { min: 0, max: 0 },         // Bodyweight only
            intermediate: { min: 0, max: 0.25 },   // Up to 25% BW added
            advanced: { min: 0.25, max: 0.5 }      // 25-50% BW added
        },
        description: 'Upper body pulling exercise for back and biceps',
        form: 'Hang from bar with hands wider than shoulders. Pull chest to bar by squeezing back muscles.',
        muscles: ['Lats', 'Biceps', 'Upper Back']
    },
    {
        name: 'Overhead Press',
        category: 'Push',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        recommendedReps: { min: 5, max: 10 },
        weightRanges: {
            beginner: { min: 0.3, max: 0.5 },      // 30-50% of body weight
            intermediate: { min: 0.5, max: 0.8 },   // 50-80% of body weight
            advanced: { min: 0.8, max: 1.2 }        // 80-120% of body weight
        },
        description: 'Vertical pressing movement for shoulder strength',
        form: 'Stand with bar at shoulders, press overhead while keeping core tight. Lock out arms at top.',
        muscles: ['Shoulders', 'Triceps', 'Upper Chest']
    },
    {
        name: 'Dumbbell Bench Press',
        category: 'Push',
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        recommendedReps: { min: 8, max: 12 },
        weightRanges: {
            beginner: { min: 0.1, max: 0.2 },      // 10-20% of body weight (per dumbbell)
            intermediate: { min: 0.2, max: 0.3 },   // 20-30% of body weight (per dumbbell)
            advanced: { min: 0.3, max: 0.45 }       // 30-45% of body weight (per dumbbell)
        },
        description: 'Dumbbell variation of bench press for balanced chest development',
        form: 'Lie on bench, dumbbells at chest level. Press up while maintaining control.',
        muscles: ['Chest', 'Triceps', 'Front Deltoids']
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
    }
];

async function seedExercises() {
    try {
        // Clear existing exercises
        await Exercise.deleteMany({});
        
        // Insert new exercises
        await Exercise.insertMany(exercises);
        
        console.log('Exercise database seeded successfully');
    } catch (error) {
        console.error('Error seeding exercise database:', error);
    }
}

module.exports = { seedExercises }; 