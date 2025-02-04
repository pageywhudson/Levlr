document.addEventListener('DOMContentLoaded', function() {
    const authService = new AuthService();
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Get elements
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const bodyWeightInput = document.getElementById('bodyWeight');
    const weightUnitSpan = document.querySelector('.weight-unit');
    const saveBtn = document.querySelector('.save-btn');

    // Load current preferences
    const preferences = JSON.parse(localStorage.getItem('userPreferences')) || {
        weightUnit: 'kg',
        distanceUnit: 'km',
        bodyWeight: 70
    };

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
        btn.addEventListener('click', function() {
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
        });
    });

    // Handle save button click
    saveBtn.addEventListener('click', async function() {
        try {
            // Update body weight
            preferences.bodyWeight = parseFloat(bodyWeightInput.value);

            // Save preferences to localStorage
            localStorage.setItem('userPreferences', JSON.stringify(preferences));

            // Save weight record to database
            await authService.saveWeightRecord(
                preferences.bodyWeight,
                preferences.weightUnit
            );

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Settings saved successfully!';
            document.body.appendChild(successMessage);

            // Remove success message after 2 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 2000);
        } catch (error) {
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Failed to save settings. Please try again.';
            document.body.appendChild(errorMessage);

            setTimeout(() => {
                errorMessage.remove();
            }, 2000);
        }
    });

    // Initialize UI
    updateUI();
}); 