document.addEventListener('DOMContentLoaded', async function() {
    // Create instance of AuthService
    const authService = new AuthService();
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.username) {
        console.error('User data not found');
        authService.logout(); // Logout if user data is missing
        return;
    }

    // Update welcome message with actual username
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome back, ${userData.username}!`;
    } else {
        console.error('Welcome message element not found');
    }

    // Add these debug logs
    console.log('User data from localStorage:', userData);
    console.log('Welcome message element:', welcomeMessage);
    console.log('Setting welcome message to:', `Welcome back, ${userData.username}!`);

    // Initialize user stats if not exists
    if (!localStorage.getItem('userStats')) {
        localStorage.setItem('userStats', JSON.stringify({
            totalXP: 0,
            todayXP: 0,
            setsCompleted: 0,
            streak: 0,
            lastWorkout: null
        }));
    }

    // Get user stats
    const userStats = JSON.parse(localStorage.getItem('userStats'));
    if (!userStats) {
        console.error('User stats not found');
        return;
    }

    // Calculate level from total XP
    const level = Math.floor(Math.sqrt(userStats.totalXP / 100)) + 1;
    const xpForCurrentLevel = (level - 1) * (level - 1) * 100;
    const xpForNextLevel = level * level * 100;
    const xpProgress = userStats.totalXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;

    // Update level badge
    document.querySelector('.level-badge').textContent = `Level ${level}`;

    // Update XP progress
    document.querySelector('.progress-info').innerHTML = `
        <span>XP Progress</span>
        <span>${xpProgress}/${xpNeeded} XP</span>
    `;

    // Update progress bar
    const progressPercentage = (xpProgress / xpNeeded) * 100;
    document.querySelector('.progress-fill').style.width = `${progressPercentage}%`;

    // Update today's stats
    document.querySelector('.today-stats .stat-value').textContent = `${userStats.todayXP} XP`;
    document.querySelectorAll('.stat-value')[1].textContent = userStats.setsCompleted;

    // Update streak
    if (userStats.streak > 0) {
        document.querySelector('.streak-badge').textContent = `🔥 ${userStats.streak} day streak`;
    } else {
        document.querySelector('.streak-badge').style.display = 'none';
    }

    // Add logout handler to profile button
    document.querySelector('.profile-button').addEventListener('click', () => {
        authService.logout();
    });

    // Handle Log Workout button click
    document.getElementById('logWorkoutBtn').addEventListener('click', () => {
        window.location.href = 'log-workout.html';
    });

    // Call renderGoals when the page loads
    renderGoals();

    // Load and display achievements
    const achievementService = new AchievementService(authService);
    const achievements = await achievementService.getUserAchievements();
    const achievementsGrid = document.querySelector('.achievements-grid');
    
    if (!achievements.length) {
        achievementsGrid.innerHTML = `
            <div class="empty-achievements">
                <p>No achievements yet. Start logging workouts to earn badges!</p>
            </div>
        `;
    } else {
        achievementsGrid.innerHTML = achievements.map(achievement => {
            const achievementConfig = ACHIEVEMENTS[achievement.achievementId];
            return `
                <div class="achievement-card">
                    <img src="${achievementConfig.icon}" alt="${achievementConfig.name}" class="achievement-icon">
                    <div class="achievement-name">${achievementConfig.name}</div>
                    <div class="achievement-date">Earned ${new Date(achievement.earnedDate).toLocaleDateString()}</div>
                </div>
            `;
        }).join('');
    }
});

// Update the renderGoals function
function renderGoals() {
    let goals = [];
    try {
        goals = JSON.parse(localStorage.getItem('workoutGoals')) || [];
    } catch (error) {
        console.error('Error parsing goals:', error);
        goals = [];
    }

    const goalsList = document.querySelector('.goals-list');
    
    if (!goals || goals.length === 0) {
        goalsList.innerHTML = `
            <div class="goal-item" style="text-align: center;">
                <p class="no-goals" style="color: #666;">No active goals. 
                    <a href="goals.html" style="color: #6b46c1; text-decoration: none;">Set some goals</a> 
                    to track your progress!
                </p>
            </div>`;
        return;
    }

    goalsList.innerHTML = goals.map(goal => {
        const progress = calculateGoalProgress(goal);
        
        // Format the due date based on goal type
        let dueDate;
        if (goal.type === 'daily') {
            dueDate = 'Today';
        } else if (goal.type === 'weekly') {
            // Calculate due date as 7 days from creation
            const createdDate = new Date(goal.createdAt);
            const dueDateTime = new Date(createdDate.getTime() + (7 * 24 * 60 * 60 * 1000));
            dueDate = `Due ${dueDateTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })}`;
        } else {
            // Fallback for any other type
            dueDate = `Created ${new Date(goal.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })}`;
        }

        return `
            <div class="goal-item">
                <div class="goal-header">
                    <div class="goal-title">${goal.exercise}</div>
                    <div class="goal-progress-text">
                        ${goal.progress || 0} / ${goal.target} ${goal.metric}
                    </div>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="goal-due-date">${dueDate}</div>
            </div>
        `;
    }).join('');
}

// Update the calculateGoalProgress function to be more robust
function calculateGoalProgress(goal) {
    try {
        const completed = Number(goal.progress) || 0;
        const target = Number(goal.target) || 1;
        return Math.min((completed / target) * 100, 100);
    } catch (error) {
        console.error('Error calculating progress:', error, goal);
        return 0;
    }
}

// Update goals progress
function updateGoalsProgress() {
    const goals = JSON.parse(localStorage.getItem('workoutGoals')) || [];
    const workouts = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    
    goals.forEach(goal => {
        // Reset progress
        goal.progress = 0;
        
        // Calculate progress from all relevant workouts
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (exercise.name === goal.exercise) {
                    goal.progress += exercise.sets.reduce((total, set) => total + set.reps, 0);
                }
            });
        });
        
        // Update progress display
        const goalElement = document.querySelector(`[data-goal-id="${goal.id}"]`);
        if (goalElement) {
            const progressBar = goalElement.querySelector('.goal-progress-bar');
            const progressText = goalElement.querySelector('.goal-progress-text');
            const percentage = Math.min((goal.progress / goal.target) * 100, 100);
            
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${goal.progress}/${goal.target} ${goal.unit}`;
        }
    });
    
    // Save updated goals
    localStorage.setItem('workoutGoals', JSON.stringify(goals));
} 