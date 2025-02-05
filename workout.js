// Move this function to the very top of the file
function initializeUserData() {
    try {
        // Get user data from localStorage
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) {
            console.error('No user data found in localStorage');
            window.location.href = 'login.html';
            return null;
        }

        // Parse user data
        const userData = JSON.parse(userDataString);
        
        // Get and parse user stats, or use defaults
        const userStatsString = localStorage.getItem('userStats');
        const userStats = userStatsString ? JSON.parse(userStatsString) : {
            totalXP: 0,
            todayXP: 0,
            setsCompleted: 0,
            streak: 0,
            lastWorkout: null
        };

        // Return combined data
        return {
            ...userData,
            stats: userStats
        };
    } catch (error) {
        console.error('Error initializing user data:', error);
        window.location.href = 'login.html';
        return null;
    }
}

// Add these goal management functions at the top of workout.js
function shouldResetGoal(goal) {
    const now = new Date();
    const createdDate = new Date(goal.createdAt);
    
    switch (goal.type) {
        case 'daily':
            // Check if it's a new day (past midnight)
            return now.getDate() !== createdDate.getDate() || 
                   now.getMonth() !== createdDate.getMonth() ||
                   now.getFullYear() !== createdDate.getFullYear();
        
        case 'weekly':
            // Check if it's been 7 days
            const weekInMs = 7 * 24 * 60 * 60 * 1000;
            return now - createdDate >= weekInMs;
            
        case 'monthly':
            // Check if it's a new month
            return now.getMonth() !== createdDate.getMonth() ||
                   now.getFullYear() !== createdDate.getFullYear();
            
        default:
            return false;
    }
}

function resetGoal(goal) {
    return {
        ...goal,
        progress: 0,
        createdAt: new Date().toISOString()
    };
}

function manageGoals() {
    const goals = JSON.parse(localStorage.getItem('workoutGoals')) || [];
    const updatedGoals = goals.map(goal => {
        if (shouldResetGoal(goal)) {
            return resetGoal(goal);
        }
        return goal;
    });
    
    localStorage.setItem('workoutGoals', JSON.stringify(updatedGoals));
    return updatedGoals;
}

// Add this function BEFORE the DOMContentLoaded event
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    // Create instance of AuthService
    const authService = new AuthService();
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize user data first
    const userData = initializeUserData();
    if (!userData) {
        return; // initializeUserData will handle the redirect if needed
    }

    // Get the exercise form
    const exerciseForm = document.querySelector('.exercise-form');
    if (!exerciseForm) {
        console.error('Exercise form not found!');
        return;
    }

    // Add constants after user data is initialized
    const KG_TO_LBS = 2.20462;
    const LBS_TO_KG = 0.453592;
    let currentUnit = (JSON.parse(localStorage.getItem('userPreferences')) || {}).weightUnit || 'lbs';

    // Load user preferences
    const preferences = JSON.parse(localStorage.getItem('userPreferences')) || {
        weightUnit: 'kg',
        distanceUnit: 'km',
        userWeight: 0
    };

    // Exercise information database
    const exerciseInfo = {
        'bench-press': {
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
        'squat': {
            name: 'Squat',
            description: 'A fundamental compound exercise that targets the legs and core.',
            difficulty: 'Intermediate',
            muscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
            recommendedReps: { min: 8, max: 12 },
            tips: [
                'Keep your chest up',
                'Push your knees out',
                'Keep your weight on your heels',
                'Break parallel if possible',
                'Breathe out as you stand'
            ]
        }
        // ... other exercises will be auto-generated as needed
    };

    // Get DOM elements (add exerciseForm)
    const typeButtons = document.querySelectorAll('.type-button');
    const exerciseSelect = document.getElementById('exercise');
    const formContainer = document.querySelector('.exercise-form-container');
    const searchInput = document.getElementById('exercise-search');
    
    // Exercise lists by type
    const exercises = {
        weightlifting: {
            popular: [
                'Bench Press',
                'Squat',
                'Deadlift',
                'Overhead Press',
                'Barbell Row'
            ],
            other: [
                'Dumbbell Bench Press',
                'Romanian Deadlift',
                'Leg Press',
                'Incline Bench Press',
                'Dumbbell Shoulder Press',
                'Bent Over Row',
                'T-Bar Row',
                'Front Squat',
                'Hack Squat',
                'Lunges',
                'Dumbbell Lunges',
                'Leg Extensions',
                'Leg Curls',
                'Calf Raises',
                'Tricep Extensions',
                'Bicep Curls',
                'Hammer Curls',
                'Lateral Raises',
                'Face Pulls',
                'Shrugs'
            ]
        },
        bodyweight: {
            popular: [
                'Push-ups',
                'Pull-ups',
                'Chin-ups',
                'Dips',
                'Squats'
            ],
            other: [
                'Inverted Rows',
                'Pike Push-ups',
                'Diamond Push-ups',
                'Wide Push-ups',
                'Decline Push-ups',
                'Australian Pull-ups',
                'Negative Pull-ups',
                'Assisted Pull-ups',
                'Pistol Squats',
                'Jump Squats',
                'Lunges',
                'Mountain Climbers',
                'Burpees',
                'Plank',
                'Side Plank',
                'L-Sits',
                'Hanging Leg Raises',
                'Russian Twists',
                'Bicycle Crunches',
                'Superman Holds'
            ]
        },
        cardio: {
            popular: [
                'Running',
                'Cycling',
                'Swimming',
                'Rowing',
                'Jump Rope'
            ],
            other: [
                'Walking',
                'Hiking',
                'Stair Climber',
                'Elliptical',
                'Battle Ropes',
                'Boxing',
                'Kickboxing',
                'High Knees',
                'Jumping Jacks',
                'Sprints',
                'Hill Sprints',
                'Sled Push',
                'Sled Pull',
                'Assault Bike',
                'Cross-Country Skiing',
                'Basketball',
                'Soccer',
                'Tennis',
                'HIIT',
                'Circuit Training'
            ]
        }
    };

    // Update weight labels function
    function updateWeightLabels() {
        // Update weightlifting form labels
        const weightLabels = document.querySelectorAll('label[for^="weight-"]');
        weightLabels.forEach(label => {
            label.textContent = `Weight (${preferences.weightUnit})`;
        });

        // Update bodyweight form label if it exists
        const addedWeightLabel = document.querySelector('label[for="added-weight"]');
        if (addedWeightLabel) {
            addedWeightLabel.textContent = `Added Weight (${preferences.weightUnit}, optional)`;
        }
    }

    // Call this when page loads
    updateWeightLabels();

    // Function to update exercise options based on type
    function updateExerciseOptions(type) {
        // Store currently selected exercise if any
        const currentlySelected = exerciseSelect.value;
        
        exerciseSelect.innerHTML = '<option value="">Select an exercise</option>';
        
        if (exercises[type]) {
            if (exercises[type].popular.length > 0) {
                const popularGroup = document.createElement('optgroup');
                popularGroup.label = 'Popular';
                exercises[type].popular.forEach(exercise => {
                    const option = document.createElement('option');
                    option.value = exerciseNameToKey(exercise);
                    option.textContent = exercise;
                    if (option.value === currentlySelected) {
                        option.selected = true;
                    }
                    popularGroup.appendChild(option);
                });
                exerciseSelect.appendChild(popularGroup);
            }

            if (exercises[type].other.length > 0) {
                const otherGroup = document.createElement('optgroup');
                otherGroup.label = 'Other';
                exercises[type].other.forEach(exercise => {
                    const option = document.createElement('option');
                    option.value = exerciseNameToKey(exercise);
                    option.textContent = exercise;
                    if (option.value === currentlySelected) {
                        option.selected = true;
                    }
                    otherGroup.appendChild(option);
                });
                exerciseSelect.appendChild(otherGroup);
            }
        }
    }

    // Clear any existing event listeners from type buttons
    typeButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });

    // Get fresh references after replacing buttons
    const newTypeButtons = document.querySelectorAll('.type-button');

    // Add click handlers to type buttons
    newTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            newTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const selectedType = this.dataset.type;
            
            // Update exercise options
            updateExerciseOptions(selectedType);
            
            // Update form fields
            updateFormForExerciseType(selectedType);
            
            // Clear search and exercise selection
            searchInput.value = '';
            exerciseSelect.value = '';
            
            // Clear any existing set inputs except the first one
            const setInputs = document.querySelector('.set-inputs');
            const setContainers = setInputs.querySelectorAll('.set-container');
            for (let i = 1; i < setContainers.length; i++) {
                setContainers[i].remove();
            }
            
            // Update the first set to match the new type
            if (setContainers[0]) {
                updateSetContainer(setContainers[0], selectedType);
            }
        });
    });

    // Initialize with default type
    const defaultType = document.querySelector('.type-button.active').dataset.type;
    updateExerciseOptions(defaultType);

    // Remove the conflicting exercise select change handler
    exerciseSelect.removeEventListener('change', exerciseSelect.changeHandler);
    
    // Add new change handler
    exerciseSelect.addEventListener('change', function() {
        const selectedExercise = this.value;
        if (selectedExercise) {
            const exercise = exerciseInfo[selectedExercise];
            if (exercise) {
                // Update any exercise info displays if needed
            }
        }
    });

    // Set initial active button based on stored preference
    const unitButtons = document.querySelectorAll('.unit-button');
    unitButtons.forEach(button => {
        if (button.dataset.unit === currentUnit) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
        
        // Update initial labels to match stored preference
        updateWeightLabels();
    });

    // Add unit toggle handler
    unitButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newUnit = button.dataset.unit;
            if (newUnit !== currentUnit) {
                // Update active button
                unitButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Convert existing weight inputs
                convertWeightInputs(currentUnit, newUnit);
                
                // Update labels
                updateWeightLabels();

                // Save preference to localStorage
                localStorage.setItem('userPreferences', JSON.stringify({
                    ...preferences,
                    weightUnit: newUnit
                }));
                currentUnit = newUnit;
            }
        });
    });

    // Helper function to convert weight inputs
    function convertWeightInputs(fromUnit, toUnit) {
        // Convert weightlifting form inputs
        const weightInputs = document.querySelectorAll('input[id^="weight-"]');
        weightInputs.forEach(input => {
            if (input.value) {
                const currentValue = parseFloat(input.value);
                if (toUnit === 'lbs') {
                    input.value = Math.round(currentValue * KG_TO_LBS * 2) / 2;
                    input.step = '2.5';
                } else {
                    input.value = Math.round(currentValue * LBS_TO_KG * 2) / 2;
                    input.step = '1';
                }
            }
        });

        // Convert bodyweight form input
        const addedWeightInput = document.getElementById('added-weight');
        if (addedWeightInput && addedWeightInput.value) {
            const currentValue = parseFloat(addedWeightInput.value);
            if (toUnit === 'lbs') {
                addedWeightInput.value = Math.round(currentValue * KG_TO_LBS * 2) / 2;
                addedWeightInput.step = '2.5';
            } else {
                addedWeightInput.value = Math.round(currentValue * LBS_TO_KG * 2) / 2;
                addedWeightInput.step = '1';
            }
        }
    }

    // Update the exerciseNameToKey function to be more robust
    function exerciseNameToKey(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .trim(); // Remove leading/trailing spaces
    }

    // Add this debug function
    function validateExerciseKeys() {
        Object.keys(exercises).forEach(type => {
            ['popular', 'other'].forEach(category => {
                exercises[type][category].forEach(exerciseName => {
                    const key = exerciseNameToKey(exerciseName);
                    if (!exerciseInfo[key]) {
                        console.warn(`Missing exercise info for: ${exerciseName} (key: ${key})`);
                    }
                });
            });
        });
    }

    // Update the updateFormFields function to handle bodyweight template
    function updateFormFields(type) {
        const formGroups = formContainer.querySelectorAll('.form-group');
        const setInputs = formContainer.querySelector('.set-inputs');
        const addSetButton = formContainer.querySelector('.add-set-button');
        const exerciseInfo = formContainer.querySelector('#exercise-info').parentElement;

        // Remove existing form fields after the exercise select, except exercise info
        formGroups.forEach(group => {
            if (group.querySelector('#exercise') === null && 
                group.querySelector('#exercise-info') === null) {
                group.remove();
            }
        });

        if (setInputs) setInputs.remove();
        if (addSetButton) addSetButton.remove();

        // Add new form fields based on type
        if (type === 'bodyweight') {
            const template = document.getElementById('bodyweight-form');
            const newFields = template.content.cloneNode(true);
            
            // Update the added weight label and input with current unit preferences
            const weightLabel = newFields.querySelector('label[for="added-weight"]');
            const weightInput = newFields.querySelector('#added-weight');
            
            weightLabel.textContent = `Added Weight (${currentUnit}, optional)`;
            weightInput.step = currentUnit === 'kg' ? '1' : '2.5';

            // Insert new fields
            if (exerciseInfo) {
                formContainer.insertBefore(newFields, exerciseInfo);
            } else {
                formContainer.insertBefore(newFields, formContainer.querySelector('.submit-button'));
            }
        } else {
            const template = document.getElementById(`${type}-form`);
            if (template) {
                const newFields = template.content.cloneNode(true);
                // Insert new fields before the exercise info if it exists
                if (exerciseInfo) {
                    formContainer.insertBefore(newFields, exerciseInfo);
                } else {
                    formContainer.insertBefore(newFields, formContainer.querySelector('.submit-button'));
                }
            } else if (type === 'weightlifting') {
                const setInputsHTML = `
                    <div class="set-inputs">
                        <h3>Set Details</h3>
                        <div class="set-container">
                            <div class="set-header">
                                <span>Set 1</span>
                                <button type="button" class="remove-set">×</button>
                            </div>
                            <div class="set-details">
                                <div class="form-group">
                                    <label for="weight-1">Weight (${currentUnit})</label>
                                    <input type="number" id="weight-1" min="0" step="${currentUnit === 'kg' ? '1' : '2.5'}" required>
                                </div>
                                <div class="form-group">
                                    <label for="reps-1">Reps</label>
                                    <input type="number" id="reps-1" min="1" required>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="add-set-button">+ Add Another Set</button>
                `;

                const setInputsElement = createElementFromHTML(setInputsHTML);
                
                // Insert the element
                if (exerciseInfo) {
                    formContainer.insertBefore(setInputsElement, exerciseInfo);
                } else {
                    formContainer.insertBefore(setInputsElement, formContainer.querySelector('.submit-button'));
                }
            }
        }
    }

    // Helper function to create element from HTML string
    function createElementFromHTML(htmlString) {
        const div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    }

    // Initialize with weightlifting type
    updateExerciseOptions('weightlifting');

    const streakNotifier = new StreakNotifier();

    // Add this function to update user stats
    function updateUserStats(xpGained, setsCompleted) {
        const userStats = JSON.parse(localStorage.getItem('userStats')) || {
            totalXP: 0,
            todayXP: 0,
            setsCompleted: 0,
            streak: 0,
            lastWorkout: null
        };

        const today = new Date().toDateString();
        const lastWorkoutDate = userStats.lastWorkout ? new Date(userStats.lastWorkout).toDateString() : null;

        // Reset daily stats if it's a new day
        if (lastWorkoutDate !== today) {
            userStats.todayXP = 0;
            userStats.setsCompleted = 0;
        }

        // Update streak
        if (!lastWorkoutDate) {
            userStats.streak = 1;
        } else {
            const dayDiff = (new Date(today) - new Date(lastWorkoutDate)) / (1000 * 60 * 60 * 24);
            if (dayDiff === 1) {
                userStats.streak++;
            } else if (dayDiff > 1) {
                userStats.streak = 1;
            }
        }

        // Update stats
        userStats.totalXP += xpGained;
        userStats.todayXP += xpGained;
        userStats.setsCompleted += setsCompleted;
        userStats.lastWorkout = new Date().toISOString();

        // Save updated stats
        localStorage.setItem('userStats', JSON.stringify(userStats));
    }

    // Add this helper function to save workout history
    function saveWorkoutHistory(exerciseData, weight, xpGained) {
        const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
        
        // Find if there's an existing workout for this exercise today
        const today = new Date().toDateString();
        const existingWorkoutIndex = workoutHistory.findIndex(w => 
            w.exercise === exerciseData.exercise && 
            new Date(w.timestamp).toDateString() === today
        );

        const workoutSet = {
            weight: weight,
            unit: currentUnit,
            reps: exerciseData.reps,
            xp: xpGained
        };

        if (existingWorkoutIndex !== -1) {
            // Add set to existing workout
            workoutHistory[existingWorkoutIndex].sets.push(workoutSet);
        } else {
            // Create new workout entry
            const workout = {
                exercise: exerciseData.exercise,
                type: currentExerciseType,
                timestamp: new Date().toISOString(),
                sets: [workoutSet],
                notes: exerciseData.notes
            };
            workoutHistory.unshift(workout); // Add to start of array
        }

        // Save back to localStorage
        localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
    }

    // Add this function to calculate base XP for exercises
    function calculateBaseXP(exercise, weight, reps, difficulty) {
        let baseXP = 0;
        
        // Base XP for completing a set
        baseXP += 10;

        // XP based on exercise difficulty
        switch (difficulty.toLowerCase()) {
            case 'beginner':
                baseXP += 5;
                break;
            case 'intermediate':
                baseXP += 10;
                break;
            case 'advanced':
                baseXP += 15;
                break;
        }

        // XP based on reps
        if (reps > 0) {
            baseXP += Math.min(Math.floor(reps / 5) * 2, 10); // Cap at 10 XP for reps
        }

        // Additional XP for weighted exercises
        if (weight > 0) {
            // More XP for heavier weights
            baseXP += Math.min(Math.floor(weight / 10) * 2, 20); // Cap at 20 XP for weight
        }

        // Bonus XP for compound exercises
        const compoundExercises = ['squat', 'deadlift', 'bench-press', 'overhead-press', 'pull-up'];
        if (compoundExercises.includes(exercise.toLowerCase())) {
            baseXP *= 1.2; // 20% bonus for compound exercises
        }

        return Math.round(baseXP);
    }

    // Add these functions to calculate XP bonuses
    function calculateStreakBonus(timeSinceLastSet) {
        // If this is the first set or time between sets is too long, no bonus
        if (!timeSinceLastSet || timeSinceLastSet > 300) { // 5 minutes = 300 seconds
            return 0;
        }

        // Optimal rest time is between 60-180 seconds (1-3 minutes)
        if (timeSinceLastSet >= 60 && timeSinceLastSet <= 180) {
            return 5; // Bonus XP for optimal rest time
        }

        // Smaller bonus for close-to-optimal rest time
        if (timeSinceLastSet > 180 && timeSinceLastSet <= 240) {
            return 3;
        }

        // Minimal bonus for other rest times
        return 1;
    }

    function calculateSetBonus(setNumber) {
        // Bonus XP for consistency (completing multiple sets)
        if (setNumber <= 1) return 0;
        
        // Increasing bonus for each additional set, capped at 5 sets
        const bonus = Math.min(setNumber - 1, 4) * 5;
        return bonus;
    }

    // Update the logSet function to store bonus XP information
    async function logSet({ exercise, difficulty, weight, reps, notes, setNumber, timeSinceLastSet }) {
        try {
            // Calculate XP for the set
            const baseXP = calculateBaseXP(exercise, weight, reps, difficulty);
            const streakBonus = calculateStreakBonus(timeSinceLastSet);
            const setBonus = calculateSetBonus(setNumber);
            
            // Calculate total XP
            const totalXP = baseXP + streakBonus + setBonus;

            // Create workout entry
            const workout = {
                exercise,
                type: getExerciseType(exercise),
                sets: [{
                    weight,  // Use the weight passed to the function
                    reps,
                    baseXP,
                    streakBonus,
                    setBonus,
                    xp: totalXP
                }],
                notes,
                timestamp: new Date().toISOString(),
                totalXP
            };

            // Save to workout history
            const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
            const currentWorkout = workoutHistory[0];

            if (currentWorkout && 
                currentWorkout.exercise === exercise && 
                (new Date(currentWorkout.timestamp).getTime() > Date.now() - 30 * 60 * 1000)) {
                // Add to existing workout
                currentWorkout.sets.push({
                    weight: weight,
                    unit: currentUnit,
                    reps: reps,
                    baseXP,
                    streakBonus,
                    setBonus,
                    xp: totalXP
                });
                currentWorkout.totalXP = (currentWorkout.totalXP || 0) + totalXP;
            } else {
                // Create new workout
                workoutHistory.unshift(workout);
            }

            localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
            updateUserStats(totalXP, 1);

            return true;
        } catch (error) {
            console.error('Error logging set:', error);
            throw error;
        }
    }

    // Update the search functionality to use the same key conversion
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const type = currentExerciseType;
        
        // Clear current options
        exerciseSelect.innerHTML = '<option value="">Select an exercise</option>';

        if (searchTerm.length === 0) {
            updateExerciseOptions(type);
            return;
        }

        // Filter exercises based on search
        const popularMatches = exercises[type].popular.filter(exercise => 
            exercise.toLowerCase().includes(searchTerm)
        );
        
        const otherMatches = exercises[type].other.filter(exercise => 
            exercise.toLowerCase().includes(searchTerm)
        );

        // Add matching exercises to select
        if (popularMatches.length > 0) {
            const popularGroup = document.createElement('optgroup');
            popularGroup.label = 'Popular';
            popularMatches.forEach(exercise => {
                const option = document.createElement('option');
                const key = exerciseNameToKey(exercise);
                option.value = key;
                option.textContent = exercise;
                popularGroup.appendChild(option);
            });
            exerciseSelect.appendChild(popularGroup);
        }

        if (otherMatches.length > 0) {
            const otherGroup = document.createElement('optgroup');
            otherGroup.label = 'Other';
            otherMatches.forEach(exercise => {
                const option = document.createElement('option');
                const key = exerciseNameToKey(exercise);
                option.value = key;
                option.textContent = exercise;
                otherGroup.appendChild(option);
            });
            exerciseSelect.appendChild(otherGroup);
        }

        // Show no results message if needed
        if (popularMatches.length === 0 && otherMatches.length === 0) {
            const noResults = document.createElement('option');
            noResults.disabled = true;
            noResults.textContent = 'No matching exercises found';
            exerciseSelect.appendChild(noResults);
        }
    });

    // Update the add set button handler to include unit toggle functionality
    formContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-set-button')) {
            const setInputs = formContainer.querySelector('.set-inputs');
            const setCount = setInputs.querySelectorAll('.set-container').length + 1;
            
            const newSetContainer = document.createElement('div');
            newSetContainer.className = 'set-container';
            newSetContainer.dataset.setNumber = setCount;
            
            const selectedType = document.querySelector('.type-button.active').dataset.type;
            
            newSetContainer.innerHTML = `
                <div class="set-header">
                    <span>Set ${setCount}</span>
                    <button type="button" class="remove-set">×</button>
                </div>
                <div class="set-details">
                    ${selectedType === 'bodyweight' ? `
                        <div class="form-group">
                            <label for="reps-${setCount}">Reps</label>
                            <input type="number" id="reps-${setCount}" min="1" required>
                        </div>
                    ` : `
                        <div class="form-group">
                            <label for="weight-${setCount}">Weight (${currentUnit})</label>
                            <input type="number" id="weight-${setCount}" min="0" step="${currentUnit === 'kg' ? '1' : '0.5'}" required>
                        </div>
                        <div class="form-group">
                            <label for="reps-${setCount}">Reps</label>
                            <input type="number" id="reps-${setCount}" min="1" required>
                        </div>
                    `}
                </div>
            `;

            setInputs.appendChild(newSetContainer);
        }
    });

    // Form submission handler
    exerciseForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submitted!');
        
        try {
            const exerciseSelect = document.getElementById('exercise');
            const selectedExercise = exerciseSelect.value;
            console.log('Selected exercise:', selectedExercise);
            const notes = document.getElementById('notes').value;
            
            // Collect all sets data
            const setContainers = document.querySelectorAll('.set-container');
            const sets = Array.from(setContainers).map((container, index) => {
                const setNumber = index + 1;
                const weight = document.getElementById(`weight-${setNumber}`)?.value || 0;
                const reps = document.getElementById(`reps-${setNumber}`)?.value || 0;
                
                return {
                    weight: {
                        value: parseFloat(weight),
                        unit: currentUnit
                    },
                    reps: parseInt(reps),
                    completed: true
                };
            });

            const workoutData = {
                exercises: [{
                    name: selectedExercise,
                    sets: sets,
                    notes: notes
                }],
                timestamp: new Date(),
                totalVolume: sets.reduce((total, set) => total + (set.weight.value * set.reps), 0),
                xpEarned: 0  // This will be calculated on the server
            };

            console.log('Sending workout data:', JSON.stringify(workoutData, null, 2));

            const response = await fetch(`${authService.baseUrl}/workouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify(workoutData)
            });

            console.log('Response status:', response.status);
            const responseData = await response.json();
            console.log('Response data:', responseData);

            if (response.ok) {
                // Show success notification
                showNotification('Workout logged successfully!', 'success');
                
                // Update workout history and stats
                await authService.fetchUserWorkoutHistory();
                
                // Reset form
                exerciseForm.reset();
                
                // Redirect to dashboard after short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                throw new Error('Failed to save workout');
            }
        } catch (error) {
            console.error('Error saving workout:', error);
            showNotification('Failed to log workout. Please try again.', 'error');
        }
    });

    // Update the ensureExerciseInfo function
    function ensureExerciseInfo() {
        // Go through all exercise types
        Object.keys(exercises).forEach(type => {
            // Process both popular and other exercises
            ['popular', 'other'].forEach(category => {
                exercises[type][category].forEach(exerciseName => {
                    const key = exerciseNameToKey(exerciseName);
                    if (!exerciseInfo[key]) {
                        console.log(`Auto-generating info for: ${exerciseName} (key: ${key})`);
                        // Create basic info for missing exercises
                        exerciseInfo[key] = {
                            name: exerciseName,
                            description: `${exerciseName} exercise`,
                            difficulty: 'Intermediate',
                            muscles: ['Multiple muscle groups'],
                            recommendedReps: type === 'cardio' 
                                ? { min: 15, max: 45, unit: 'minutes' }
                                : { min: 8, max: 12 },
                            tips: [
                                'Maintain proper form',
                                'Control the movement',
                                'Breathe steadily',
                                'Keep core engaged',
                                'Start with lighter weights/easier variations'
                            ]
                        };
                    }
                });
            });
        });
    }

    // Call both functions after defining exerciseInfo
    ensureExerciseInfo();
    validateExerciseKeys();

    // Add this function to update goal progress
    function updateGoalProgress(exercise, sets) {
        const goals = manageGoals(); // First check and reset any expired goals
        const today = new Date().toISOString().split('T')[0];
        let totalGoalXP = 0;
        
        goals.forEach((goal, index) => {
            if (goal.exercise.toLowerCase() === exercise.toLowerCase()) {
                let progress = 0;
                
                switch (goal.metric) {
                    case 'reps':
                        progress = sets.reduce((total, set) => total + set.reps, 0);
                        break;
                    case 'sets':
                        progress = sets.length;
                        break;
                    case 'weight':
                        // Handle both weighted and bodyweight exercises
                        const weights = sets.map(set => set.weight?.value || 0);
                        progress = weights.length > 0 ? Math.max(...weights) : 0;
                        break;
                }

                // Update progress based on goal type
                if (goal.type === 'daily') {
                    if (goal.lastUpdate !== today) {
                        goal.progress = 0;
                    }
                    goal.progress += progress;
                    goal.lastUpdate = today;
                } else {
                    goal.progress += progress;
                }

                // Check if goal was just completed
                if (!goal.completed && goal.progress >= goal.target) {
                    goal.completed = true;
                    goal.completedAt = new Date().toISOString();
                    
                    // Calculate XP bonus based on goal type
                    const xpBonus = calculateGoalXPBonus(goal.type);
                    totalGoalXP += xpBonus;
                    
                    // Show goal completion notification
                    showGoalCompletionNotification(goal, xpBonus);
                }
            }
        });

        localStorage.setItem('workoutGoals', JSON.stringify(goals));
        return totalGoalXP;
    }

    function calculateGoalXPBonus(goalType) {
        switch (goalType) {
            case 'daily':
                return 50;
            case 'weekly':
                return 200;
            case 'monthly':
                return 500;
            default:
                return 0;
        }
    }

    function showGoalCompletionNotification(goal, xpBonus) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        document.body.appendChild(overlay);

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'goal-completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🎯</span>
                <div class="notification-text">
                    <strong>Goal Complete!</strong>
                    <p>${goal.exercise} - ${goal.target} ${goal.metric}</p>
                    <span class="xp-bonus">+${xpBonus} XP Bonus!</span>
                </div>
            </div>
        `;
        document.body.appendChild(notification);

        // Remove notification and overlay after delay
        setTimeout(() => {
            notification.remove();
            overlay.remove();
        }, 3000);
    }

    // Update the form for exercise type function
    function updateFormForExerciseType(type) {
        const setContainers = document.querySelectorAll('.set-container');
        setContainers.forEach(container => {
            const setDetails = container.querySelector('.set-details');
            const setNumber = container.querySelector('.set-header span').textContent.split(' ')[1];
            
            if (type === 'bodyweight') {
                setDetails.innerHTML = `
                    <div class="form-group">
                        <label for="reps-${setNumber}">Reps</label>
                        <input type="number" id="reps-${setNumber}" min="1" required>
                    </div>
                `;
            } else if (type === 'cardio') {
                setDetails.innerHTML = `
                    <div class="form-group">
                        <label for="duration-${setNumber}">Duration (minutes)</label>
                        <input type="number" id="duration-${setNumber}" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="distance-${setNumber}">Distance (km)</label>
                        <input type="number" id="distance-${setNumber}" min="0" step="0.01">
                    </div>
                `;
            } else {
                setDetails.innerHTML = `
                    <div class="form-group">
                        <label for="weight-${setNumber}">Weight (${currentUnit})</label>
                        <input type="number" id="weight-${setNumber}" min="0" step="${currentUnit === 'kg' ? '1' : '0.5'}" required>
                    </div>
                    <div class="form-group">
                        <label for="reps-${setNumber}">Reps</label>
                        <input type="number" id="reps-${setNumber}" min="1" required>
                    </div>
                `;
            }
        });
    }

    // Update exercise select change handler
    exerciseSelect.addEventListener('change', function() {
        const selectedExercise = this.value;
        const exerciseType = getExerciseType(selectedExercise);
        
        typeButtons.forEach(btn => {
            if (btn.dataset.type === exerciseType) {
                btn.click();
            }
        });
    });

    function getExerciseType(exerciseKey) {
        // Map exercise to its type
        const bodyweightExercises = ['push-ups', 'pull-ups', 'dips', 'squats', 'lunges'];
        if (bodyweightExercises.includes(exerciseKey)) {
            return 'bodyweight';
        }
        return 'weightlifting';
    }

    // Add this function where other functions are defined
    function updateSetContainer(container, type) {
        const setDetails = container.querySelector('.set-details');
        const setNumber = container.querySelector('.set-header span').textContent.split(' ')[1];
        
        if (type === 'bodyweight') {
            setDetails.innerHTML = `
                <div class="form-group">
                    <label for="reps-${setNumber}">Reps</label>
                    <input type="number" id="reps-${setNumber}" min="1" required>
                </div>
            `;
        } else if (type === 'cardio') {
            setDetails.innerHTML = `
                <div class="form-group">
                    <label for="duration-${setNumber}">Duration (minutes)</label>
                    <input type="number" id="duration-${setNumber}" min="1" required>
                </div>
                <div class="form-group">
                    <label for="distance-${setNumber}">Distance (km)</label>
                    <input type="number" id="distance-${setNumber}" min="0" step="0.01">
                </div>
            `;
        } else {
            setDetails.innerHTML = `
                <div class="form-group">
                    <label for="weight-${setNumber}">Weight (${currentUnit})</label>
                    <input type="number" id="weight-${setNumber}" min="0" step="${currentUnit === 'kg' ? '1' : '0.5'}" required>
                </div>
                <div class="form-group">
                    <label for="reps-${setNumber}">Reps</label>
                    <input type="number" id="reps-${setNumber}" min="1" required>
                </div>
            `;
        }
    }

    // Update the ensureUserWeight function
    async function ensureUserWeight() {
        // Get fresh preferences from localStorage
        const currentPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
        
        // If weight is already in preferences, use that
        if (currentPreferences.userWeight) {
            preferences.userWeight = currentPreferences.userWeight;
            return currentPreferences.userWeight;
        }

        try {
            // Try to get user info from database
            const userInfo = await authService.getUserInfo();
            
            if (userInfo) {
                // Check both weight locations
                let userWeight = userInfo.weight;  // Check direct weight field
                
                // If no direct weight, check measurements
                if (!userWeight && userInfo.measurements?.weight?.value) {
                    userWeight = userInfo.measurements.weight.value;
                }

                if (userWeight) {
                    // Convert weight if needed based on preferred unit
                    const weightInPreferredUnit = currentPreferences.weightUnit === 'lbs' 
                        ? userWeight * KG_TO_LBS 
                        : userWeight;

                    // Save to preferences
                    currentPreferences.userWeight = weightInPreferredUnit;
                    localStorage.setItem('userPreferences', JSON.stringify(currentPreferences));
                    preferences.userWeight = weightInPreferredUnit;
                    
                    return weightInPreferredUnit;
                }
            }
            
            // If no weight found in either location, prompt user
            const weight = prompt('Please enter your body weight (in ' + currentPreferences.weightUnit + ') for bodyweight exercises:');
            if (weight && !isNaN(weight)) {
                const weightValue = parseFloat(weight);
                currentPreferences.userWeight = weightValue;
                localStorage.setItem('userPreferences', JSON.stringify(currentPreferences));
                preferences.userWeight = weightValue;

                // Save to database (convert to kg if needed)
                const weightInKg = currentPreferences.weightUnit === 'lbs' 
                    ? weightValue * LBS_TO_KG 
                    : weightValue;

                // Update both weight locations
                await authService.updateUserInfo({ 
                    weight: weightInKg,
                    measurements: {
                        weight: {
                            value: weightInKg,
                            unit: 'kg'
                        }
                    }
                });
                
                return weightValue;
            }
        } catch (error) {
            console.error('Error getting user weight:', error);
            // Fall back to prompt if there's an error
            const weight = prompt('Please enter your body weight (in ' + currentPreferences.weightUnit + ') for bodyweight exercises:');
            if (weight && !isNaN(weight)) {
                const weightValue = parseFloat(weight);
                currentPreferences.userWeight = weightValue;
                localStorage.setItem('userPreferences', JSON.stringify(currentPreferences));
                preferences.userWeight = weightValue;
                return weightValue;
            }
        }

        return 0; // Return 0 if all attempts fail
    }

    function toggleTips() {
        const tips = document.querySelector('.form-tips');
        const button = document.querySelector('.show-tips-button');
        if (tips.classList.contains('show')) {
            tips.classList.remove('show');
            button.textContent = 'Show Tips';
        } else {
            tips.classList.add('show');
            button.textContent = 'Hide Tips';
        }
    }
}); 