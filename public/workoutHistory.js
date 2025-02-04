document.addEventListener('DOMContentLoaded', async function() {
    // Create instance of AuthService
    const authService = new AuthService();
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    const historyList = document.querySelector('.history-list');
    const typeFilter = document.getElementById('type-filter');
    const timeFilter = document.getElementById('time-filter');

    // Get workout history from localStorage
    function getWorkoutHistory() {
        return JSON.parse(localStorage.getItem('workoutHistory')) || [];
    }

    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    // Filter workouts based on selected filters
    function filterWorkouts(workouts) {
        const type = typeFilter.value;
        const time = timeFilter.value;
        
        return workouts.filter(workout => {
            // Filter by type
            if (type !== 'all' && workout.type !== type) {
                return false;
            }

            // Filter by time
            const workoutDate = new Date(workout.timestamp);
            const now = new Date();
            
            if (time === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return workoutDate >= weekAgo;
            } else if (time === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return workoutDate >= monthAgo;
            }
            
            return true;
        });
    }

    // Render workout history
    async function renderWorkoutHistory() {
        const workouts = await getWorkoutHistory();
        const filteredWorkouts = filterWorkouts(workouts);
        
        if (filteredWorkouts.length === 0) {
            historyList.innerHTML = `
                <div class="workout-card">
                    <p style="text-align: center; color: #666; margin: 0;">No workouts found</p>
                </div>`;
            return;
        }
        
        historyList.innerHTML = filteredWorkouts.map(workout => renderWorkout(workout)).join('');
    }

    // Add this helper function to convert string to title case
    function toTitleCase(str) {
        // Handle hyphenated words
        return str.split('-')
            .map(word => word
                .toLowerCase()
                .split(' ')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ')
            )
            .join(' ');
    }

    function renderWorkout(workout) {
        // Return HTML string instead of creating DOM element
        return `
            <div class="workout-card">
                <div class="workout-header">
                    <h3>${toTitleCase(workout.exercise)}</h3>
                </div>
                <div class="sets-container">
                    ${workout.sets.map((set, index) => `
                        <div class="set-row">
                            <span>Set ${index + 1}: ${
                                // Only include weight if it exists
                                set.weight?.value 
                                    ? `${set.weight.value}${set.weight.unit} × ` 
                                    : ''
                            }${set.reps} reps</span>
                            <span class="set-xp">+${set.xp} XP</span>
                        </div>
                    `).join('')}
                </div>
                ${workout.goalXP ? `
                    <div class="xp-bonus-section">
                        <span class="xp-icon">🎯</span>
                        <span class="xp-label">Goal Completion Bonus</span>
                        <span class="xp-value">+${workout.goalXP} XP</span>
                    </div>
                ` : ''}
                <div class="total-xp" style="font-weight: bold; font-size: 1.1em; margin-top: 15px;">
                    Total XP: +${workout.totalXP + (workout.goalXP || 0)}
                </div>
                <div class="workout-date" style="color: #666; margin-top: 10px; font-size: 0.9em;">
                    ${formatDate(workout.timestamp)}
                </div>
            </div>
        `;
    }

    // Add filter change handlers
    typeFilter.addEventListener('change', () => renderWorkoutHistory());
    timeFilter.addEventListener('change', () => renderWorkoutHistory());

    // Initial render
    await renderWorkoutHistory();
});

// Function to display workout history
function displayWorkoutHistory() {
    const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    const historyContainer = document.getElementById('workout-history');
    
    if (workoutHistory.length === 0) {
        historyContainer.innerHTML = '<p>No workouts recorded yet.</p>';
        return;
    }

    // Sort workouts by date, most recent first
    workoutHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Clear existing content
    historyContainer.innerHTML = '';

    // Create workout entries
    workoutHistory.forEach(workout => {
        const workoutDate = new Date(workout.timestamp);
        const workoutElement = document.createElement('div');
        workoutElement.className = 'workout-entry';
        
        // Format the workout information as HTML string
        workoutElement.innerHTML = `
            <div class="workout-header">
                <h3>${workout.exercise}</h3>
                <span class="workout-date">${workoutDate.toLocaleDateString()}</span>
            </div>
            <div class="workout-details">
                <div class="sets-info">
                    ${workout.sets.map(set => `
                        <div class="set-info">
                            <span>Set ${set.setNumber}:</span>
                            <span>${set.weight.value} ${set.weight.unit}</span>
                            <span>${set.reps} reps</span>
                        </div>
                    `).join('')}
                </div>
                <div class="xp-info">
                    <span>XP Earned: ${workout.totalXP}</span>
                    ${workout.goalXP ? `<span>Goal Bonus: +${workout.goalXP}XP</span>` : ''}
                </div>
                ${workout.notes ? `<div class="workout-notes">Notes: ${workout.notes}</div>` : ''}
            </div>
        `;

        historyContainer.appendChild(workoutElement);
    });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', displayWorkoutHistory);