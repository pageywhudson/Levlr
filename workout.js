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
    // Initialize services
    const achievementService = new AchievementService(authService);
    const achievementChecker = new AchievementChecker(achievementService);
    const exerciseService = new ExerciseService(authService);
    
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
    // Load user preferences
    const preferences = JSON.parse(localStorage.getItem('userPreferences')) || {
        weightUnit: 'kg',
        distanceUnit: 'km',
        userWeight: 0
    };
    let currentUnit = preferences.weightUnit;

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

    // Get DOM elements
    const typeButtons = document.querySelectorAll('.type-button');
    const exerciseSelect = document.getElementById('exercise');
    const formContainer = document.querySelector('.exercise-form-container');
    const searchInput = document.getElementById('exercise-search');
    
    // Track current exercise type
    let currentExerciseType = null;

    // Populate exercise select based on type
    async function populateExerciseSelect(type) {
        // Prevent duplicate population if type hasn't changed
        if (type === currentExerciseType) {
            return;
        }
        currentExerciseType = type;
        
        exerciseSelect.innerHTML = '<option value="">Select an exercise</option>';
        
        try {
            const exercises = await exerciseService.getExercisesByCategory(type);
            console.log('Fetched exercises:', exercises);
            if (!exercises || exercises.length === 0) {
                console.log('No exercises found for category:', type);
                const noExercises = document.createElement('option');
                noExercises.disabled = true;
                noExercises.textContent = 'No exercises found for this category';
                exerciseSelect.appendChild(noExercises);
                return;
            }
            
            const popularExercises = exercises.filter(e => e.type === 'popular');
            const otherExercises = exercises.filter(e => e.type === 'other');
            
            if (exercises.length > 0) {
                // Add popular exercises
                const popularGroup = document.createElement('optgroup');
                popularGroup.label = 'Popular';
                popularExercises.forEach(exercise => {
                    const option = document.createElement('option');
                    option.value = exercise.id;
                    option.textContent = exercise.name;
                    popularGroup.appendChild(option);
                });
                exerciseSelect.appendChild(popularGroup);
                
                // Add other exercises
                const otherGroup = document.createElement('optgroup');
                otherGroup.label = 'Other';
                otherExercises.forEach(exercise => {
                    const option = document.createElement('option');
                    option.value = exercise.id;
                    option.textContent = exercise.name;
                    otherGroup.appendChild(option);
                });
                exerciseSelect.appendChild(otherGroup);
            }
        } catch (error) {
            console.error('Error loading exercises:', error);
            showNotification('Failed to load exercises. Please try again.', 'error');
        }
    }

    // Update exercise info when selected
    exerciseSelect.addEventListener('change', async function() {
        const selectedExercise = await exerciseService.getExerciseById(this.value);
        if (selectedExercise) {
            const infoDiv = document.getElementById('exercise-info');
            infoDiv.classList.remove('hidden');
            
            infoDiv.querySelector('.exercise-description').textContent = selectedExercise.description;
            infoDiv.querySelector('.difficulty-badge').textContent = selectedExercise.difficulty;
            
            // Update recommended reps if available
            if (selectedExercise.recommendedReps) {
                infoDiv.querySelector('.exercise-description').innerHTML += 
                    `<br><br>Recommended reps: ${selectedExercise.recommendedReps.min}-${selectedExercise.recommendedReps.max}`;
            }
        }
    });

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
        
        populateExerciseSelect(type);
        
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
            updateSetContainer(setContainers[0], type);
        }
    }

    // Handle exercise type selection
    typeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            typeButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update exercise list
            populateExerciseSelect(this.dataset.type);
            // Update form fields for the selected type
            updateFormFields(this.dataset.type);
        });
    });

    // Initial population - get the active button's type
    const activeButton = document.querySelector('.type-button.active');
    if (activeButton) {
        populateExerciseSelect(activeButton.dataset.type);
    }

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
        Object.keys(exerciseInfo).forEach(type => {
            ['popular', 'other'].forEach(category => {
                exerciseInfo[type][category].forEach(exerciseName => {
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
        const setInputs = document.querySelector('.set-inputs');
        const setContainers = setInputs.querySelectorAll('.set-container');
        
        setContainers.forEach((container, index) => {
            const setNumber = index + 1;
            const setDetails = container.querySelector('.set-details');
            
            switch(type) {
                case 'cardio':
                    setDetails.innerHTML = `
                        <div class="form-group">
                            <label for="duration-${setNumber}">Duration (minutes)</label>
                            <input type="number" id="duration-${setNumber}" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="distance-${setNumber}">Distance (${preferences.distanceUnit})</label>
                            <input type="number" id="distance-${setNumber}" min="0" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="intensity-${setNumber}">Intensity</label>
                            <select id="intensity-${setNumber}" required>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    `;
                    break;
                case 'bodyweight':
                    setDetails.innerHTML = `
                        <div class="form-group">
                            <label for="reps-${setNumber}">Reps</label>
                            <input type="number" id="reps-${setNumber}" min="1" required>
                        </div>
                    `;
                    break;
                case 'weightlifting':
                default:
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
                    break;
            }
        });
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
    searchInput.addEventListener('input', async function() {
        const searchTerm = this.value.toLowerCase();
        const type = document.querySelector('.type-button.active').dataset.type;
        
        // Clear current options
        exerciseSelect.innerHTML = '<option value="">Select an exercise</option>';

        if (searchTerm.length === 0) {
            updateExerciseOptions(type);
            return;
        }

        // Filter exercises based on search
        const exercises = await exerciseService.getExercisesByCategory(type);
        const filteredExercises = exercises.filter(exercise => 
            exercise.name.toLowerCase().includes(searchTerm)
        );
        
        const popularMatches = filteredExercises.filter(e => e.type === 'popular');
        const otherMatches = filteredExercises.filter(e => e.type === 'other');

        // Add matching exercises to select
        if (popularMatches.length > 0) {
            const popularGroup = document.createElement('optgroup');
            popularGroup.label = 'Popular';
            popularMatches.forEach(exercise => {
                const option = document.createElement('option');
                const key = exerciseNameToKey(exercise.name);
                option.value = key;
                option.textContent = exercise.name;
                popularGroup.appendChild(option);
            });
            exerciseSelect.appendChild(popularGroup);
        }

        if (otherMatches.length > 0) {
            const otherGroup = document.createElement('optgroup');
            otherGroup.label = 'Other';
            otherMatches.forEach(exercise => {
                const option = document.createElement('option');
                const key = exerciseNameToKey(exercise.name);
                option.value = key;
                option.textContent = exercise.name;
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

    // Update the add set button handler
    formContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-set-button')) {
            const setInputs = formContainer.querySelector('.set-inputs');
            const setCount = setInputs.querySelectorAll('.set-container').length + 1;
            
            const newSetContainer = document.createElement('div');
            newSetContainer.className = 'set-container';
            newSetContainer.dataset.setNumber = setCount;
            
            newSetContainer.innerHTML = `
                <div class="set-header">
                    <span>Set ${setCount}</span>
                    <button type="button" class="remove-set">×</button>
                </div>
                <div class="set-details">
                </div>
            `;

            setInputs.appendChild(newSetContainer);
            // Update the fields for the new set
            const selectedType = document.querySelector('.type-button.active').dataset.type;
            updateFormFields(selectedType);
        }
    });

    // Form submission handler
    exerciseForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const exerciseSelect = document.getElementById('exercise');
            const selectedExercise = exerciseSelect.value;
            const notes = document.getElementById('notes').value;
            const exercise = await exerciseService.getExerciseById(selectedExercise);
            
            // Collect all sets data
            const setContainers = document.querySelectorAll('.set-container');
            const sets = Array.from(setContainers).map((container, index) => {
                const setNumber = index + 1;
                const set = {};
                
                switch(exercise.category) {
                    case 'cardio':
                        set.duration = parseInt(document.getElementById(`duration-${setNumber}`).value);
                        set.distance = parseFloat(document.getElementById(`distance-${setNumber}`).value);
                        set.intensity = document.getElementById(`intensity-${setNumber}`).value;
                        break;
                    case 'bodyweight':
                        set.reps = parseInt(document.getElementById(`reps-${setNumber}`).value);
                        break;
                    case 'weightlifting':
                        set.weight = {
                            value: parseFloat(document.getElementById(`weight-${setNumber}`).value),
                            unit: preferences.weightUnit
                        };
                        set.reps = parseInt(document.getElementById(`reps-${setNumber}`).value);
                        break;
                }
                
                set.completed = true;
                return set;
            });

            // Get exercise details
            const workoutData = {
                exercises: [{
                    name: exercise.name,
                    exerciseId: exercise.id,
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
                
                // Check for achievements
                const earnedAchievements = await achievementChecker.checkWorkoutAchievements(workoutData);
                
                // Show achievement notifications
                earnedAchievements.forEach(achievement => {
                    showNotification(
                        `Achievement Unlocked: ${achievement.name}!`,
                        'achievement'
                    );
                });
                
                // Update goals progress
                const goals = JSON.parse(localStorage.getItem('workoutGoals')) || [];
                const updatedGoals = goals.map(goal => {
                    if (goal.exerciseId === selectedExercise) {
                        // Calculate total reps/duration based on exercise type
                        let progress = 0;
                        if (exercise.category === 'cardio' && goal.metric.includes('minutes')) {
                            progress = sets.reduce((total, set) => total + (set.duration || 0), 0);
                        } else {
                            progress = sets.reduce((total, set) => total + set.reps, 0);
                        }
                        
                        goal.progress += progress;
                        
                        // Check if goal is completed
                        if (goal.progress >= goal.target && !goal.completed) {
                            goal.completed = true;
                            goal.completedDate = new Date().toISOString();
                            // Show goal completion notification
                            showNotification(`Goal completed: ${goal.exerciseName}!`, 'success');
                        }
                    }
                    return goal;
                });
                
                // Save updated goals
                localStorage.setItem('workoutGoals', JSON.stringify(updatedGoals));
                
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
        Object.keys(exerciseInfo).forEach(type => {
            // Process both popular and other exercises
            ['popular', 'other'].forEach(category => {
                exerciseInfo[type][category].forEach(exerciseName => {
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
}); 