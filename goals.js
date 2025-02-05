document.addEventListener('DOMContentLoaded', function() {
    const authService = new AuthService();
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const addGoalButton = document.querySelector('.add-goal-button');
    const modal = document.getElementById('addGoalModal');
    const goalForm = document.getElementById('goalForm');
    const cancelButton = document.querySelector('.cancel-btn');
    const exerciseSelect = document.getElementById('exercise');
    const targetMetricSelect = document.getElementById('targetMetric');
    const goalsList = document.querySelector('.goals-list');

    // Load exercises from workout.js
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
                'Elliptical',
                'Stair Climber',
                'Hiking',
                'Boxing',
                'Dancing',
                'HIIT',
                'Cross Trainer',
                'Battle Ropes',
                'Jumping Jacks'
            ]
        }
    };

    // Populate exercise select
    function populateExerciseSelect() {
        exerciseSelect.innerHTML = '<option value="">Select an exercise</option>';
        
        Object.keys(exercises).forEach(type => {
            // Create type group
            const typeGroup = document.createElement('optgroup');
            typeGroup.label = type.charAt(0).toUpperCase() + type.slice(1);
            
            // Add popular exercises first
            exercises[type].popular.forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise.toLowerCase().replace(/\s+/g, '-');
                option.textContent = exercise;
                typeGroup.appendChild(option);
            });
            
            // Then add other exercises
            exercises[type].other.forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise.toLowerCase().replace(/\s+/g, '-');
                option.textContent = exercise;
                typeGroup.appendChild(option);
            });
            exerciseSelect.appendChild(typeGroup);
        });
    }

    // Update metric options based on selected exercise
    function updateMetricOptions(exerciseType) {
        const cardioExercises = ['running', 'cycling', 'swimming', 'walking', 'rowing'];
        const isCardio = cardioExercises.includes(exerciseType.toLowerCase());

        // Clear existing options
        targetMetricSelect.innerHTML = '';

        if (isCardio) {
            // Add distance options
            const distanceOptgroup = document.createElement('optgroup');
            distanceOptgroup.label = 'Distance';
            
            const distanceOptions = [
                { value: 'km', text: 'Kilometers' },
                { value: 'miles', text: 'Miles' }
            ];
            
            distanceOptions.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.text;
                distanceOptgroup.appendChild(opt);
            });
            
            targetMetricSelect.appendChild(distanceOptgroup);

            // Add time options
            const timeOptgroup = document.createElement('optgroup');
            timeOptgroup.label = 'Time';
            
            const timeOptions = [
                { value: 'minutes', text: 'Minutes' },
                { value: 'hours', text: 'Hours' }
            ];
            
            timeOptions.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.text;
                timeOptgroup.appendChild(opt);
            });
            
            targetMetricSelect.appendChild(timeOptgroup);
        } else {
            // Default options for strength exercises
            const options = [
                { value: 'reps', text: 'Reps' },
                { value: 'sets', text: 'Sets' }
            ];
            
            options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.text;
                targetMetricSelect.appendChild(opt);
            });
        }
    }

    // Add these helper functions at the top of your file
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

    // Add this function to manage goals
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

    // Modify your loadGoals function
    function loadGoals() {
        const goals = JSON.parse(localStorage.getItem('workoutGoals')) || [];
        renderGoals(goals);
    }

    // Render goals to the page
    function renderGoals(goals) {
        if (goals.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-state">
                    <p>No goals set yet. Click the button above to add your first goal!</p>
                </div>
            `;
            return;
        }

        goalsList.innerHTML = goals.map((goal, index) => `
            <div class="goal-card">
                <div class="goal-header">
                    <h3>${goal.exercise}</h3>
                    <span class="goal-type-badge">${goal.type}</span>
                </div>
                <div class="goal-details">
                    <div class="goal-target">
                        <span class="label">Target:</span>
                        <span class="value">${goal.target} ${goal.metric}</span>
                    </div>
                    <div class="goal-progress">
                        <span class="label">Progress:</span>
                        <span class="value">${goal.progress || 0} ${goal.metric}</span>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="delete-goal" data-index="${index}">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Event Listeners
    addGoalButton.addEventListener('click', () => {
        modal.style.display = 'block';
        populateExerciseSelect();
    });

    cancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
        goalForm.reset();
    });

    // Handle form submission
    goalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const exercise = document.getElementById('exercise').value;
        const goalType = document.getElementById('goalType').value;
        const target = parseInt(document.getElementById('target').value);
        const metric = document.getElementById('metric').value;

        // Create new goal object
        const newGoal = {
            id: Date.now().toString(),
            exercise: exercise,
            type: goalType,
            target: target,
            metric: metric,
            progress: 0,
            createdAt: new Date().toISOString(),
            completed: false
        };

        // Get existing goals
        const goals = JSON.parse(localStorage.getItem('workoutGoals')) || [];
        
        // Add new goal
        goals.push(newGoal);
        
        // Save updated goals
        localStorage.setItem('workoutGoals', JSON.stringify(goals));

        // Hide modal and reset form
        modal.style.display = 'none';
        goalForm.reset();

        // Refresh goals display with updated goals
        loadGoals();
    });

    goalsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-goal')) {
            const index = e.target.dataset.index;
            const goals = JSON.parse(localStorage.getItem('workoutGoals')) || [];
            goals.splice(index, 1);
            localStorage.setItem('workoutGoals', JSON.stringify(goals));
            loadGoals();
        }
    });

    // Add event listener for exercise selection
    exerciseSelect.addEventListener('change', (e) => {
        updateMetricOptions(e.target.value);
    });

    // Initialize
    populateExerciseSelect();
    loadGoals();
    updateMetricOptions(exerciseSelect.value);
}); 