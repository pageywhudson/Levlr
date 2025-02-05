class ExperienceCalculator {
    constructor() {
        this.baseXP = 10;  // Base XP for completing a set
        this.difficultyMultipliers = {
            'Beginner': 0.8,
            'Intermediate': 1.0,
            'Advanced': 1.2
        };
    }

    calculateSetXP({ exercise, weight, reps, difficulty = 'Intermediate' }) {
        // Base calculation
        let xp = this.baseXP;

        // Add XP based on reps
        xp += reps;

        // Add XP based on weight if applicable
        if (weight > 0) {
            xp += Math.floor(weight / 10);  // 1 XP per 10 units of weight
        }

        // Apply difficulty multiplier
        const multiplier = this.difficultyMultipliers[difficulty] || 1.0;
        xp = Math.floor(xp * multiplier);

        return xp;
    }

    // New constants for set streaks
    static SET_STREAK_WINDOW = 180; // 3 minutes in seconds
    static SET_STREAK_MULTIPLIERS = {
        2: 1.2,  // 2nd set: 20% bonus
        3: 1.5,  // 3rd set: 50% bonus
        4: 1.8,  // 4th set: 80% bonus
        5: 2.0   // 5th+ set: 100% bonus
    };

    // Calculate total workout XP
    static calculateWorkoutXP(exercises, bodyWeight) {
        let totalXP = 0;
        
        exercises.forEach(exercise => {
            let lastSetTime = null;
            let setStreak = 1;

            exercise.sets.forEach((set, index) => {
                // Calculate time since last set
                const timeSinceLastSet = lastSetTime ? 
                    (new Date(set.timestamp) - new Date(lastSetTime)) / 1000 : 
                    null;

                // Update streak counter
                if (timeSinceLastSet !== null && timeSinceLastSet <= this.SET_STREAK_WINDOW) {
                    setStreak++;
                } else {
                    setStreak = 1;
                }

                const setXP = this.calculateSetXP(
                    set.weight.value,
                    set.reps,
                    exercise.difficulty,
                    bodyWeight,
                    setStreak,
                    timeSinceLastSet
                );

                totalXP += setXP;
                lastSetTime = set.timestamp;
            });
        });
        
        return Math.round(totalXP);
    }

    // Calculate XP required for next level
    static xpForLevel(level) {
        // Formula: 100 * (level^1.8)
        // Level 1 -> 100 XP
        // Level 2 -> 348 XP
        // Level 5 -> 1,737 XP
        // Level 10 -> 6,310 XP
        // Level 20 -> 22,908 XP
        return Math.round(100 * Math.pow(level, 1.8));
    }

    // Calculate total XP needed from level 1 to target level
    static totalXPForLevel(level) {
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += this.xpForLevel(i);
        }
        return total;
    }

    // Calculate level from total XP
    static getLevelFromXP(totalXP) {
        let level = 1;
        while (this.totalXPForLevel(level + 1) <= totalXP) {
            level++;
        }
        return level;
    }

    // Get progress towards next level
    static getLevelProgress(totalXP) {
        const currentLevel = this.getLevelFromXP(totalXP);
        const currentLevelXP = this.totalXPForLevel(currentLevel);
        const nextLevelXP = this.totalXPForLevel(currentLevel + 1);
        
        return {
            level: currentLevel,
            currentXP: totalXP - currentLevelXP,
            requiredXP: nextLevelXP - currentLevelXP,
            percentage: ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
        };
    }
}

module.exports = ExperienceCalculator; 