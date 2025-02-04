class WorkoutService {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:3000/api/workouts';
        this.authService = new AuthService();
    }

    async logWorkout(workoutData) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.authService.getAuthHeader()
                },
                body: JSON.stringify(workoutData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async getWorkouts() {
        try {
            const response = await fetch(this.baseUrl, {
                headers: this.authService.getAuthHeader()
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
} 