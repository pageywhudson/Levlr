class AuthService {
    constructor() {
        this.baseUrl = 'https://fitness-tracker-api-c4h0.onrender.com/api';
        this.token = localStorage.getItem('token');
        // Test that the class is properly defined
        console.log('AuthService initialized with methods:', 
            Object.getOwnPropertyNames(Object.getPrototypeOf(this)));
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    getToken() {
        return localStorage.getItem('token');
    }

    setToken(token) {
        localStorage.setItem('token', token);
        this.token = token;
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            this.setToken(data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('workoutHistory');
        this.token = null;
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async saveWeightRecord(weight, unit) {
        try {
            const response = await fetch(`${this.baseUrl}/users/weight`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify({ weight, unit })
            });

            if (!response.ok) {
                throw new Error('Failed to save weight record');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving weight record:', error);
            throw error;
        }
    }

    async saveUserPreferences(preferences) {
        try {
            const response = await fetch(`${this.baseUrl}/users/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(preferences)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save preferences');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving preferences:', error);
            throw error;
        }
    }

    async getUserPreferences() {
        try {
            const response = await fetch(`${this.baseUrl}/users/preferences`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch preferences');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching preferences:', error);
            throw error;
        }
    }

    async fetchUserWorkoutHistory() {
        try {
            const response = await fetch(`${this.baseUrl}/workouts`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch workout history');
            }

            const workouts = await response.json();
            localStorage.setItem('workoutHistory', JSON.stringify(workouts));
            return workouts;
        } catch (error) {
            console.error('Error fetching workout history:', error);
            throw error;
        }
    }
}

// Make sure AuthService is available globally
if (typeof window !== 'undefined') {
    window.AuthService = AuthService;
}

// Also export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
} 