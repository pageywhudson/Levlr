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
            const response = await fetch(`${this.baseUrl}/exercises/category/${category}`, {
                headers: {
                    'Authorization': `Bearer ${this.authService.getToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching exercises by category:', error);
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