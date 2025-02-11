class AuthService {
    constructor() {
        this.baseUrl = 'https://fitness-tracker-api-c4h0.onrender.com/api';
        this.token = localStorage.getItem('token');
        // Test that the class is properly defined
        console.log('AuthService initialized with methods:', 
            Object.getOwnPropertyNames(Object.getPrototypeOf(this)));
    }

    isAuthenticated() {
        const token = this.getToken();
        console.log('Checking authentication. Token exists:', !!token);
        if (token) {
            // Basic JWT validation (check if expired)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const isValid = payload.exp > Date.now() / 1000;
                console.log('Token validation:', {
                    expires: new Date(payload.exp * 1000),
                    isValid
                });
                return isValid;
            } catch (error) {
                console.error('Token validation error:', error);
                return false;
            }
        }
        return false;
    }

    getToken() {
        const token = localStorage.getItem('token');
        console.log('Getting token from localStorage:', token ? token.substring(0, 10) + '...' : 'no token');
        return token;
    }

    setToken(token) {
        localStorage.setItem('token', token);
        this.token = token;
    }

    async login(username, password) {
        try {
            console.log('Attempting login for user:', username);
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            console.log('Login response:', {
                status: response.status,
                ok: response.ok,
                hasToken: !!data.token
            });

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            this.setToken(data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            console.log('Login successful, token saved');
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
            const token = this.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Fetching preferences with token:', token.substring(0, 10) + '...');
            const response = await fetch(`${this.baseUrl}/users/preferences`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Preferences response status:', response.status);
            if (!response.ok) {
                const error = await response.json();
                console.error('Server error response:', error);
                throw new Error(error.message || 'Failed to fetch preferences');
            }

            const data = await response.json();
            console.log('Received preferences data:', data);
            return data;
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