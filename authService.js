class AuthService {
    constructor() {
        // Use production URL when deployed, localhost for development
        this.baseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api'
            : 'https://levlr-api.onrender.com/api';  // Your Render URL
        this.tokenKey = 'authToken';
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
                throw new Error(data.message);
            }

            this.setToken(data.token);
            return data.user;
        } catch (error) {
            throw error;
        }
    }

    async login(username, password) {
        try {
            const isEmail = username.includes('@');
            const credentials = {
                password,
                [isEmail ? 'email' : 'username']: username
            };

            console.log('Attempting login with credentials:', {
                [isEmail ? 'email' : 'username']: username,
                password: '***'
            });

            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin',
                mode: 'cors',
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.message || 'Login failed');
                } catch (e) {
                    throw new Error('Login failed: ' + errorText);
                }
            }

            const data = await response.json();
            this.clearLocalData();
            localStorage.setItem(this.tokenKey, data.token);
            
            const tokenData = this.parseToken(data.token);
            const userData = {
                username: tokenData.username || username,
                email: tokenData.email,
            };
            localStorage.setItem('userData', JSON.stringify(userData));

            localStorage.setItem('userStats', JSON.stringify({
                totalXP: 0,
                todayXP: 0,
                setsCompleted: 0,
                streak: 0,
                lastWorkout: null
            }));

            console.log('About to fetch workout history...');
            await this.fetchUserWorkoutHistory();
            console.log('Workout history fetched');

            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async signup(username, email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) {
                throw new Error('Signup failed');
            }

            const data = await response.json();
            localStorage.setItem(this.tokenKey, data.token);
            
            const tokenData = this.parseToken(data.token);
            const userData = {
                username: tokenData.username,
                email: tokenData.email,
            };
            localStorage.setItem('userData', JSON.stringify(userData));

            return true;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('userStats');
        localStorage.removeItem('workoutHistory');
        localStorage.removeItem('userPreferences');
        
        window.location.href = 'index.html';
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    parseToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error parsing token:', error);
            return {};
        }
    }

    clearLocalData() {
        localStorage.removeItem('userStats');
        localStorage.removeItem('workoutHistory');
        localStorage.removeItem('userPreferences');
    }

    async fetchUserWorkoutHistory() {
        try {
            console.log('Fetching workout history from:', `${this.baseUrl}/workouts`);
            const response = await fetch(`${this.baseUrl}/workouts`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            console.log('Workout history response status:', response.status);
            if (!response.ok) {
                throw new Error('Failed to fetch workout history');
            }

            const workouts = await response.json();
            console.log('Received workouts detailed:', JSON.stringify(workouts, null, 2));
            
            const stats = workouts.reduce((acc, workout) => {
                console.log('Processing workout:', workout);
                console.log('Workout exercises:', workout.exercises);
                
                const workoutXP = workout.xpEarned || 0;
                const today = new Date().toDateString();
                const workoutDate = new Date(workout.timestamp).toDateString();
                
                let setsCompleted = 0;
                if (workout.exercises && Array.isArray(workout.exercises)) {
                    setsCompleted = workout.exercises.reduce((total, ex) => {
                        if (ex.sets && Array.isArray(ex.sets)) {
                            return total + ex.sets.length;
                        }
                        return total;
                    }, 0);
                }

                return {
                    totalXP: acc.totalXP + workoutXP,
                    todayXP: workoutDate === today ? acc.todayXP + workoutXP : acc.todayXP,
                    setsCompleted: acc.setsCompleted + setsCompleted,
                    lastWorkout: workout.timestamp
                };
            }, {
                totalXP: 0,
                todayXP: 0,
                setsCompleted: 0,
                lastWorkout: null
            });

            stats.streak = this.calculateStreak(workouts);
            console.log('Calculated stats:', stats);

            localStorage.setItem('workoutHistory', JSON.stringify(workouts));
            localStorage.setItem('userStats', JSON.stringify(stats));

        } catch (error) {
            console.error('Error fetching workout history:', error);
            console.log('Error workout data:', error.workout);
            localStorage.setItem('workoutHistory', JSON.stringify([]));
            localStorage.setItem('userStats', JSON.stringify({
                totalXP: 0,
                todayXP: 0,
                setsCompleted: 0,
                lastWorkout: null,
                streak: 0
            }));
        }
    }

    calculateStreak(workouts) {
        if (!workouts.length) return 0;

        const dates = workouts.map(w => new Date(w.timestamp).toDateString());
        const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
        
        let streak = 1;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
            return 0;
        }

        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const current = new Date(uniqueDates[i]);
            const prev = new Date(uniqueDates[i + 1]);
            const diffDays = (current - prev) / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    async saveWeightRecord(weight, unit) {
        try {
            const response = await fetch('http://localhost:3000/api/weight-records', {
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

    async getWeightHistory() {
        try {
            const response = await fetch('http://localhost:3000/api/weight-records', {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch weight history');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching weight history:', error);
            throw error;
        }
    }

    async getUserInfo() {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Log the request for debugging
            console.log('Fetching user info with token:', token);

            // You might need to adjust this URL based on your backend routes
            const response = await fetch(`${this.baseUrl}/users/me`, {  // or whatever your actual endpoint is
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch user info');
            }

            const data = await response.json();
            console.log('Received user info:', data);  // Log the response
            return data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    }

    async updateUserInfo(userInfo) {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${this.baseUrl}/user/info`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userInfo)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update user info');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating user info:', error);
            throw error;
        }
    }
} 