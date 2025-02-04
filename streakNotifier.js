class StreakNotifier {
    constructor() {
        this.container = this.createNotificationContainer();
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.className = 'streak-notifications';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(container);
        return container;
    }

    showStreakBonus(setNumber, xpBonus) {
        const notification = document.createElement('div');
        notification.className = 'streak-notification';
        
        // Get bonus percentage based on set number
        const bonusPercentage = {
            2: '20%',
            3: '50%',
            4: '80%',
            5: '100%'
        }[Math.min(setNumber, 5)];

        notification.innerHTML = `
            <div class="streak-content">
                <span class="streak-icon">🔥</span>
                <span class="streak-text">Set Streak x${setNumber}!</span>
                <span class="streak-bonus">+${bonusPercentage} XP (${xpBonus} bonus XP)</span>
            </div>
        `;

        this.container.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Remove after animation
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
} 