class AchievementService {
    constructor(authService) {
        this.authService = authService;
        this.baseUrl = authService.baseUrl;
    }

    async getUserAchievements() {
        try {
            const response = await fetch(`${this.baseUrl}/achievements`, {
                headers: {
                    'Authorization': `Bearer ${this.authService.getToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }
    }

    async awardAchievement(achievementId) {
        try {
            const response = await fetch(`${this.baseUrl}/achievements`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authService.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ achievementId })
            });
            return await response.json();
        } catch (error) {
            console.error('Error awarding achievement:', error);
            return null;
        }
    }
} 