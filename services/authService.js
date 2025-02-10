class AuthService {
    constructor() {
        this.baseUrl = 'https://fitness-tracker-api-c4h0.onrender.com/api';
        this.token = localStorage.getItem('token');
    }

    // ... existing methods ...

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

    // ... rest of existing methods ...
} 