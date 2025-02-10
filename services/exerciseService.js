class ExerciseService {
    constructor(authService) {
        this.authService = authService;
        this.baseUrl = authService.baseUrl;
        this.exercises = null;
    }

    async getAllExercises() {
        if (this.exercises) {
            return this.exercises;
        }

        try {
            const response = await fetch(`${this.baseUrl}/exercises`, {
                headers: {
                    'Authorization': `Bearer ${this.authService.getToken()}`
                }
            });
            this.exercises = await response.json();
            return this.exercises;
        } catch (error) {
            console.error('Error fetching exercises:', error);
            return [];
        }
    }

    async getExercisesByCategory(category) {
        try {
            console.log('Fetching exercises for category:', category);
            const token = this.authService.getToken();
            console.log('Auth token present:', !!token);
            if (token) {
                console.log('Token starts with:', token.substring(0, 10) + '...');
            }
            
            const response = await fetch(`${this.baseUrl}/exercises/category/${category}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to fetch exercises:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                    url: `${this.baseUrl}/exercises/category/${category}`
                });
                return [];
            }
            const exercises = await response.json();
            console.log(`Found ${exercises.length} exercises for category:`, category);
            return exercises;
        } catch (error) {
            console.error('Error fetching exercises by category:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                url: `${this.baseUrl}/exercises/category/${category}`
            });
            return [];
        }
    }

    async getExerciseById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/exercises/${id}`, {
                headers: {
                    'Authorization': `Bearer ${this.authService.getToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching exercise:', error);
            return null;
        }
    }
} 