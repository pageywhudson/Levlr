class ExperienceCalculator {
    // Base XP for completing a set
    static BASE_XP_PER_SET = 10;
    
    // XP multipliers based on difficulty
    static DIFFICULTY_MULTIPLIERS = {
        'Beginner': 1,
        'Intermediate': 1.5,
        'Advanced': 2
    };

    // Calculate XP for a single set
    static calculateSetXP(weight, reps, exerciseDifficulty, bodyWeight) {
        // Calculate volume (weight × reps)
        const volume = weight * reps;
        
        // Calculate relative intensity (weight relative to body weight)
        const relativeIntensity = weight / bodyWeight;
        
        // Get difficulty multiplier
        const difficultyMultiplier = this.DIFFICULTY_MULTIPLIERS[exerciseDifficulty];
        
        // Calculate XP for the set
        const setXP = Math.round(
            this.BASE_XP_PER_SET * 
            (1 + relativeIntensity) * 
            difficultyMultiplier * 
            (1 + Math.log10(volume))
        );
        
        return setXP;
    }

    // Calculate XP required for next level
    static xpForLevel(level) {
        // Formula: 100 * (level^1.8)
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