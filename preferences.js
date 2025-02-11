function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', async function() {
    const authService = new AuthService();
    console.log('AuthService methods:', Object.getOwnPropertyNames(AuthService.prototype));
    console.log('authService instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(authService)));
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        window.location.href = 'index.html';
        return;
    }

    try {
        // Get elements
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        const bodyWeightInput = document.getElementById('bodyWeight');
        const weightUnitSpan = document.querySelector('.weight-unit');
        const saveBtn = document.querySelector('.save-btn');

        if (!toggleBtns.length || !bodyWeightInput || !weightUnitSpan || !saveBtn) {
            throw new Error('Required DOM elements not found');
        }

        // Load current preferences from server, fallback to defaults
        let preferences;
        try {
            console.log('Attempting to get user preferences...');
            console.log('AuthService instance:', authService);
            console.log('Auth token:', authService.getToken());
            preferences = await authService.getUserPreferences();
            console.log('Received preferences:', preferences);
        } catch (error) {
            console.error('Error loading preferences:', error);
            showNotification('Error loading preferences. Using defaults.', 'error');
            preferences = {
                weightUnit: 'kg',
                distanceUnit: 'km',
                bodyWeight: 70
            };
        }
        
        // Keep local storage in sync
        localStorage.setItem('userPreferences', JSON.stringify(preferences));

        // Initialize UI with current preferences
        function updateUI() {
            // Update weight unit buttons
            document.querySelectorAll('[data-unit="kg"], [data-unit="lbs"]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.unit === preferences.weightUnit);
            });

            // Update distance unit buttons
            document.querySelectorAll('[data-unit="km"], [data-unit="mi"]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.unit === preferences.distanceUnit);
            });

            // Update body weight input and unit
            bodyWeightInput.value = preferences.bodyWeight;
            weightUnitSpan.textContent = preferences.weightUnit;
        }

        // Handle unit button clicks
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', async function() {
                const unit = this.dataset.unit;
                const isWeightUnit = ['kg', 'lbs'].includes(unit);
                
                // Remove active class from sibling buttons
                this.parentElement.querySelectorAll('.toggle-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                this.classList.add('active');

                // Update preferences and convert weight if necessary
                if (isWeightUnit) {
                    const oldUnit = preferences.weightUnit;
                    preferences.weightUnit = unit;
                    if (oldUnit !== unit) {
                        preferences.bodyWeight = unit === 'kg' 
                            ? Math.round(preferences.bodyWeight * 0.453592 * 10) / 10
                            : Math.round(preferences.bodyWeight * 2.20462 * 10) / 10;
                    }
                    weightUnitSpan.textContent = unit;
                    bodyWeightInput.value = preferences.bodyWeight;
                } else {
                    preferences.distanceUnit = unit;
                }

                try {
                    // Save to server
                    await authService.saveUserPreferences(preferences);
                    // Update local storage
                    localStorage.setItem('userPreferences', JSON.stringify(preferences));
                    showNotification('Preferences updated successfully!', 'success');
                } catch (error) {
                    console.error('Error saving preferences:', error);
                    showNotification('Failed to save preferences. Please try again.', 'error');
                }
            });
        });

        // Handle unit preference changes
        document.querySelectorAll('input[name="weightUnit"]').forEach(input => {
            input.addEventListener('change', async function() {
                const newUnit = this.value;
                const oldUnit = preferences.weightUnit;
                
                if (newUnit !== oldUnit) {
                    preferences.weightUnit = newUnit;
                    
                    // Convert existing weight if needed
                    if (preferences.bodyWeight) {
                        preferences.bodyWeight = convertWeight(preferences.bodyWeight, oldUnit, newUnit);
                    }
                    
                    // Save preferences
                    localStorage.setItem('userPreferences', JSON.stringify(preferences));
                    
                    // Only save weight record if user weight exists
                    if (preferences.bodyWeight) {
                        try {
                            await authService.saveWeightRecord(preferences.bodyWeight, newUnit);
                            showNotification('Weight unit updated successfully!', 'success');
                        } catch (error) {
                            console.error('Error saving weight record:', error);
                            showNotification('Failed to update weight unit. Please try again.', 'error');
                        }
                    } else {
                        showNotification('Unit preferences updated!', 'success');
                    }
                }
            });
        });

        document.querySelectorAll('input[name="distanceUnit"]').forEach(input => {
            input.addEventListener('change', function() {
                const newUnit = this.value;
                const oldUnit = preferences.distanceUnit;
                
                if (newUnit !== oldUnit) {
                    preferences.distanceUnit = newUnit;
                    
                    // Save preferences
                    localStorage.setItem('userPreferences', JSON.stringify(preferences));
                    
                    showNotification('Distance unit updated successfully!', 'success');
                }
            });
        });

        // Handle save button click
        saveBtn.addEventListener('click', async function() {
            try {
                // Update body weight
                preferences.bodyWeight = parseFloat(bodyWeightInput.value);

                // Save preferences to server
                await authService.saveUserPreferences(preferences);
                
                // Save preferences to localStorage
                localStorage.setItem('userPreferences', JSON.stringify(preferences));

                // Save weight record to database
                await authService.saveWeightRecord(
                    preferences.bodyWeight,
                    preferences.weightUnit
                );

                showNotification('Settings saved successfully!', 'success');
            } catch (error) {
                console.error('Error saving settings:', error);
                showNotification('Failed to save settings. Please try again.', 'error');
            }
        });

        // Initialize UI
        updateUI();
    } catch (error) {
        console.error('Fatal error in preferences.js:', error);
        showNotification('An error occurred loading the preferences page. Please try again.', 'error');
    }
}); 