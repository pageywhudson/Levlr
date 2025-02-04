document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.signup-form');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const username = document.getElementById('username');

    // Password validation feedback
    const createPasswordFeedback = () => {
        const feedback = document.createElement('div');
        feedback.className = 'password-requirements';
        feedback.innerHTML = `
            <p>Password must contain:</p>
            <ul>
                <li data-requirement="length">At least 8 characters</li>
                <li data-requirement="lowercase">One lowercase letter</li>
                <li data-requirement="uppercase">One uppercase letter</li>
                <li data-requirement="number">One number</li>
            </ul>
        `;
        password.parentNode.appendChild(feedback);
        return feedback;
    };

    const passwordFeedback = createPasswordFeedback();

    // Real-time password validation
    password.addEventListener('input', function() {
        const requirements = {
            length: this.value.length >= 8,
            lowercase: /[a-z]/.test(this.value),
            uppercase: /[A-Z]/.test(this.value),
            number: /\d/.test(this.value)
        };

        Object.entries(requirements).forEach(([requirement, isValid]) => {
            const li = passwordFeedback.querySelector(`[data-requirement="${requirement}"]`);
            li.className = isValid ? 'valid' : 'invalid';
        });
    });

    // Password confirmation validation
    confirmPassword.addEventListener('input', function() {
        if (this.value === password.value) {
            this.setCustomValidity('');
            this.classList.add('valid');
            this.classList.remove('invalid');
        } else {
            this.setCustomValidity('Passwords do not match');
            this.classList.add('invalid');
            this.classList.remove('valid');
        }
    });

    // Username availability check (simulated)
    let usernameTimeout;
    username.addEventListener('input', function() {
        clearTimeout(usernameTimeout);
        
        if (this.value.length < 3) return;

        usernameTimeout = setTimeout(() => {
            // Simulate API call to check username availability
            const isAvailable = !['admin', 'test', 'user'].includes(this.value.toLowerCase());
            
            if (isAvailable) {
                this.setCustomValidity('');
                this.classList.add('valid');
                this.classList.remove('invalid');
            } else {
                this.setCustomValidity('Username is already taken');
                this.classList.add('invalid');
                this.classList.remove('valid');
            }
        }, 500);
    });

    // Unit conversion functionality
    const unitToggles = document.querySelectorAll('.unit-toggle');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');

    const conversions = {
        height: {
            imperial: {
                unit: 'in',
                min: 48,
                max: 96,
                step: 0.5,
                toMetric: value => value * 2.54,
                label: 'Switch to cm'
            },
            metric: {
                unit: 'cm',
                min: 120,
                max: 245,
                step: 1,
                toImperial: value => value / 2.54,
                label: 'Switch to in'
            }
        },
        weight: {
            imperial: {
                unit: 'lbs',
                min: 50,
                max: 500,
                step: 0.1,
                toMetric: value => value * 0.453592,
                label: 'Switch to kg'
            },
            metric: {
                unit: 'kg',
                min: 23,
                max: 227,
                step: 0.1,
                toImperial: value => value / 0.453592,
                label: 'Switch to lbs'
            }
        }
    };

    unitToggles.forEach(toggle => {
        const measurementType = toggle.dataset.unit;
        const input = measurementType === 'height' ? heightInput : weightInput;
        let isMetric = false;

        toggle.addEventListener('click', () => {
            const currentValue = parseFloat(input.value) || 0;
            const unitSpan = toggle.parentElement.querySelector('.unit');
            
            if (isMetric) {
                // Convert to Imperial
                if (currentValue) {
                    input.value = roundToStep(
                        conversions[measurementType].metric.toImperial(currentValue),
                        conversions[measurementType].imperial.step
                    );
                }
                input.min = conversions[measurementType].imperial.min;
                input.max = conversions[measurementType].imperial.max;
                input.step = conversions[measurementType].imperial.step;
                unitSpan.textContent = conversions[measurementType].imperial.unit;
                toggle.textContent = conversions[measurementType].imperial.label;
            } else {
                // Convert to Metric
                if (currentValue) {
                    input.value = roundToStep(
                        conversions[measurementType].imperial.toMetric(currentValue),
                        conversions[measurementType].metric.step
                    );
                }
                input.min = conversions[measurementType].metric.min;
                input.max = conversions[measurementType].metric.max;
                input.step = conversions[measurementType].metric.step;
                unitSpan.textContent = conversions[measurementType].metric.unit;
                toggle.textContent = conversions[measurementType].metric.label;
            }
            
            isMetric = !isMetric;
        });
    });

    // Helper function to round to nearest step
    function roundToStep(number, step) {
        return Math.round(number / step) * step;
    }

    // Create an instance of AuthService
    const authService = new AuthService();

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            return;
        }

        const heightToggle = document.querySelector('[data-unit="height"]');
        const weightToggle = document.querySelector('[data-unit="weight"]');

        const submitButton = form.querySelector('.signup-button');
        const originalText = submitButton.textContent;
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Account...';

            const formData = {
                username: username.value,
                fullName: document.getElementById('fullname').value,
                email: document.getElementById('email').value,
                password: password.value,
                height: {
                    value: document.getElementById('height').value,
                    unit: heightToggle.textContent.includes('cm') ? 'in' : 'cm'
                },
                weight: {
                    value: document.getElementById('weight').value,
                    unit: weightToggle.textContent.includes('kg') ? 'lbs' : 'kg'
                }
            };

            const user = await authService.register(formData);
            window.location.href = 'dashboard.html';
        } catch (error) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            form.insertBefore(errorMessage, submitButton);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}); 